## REACT CC AUDIO RECORDER

<img src="https://img.shields.io/badge/version-1.0.0-4CAF50"/>

## Installation

```sh
npm install react-cc-audio-recorder
```

or

```sh
yarn add react-cc-audio-recorder
```

## Usage

```tsx
import { StartRecorder, StopRecorder } from "react-cc-audio-recorder";

const start = () => {
  StartRecorder();
};

const stop = () => {
  StopRecorder((event) => {
    console.log("event: ", event);
    // Your code..
  });
};
```

or

```tsx
import Recorder from "react-cc-audio-recorder";

const start = () => {
  Recorder.start();
};

const stop = () => {
  Recorder.stop((event) => {
    console.log("event: ", event);
    // Your code..
  });
};
```

## Contribute

- _Thank you so much for helping me complete this project!_
- Source: http://danml.com/js/recaudio.js
- Refer: http://typedarray.org/wp-content/projects/WebAudioRecorder

## Contact

- Telegram: https://t.me/baochau9xx
- Facebook: https://facebook.com/baochau9xx
- Mail: chau.02it@gmail.com

## Keyword

- audio-recorder, react-audio-recorder, recorder
- audioRecorder, reactAudioRecorder, Recorder
- record-audio, recordAudio, Audio
- baochau, baochau9xx
