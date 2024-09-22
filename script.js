// ==UserScript==
// @name         ytkb
// @namespace    http://violentmonkey.net/
// @version      0.1
// @description  Add custom keyboard shortcuts for YouTube navigation
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const SEEK_TIME = 5; // Seconds to seek forward/backward
  const VOLUME_CHANGE = 5; // Percentage to change volume

  document.addEventListener('keydown', function (e) {
    // Only trigger if not typing in an input field
    if (e.target.tagName.toLowerCase() !== 'input' && e.target.tagName.toLowerCase() !== 'textarea') {
      const video = document.querySelector('video');
      if (!video) return;

      console.log("CLICK", e.key);
      let handled = true;

      switch (e.key.toLowerCase()) {
        case 'h': // Rewind
          video.currentTime = Math.max(0, video.currentTime - SEEK_TIME);
          break;
        case 'j': // Volume down
          video.volume = Math.max(0, video.volume - (VOLUME_CHANGE / 100));
          break;
        case 'k': // Volume up
          video.volume = Math.min(1, video.volume + (VOLUME_CHANGE / 100));
          break;
        case 'l': // Forward
          video.currentTime = Math.min(video.duration, video.currentTime + SEEK_TIME);
          break;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, true);
})();