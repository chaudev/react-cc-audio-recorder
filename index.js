// Since 2022
// Source: http://danml.com/js/recaudio.js
// Refer: http://typedarray.org/wp-content/projects/WebAudioRecorder
// Power by Nguyen Chau

// @ts-nocheck

var Recorder = (function () {
  // variables
  var leftchannel = [],
    rightchannel = [],
    recorder = null,
    recording = !1,
    recordingLength = 0,
    volume = null,
    audioInput = null,
    sampleRate = null,
    audioContext = null,
    context = null,
    outputElement = {};

  function startRecording() {
    // feature detection
    if (!window?.navigator?.getUserMedia)
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

    if (!!navigator && navigator?.getUserMedia) {
      navigator.getUserMedia({ audio: true }, success, function (e) {
        alert("Error capturing audio.");
      });
    } else if (!!navigator?.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((mediaStream) => success(mediaStream))
        .catch((err) => console.error(`${err.name}: ${err.message}`));
    } else alert("Audio not supported in this browser.");

    recording = true;
    // reset the buffers for the new recording
    leftchannel.length = rightchannel.length = 0;
    recordingLength = 0;
    outputElement.innerHTML = "Recording now...";
    // if S is pressed, we stop the recording and package the WAV file
  }

  function closeMic() {
    audioInput?.mediaStream?.getAudioTracks().forEach(function (track) {
      track.stop();
    });

    recorder.disconnect(0);
    audioInput.disconnect(0);
    volume.disconnect(0);
  }

  function stopRecording(callBack) {
    // we stop recording
    recording = false;

    outputElement.innerHTML = "Building wav file...";

    // we flat the left and right channels down
    var leftBuffer = mergeBuffers(leftchannel, recordingLength);
    var rightBuffer = mergeBuffers(rightchannel, recordingLength);
    // we interleave both channels together
    var interleaved = interleave(leftBuffer, rightBuffer);

    // we create our wav file
    var buffer = new ArrayBuffer(44 + interleaved.length * 2);
    var view = new DataView(buffer);

    // RIFF chunk descriptor
    writeUTFBytes(view, 0, "RIFF");
    view.setUint32(4, 44 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, "WAVE");
    // FMT sub-chunk
    writeUTFBytes(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    // stereo (2 channels)
    view.setUint16(22, 2, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    // data sub-chunk
    writeUTFBytes(view, 36, "data");
    view.setUint32(40, interleaved.length * 2, true);

    // write the PCM samples
    var lng = interleaved.length;
    var index = 44;
    var volume = 1;
    for (var i = 0; i < lng; i++) {
      view.setInt16(index, interleaved[i] * (0x7fff * volume), true);
      index += 2;
    }

    // our final binary blob
    var blob = new Blob([view], { type: "audio/wav" });

    // let's save it locally
    outputElement.innerHTML = "Handing off the file now...";
    var url = (window.URL || window.webkitURL).createObjectURL(blob);

    recording = false;

    closeMic();

    callBack({
      url,
      blob,
      power: "https://ischau.org",
      timeStamp: new Date().getTime(),
    });
  }

  function interleave(leftChannel, rightChannel) {
    var length = leftChannel.length + rightChannel.length;
    var result = new Float32Array(length);

    var inputIndex = 0;

    for (var index = 0; index < length; ) {
      result[index++] = leftChannel[inputIndex];
      result[index++] = rightChannel[inputIndex];
      inputIndex++;
    }
    return result;
  }

  function mergeBuffers(channelBuffer, recordingLength) {
    var result = new Float32Array(recordingLength);
    var offset = 0;
    var lng = channelBuffer.length;
    for (var i = 0; i < lng; i++) {
      var buffer = channelBuffer[i];
      result.set(buffer, offset);
      offset += buffer.length;
    }
    return result;
  }

  function writeUTFBytes(view, offset, string) {
    var lng = string.length;
    for (var i = 0; i < lng; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  function success(e) {
    // creates the audio context
    audioContext = window.AudioContext || window.webkitAudioContext;
    context = new audioContext();

    sampleRate = context.sampleRate;

    // creates a gain node
    volume = context.createGain();

    // creates an audio node from the microphone incoming stream
    audioInput = context.createMediaStreamSource(e);

    // connect the stream to the gain node
    audioInput.connect(volume);

    /* From the spec: This value controls how frequently the audioprocess event is 
    dispatched and how many sample-frames need to be processed each call. 
    Lower values for buffer size will result in a lower (better) latency. 
    Higher values will be necessary to avoid audio breakup and glitches */
    var bufferSize = 2048;
    recorder = context.createScriptProcessor(bufferSize, 2, 2);

    recorder.onaudioprocess = function (e) {
      if (!recording) return;
      var left = e.inputBuffer.getChannelData(0);
      var right = e.inputBuffer.getChannelData(1);
      // we clone the samples
      leftchannel.push(new Float32Array(left));
      rightchannel.push(new Float32Array(right));
      recordingLength += bufferSize;
    };

    // we connect the recorder
    volume.connect(recorder);
    recorder.connect(context.destination);
  }

  return {
    start: startRecording,
    stop: stopRecording,
  };
})();

export default Recorder;
