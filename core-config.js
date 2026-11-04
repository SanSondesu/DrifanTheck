(function (global) {
 'use strict';
 global.DrifanConfig = Object.freeze({
  storage: { key: 'drifantheck-save-v1', version: 1 },
  limits: { maxPlayerBottles: 40, pixelRatio: 2, maxFrameDelta: 0.05 },
  timing: { uiHideDelay: 4000, previewResizeDelay: 20 },
  audio: { waveIntervalMin: 6600, waveIntervalRange: 1000 },
  world: { waterTextureSize: 256, defaultTimeProgress: 17.5 / 24 }
 });
})(window);
