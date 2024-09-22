// ==UserScript==
// @name         ytkb
// @namespace    http://violentmonkey.net/
// @version      0.1
// @description  Add custom keyboard shortcuts for YouTube navigation with UI feedback
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(() => {
  const SEEK_TIME = 5; // Seconds to seek forward/backward
  const VOLUME_CHANGE = 5; // Percentage to change volume

  // Function to create and insert UI element
  function createUIElement() {
    const uiElement = document.createElement('div');
    uiElement.id = 'ytkb-ui';
    uiElement.style.cssText = `
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: Roboto, Arial, sans-serif;
      font-size: 14px;
      z-index: 9999;
      display: none;
    `;

    // Find YouTube's player container and insert our UI
    const playerContainer = document.getElementById('movie_player');
    if (playerContainer) {
      playerContainer.appendChild(uiElement);
    } else {
      // Fallback to body if player container is not found
      document.body.appendChild(uiElement);
    }

    return uiElement;
  }

  let uiElement;

  // Function to show UI feedback
  function showUIFeedback(message) {
    if (!uiElement) {
      uiElement = createUIElement();
    }
    uiElement.textContent = message;
    uiElement.style.display = 'block';
    setTimeout(() => {
      uiElement.style.display = 'none';
    }, 1500);
  }

  document.addEventListener('keydown', (e) => {
    // Only trigger if not typing in an input field
    if (e.target.tagName.toLowerCase() !== 'input' && e.target.tagName.toLowerCase() !== 'textarea') {
      const video = document.querySelector('video');
      if (!video) return;

      let handled = true;
      let feedbackMessage = '';
      const ctrl = e.ctrlKey;

      switch (e.key.toLowerCase()) {
        case 'h': { // Rewind
          const seekBackward = ctrl ? SEEK_TIME * 2 : SEEK_TIME;
          video.currentTime = Math.max(0, video.currentTime - seekBackward);
          feedbackMessage = `Rewound ${seekBackward}s`;
          break;
        }
        case 'j': { // Volume down
          const volumeDownChange = ctrl ? VOLUME_CHANGE * 2 : VOLUME_CHANGE;
          video.volume = Math.max(0, video.volume - (volumeDownChange / 100));
          feedbackMessage = `Volume: ${Math.round(video.volume * 100)}%`;
          break;
        }
        case 'k': { // Volume up
          const volumeUpChange = ctrl ? VOLUME_CHANGE * 2 : VOLUME_CHANGE;
          video.volume = Math.min(1, video.volume + (volumeUpChange / 100));
          feedbackMessage = `Volume: ${Math.round(video.volume * 100)}%`;
          break;
        }
        case 'l': { // Forward
          const seekForward = ctrl ? SEEK_TIME * 2 : SEEK_TIME;
          video.currentTime = Math.min(video.duration, video.currentTime + seekForward);
          feedbackMessage = `Forward ${seekForward}s`;
          break;
        }
        case 'm': // Mute
          video.muted = !video.muted;
          feedbackMessage = `Muted: ${video.muted ? 'On' : 'Off'}`;
          break;
        case ',': // Decrease speed
          video.playbackRate = Math.max(0.25, video.playbackRate - 0.25);
          feedbackMessage = `Speed: ${video.playbackRate.toFixed(2)}x`;
          break;
        case '.': // Increase speed
          video.playbackRate = Math.min(2.0, video.playbackRate + 0.25);
          feedbackMessage = `Speed: ${video.playbackRate.toFixed(2)}x`;
          break;
        default:
          handled = false;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
        showUIFeedback(feedbackMessage);
      }
    }
  }, true);
})();