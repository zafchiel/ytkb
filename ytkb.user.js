// ==UserScript==
// @name         ytkb
// @namespace    http://violentmonkey.net/
// @version      0.2
// @description  Add custom keyboard shortcuts for YouTube navigation with UI feedback and improved controls
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(() => {
  const SEEK_TIME = 5; // Seconds to seek forward/backward
  const VOLUME_CHANGE = 5; // Percentage to change volume

  const state = {
    currentTime: 0,
    volume: 0,
    muted: false,
    playbackRate: 1.0,
    duration: 0,
  };

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
      color: gray;
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
  let stateUpdateInterval;

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

  // Function to display state of video
  function displayVideoState(targetElement) {
    const video = document.querySelector('video');
    if (!video) return;

    const formatTime = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return [h, m, s].map(v => v < 10 ? "0" + v : v).filter((v, i) => v !== "00" || i > 0).join(":");
    };

    const currentTime = formatTime(video.currentTime);
    const duration = formatTime(video.duration);

    state.currentTime = video.currentTime;
    state.volume = video.volume;
    state.muted = video.muted;
    state.playbackRate = video.playbackRate;
    state.duration = video.duration;

    const stateText = `${currentTime} / ${duration} | Volume: ${Math.round(state.volume * 100)}% | Muted: ${state.muted ? 'On' : 'Off'} | Speed: ${state.playbackRate.toFixed(2)}x`;
    targetElement.textContent = stateText;
    targetElement.style.display = 'block';
    targetElement.style.color = 'white';
    targetElement.style.fontSize = '16px';
    targetElement.style.fontWeight = 'bold';
    targetElement.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';
  }

  // Function to start updating video state
  function startVideoStateUpdate() {
    const stateElement = document.getElementById('limited-state');
    if (stateElement && !stateUpdateInterval) {
      stateUpdateInterval = setInterval(() => {
        displayVideoState(stateElement);
      }, 1000); // Update every second
    }
  }

  // Function to stop updating video state
  function stopVideoStateUpdate() {
    if (stateUpdateInterval) {
      clearInterval(stateUpdateInterval);
      stateUpdateInterval = null;
    }
  }

  document.addEventListener('keydown', (e) => {
    // Only trigger if not typing in an input field
    if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') {
      return;
    }
    const video = document.querySelector('video');
    // Video not found
    if (!video) {
      return;
    }

    let handled = true;
    let feedbackMessage = '';
    const ctrl = e.ctrlKey;

    switch (e.key.toLowerCase()) {
      case 'h': { // Rewind
        const seekBackward = ctrl ? SEEK_TIME * 2 : SEEK_TIME;
        video.currentTime = Math.max(0, video.currentTime - seekBackward);
        feedbackMessage = `Rewound ${seekBackward}s`;
        state.currentTime = video.currentTime;
        break;
      }
      case 'j': { // Volume down
        const volumeDownChange = ctrl ? VOLUME_CHANGE * 2 : VOLUME_CHANGE;
        video.volume = Math.max(0, video.volume - (volumeDownChange / 100));
        feedbackMessage = `Volume: ${Math.round(video.volume * 100)}%`;
        state.volume = video.volume;
        break;
      }
      case 'k': { // Volume up
        const volumeUpChange = ctrl ? VOLUME_CHANGE * 2 : VOLUME_CHANGE;
        video.volume = Math.min(1, video.volume + (volumeUpChange / 100));
        feedbackMessage = `Volume: ${Math.round(video.volume * 100)}%`;
        state.volume = video.volume;
        break;
      }
      case 'l': { // Forward
        const seekForward = ctrl ? SEEK_TIME * 2 : SEEK_TIME;
        video.currentTime = Math.min(video.duration, video.currentTime + seekForward);
        feedbackMessage = `Forward ${seekForward}s`;
        state.currentTime = video.currentTime;
        break;
      }
      case 'm': // Mute
        video.muted = !video.muted;
        feedbackMessage = `Muted: ${video.muted ? 'On' : 'Off'}`;
        state.muted = video.muted;
        break;
      case ',': // Decrease speed
        video.playbackRate = Math.max(0.25, video.playbackRate - 0.25);
        feedbackMessage = `Speed: ${video.playbackRate.toFixed(2)}x`;
        state.playbackRate = video.playbackRate;
        break;
      case '.': // Increase speed
        video.playbackRate = Math.min(2.0, video.playbackRate + 0.25);
        feedbackMessage = `Speed: ${video.playbackRate.toFixed(2)}x`;
        state.playbackRate = video.playbackRate;
        break;
      case 'i': // Toggle Picture-in-Picture
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture();
          feedbackMessage = 'Picture-in-Picture: Off';
        } else if (document.pictureInPictureEnabled) {
          video.requestPictureInPicture();
          feedbackMessage = 'Picture-in-Picture: On';
        }
        break;
      case 'f': // Toggle fullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen();
          feedbackMessage = 'Fullscreen: Off';
        } else {
          video.requestFullscreen();
          feedbackMessage = 'Fullscreen: On';
        }
        break;
      case ' ': // Play/Pause
        if (video.paused) {
          video.play();
          feedbackMessage = 'Playing';
        } else {
          video.pause();
          feedbackMessage = 'Paused';
        }
        break;
      default:
        handled = false;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      showUIFeedback(feedbackMessage);
      startVideoStateUpdate();
      displayVideoState(document.getElementById('limited-state'));
    }
  }, true);

  // Start updating video state when the page loads
  window.addEventListener('load', startVideoStateUpdate);

  // Stop updating video state when the page unloads
  window.addEventListener('unload', stopVideoStateUpdate);

})();
