/**
 * DOM elements used for download progress UI rendering.
 * These elements are updated in real-time via SSE streams.
 */
const progressWrapper = document.getElementById("downloadProgressWrapper");
const progressBar = document.getElementById("downloadProgress");
const progressBarText = document.getElementById("downloadProgressText");

const speedElement = document.getElementById("downloadSpeedText");
const stageElement = document.getElementById("downloadStage");
const playlistInfoElement = document.getElementById("playlistInfoText");

/**
 * Server-Sent Events streams for real-time download updates.
 * Each stream is responsible for a specific aspect of the download state.
 */
const speedEvt = new EventSource("/download/speed");
const stageEvt = new EventSource("/download/stage");
const playlistInfoEvt = new EventSource("/download/playlist-info");

/**
 * Resets the progress UI to its initial state.
 * Hides all dynamic elements and clears displayed values.
 */
function startProgress() {
  progressBar.style.width = "0%";
  progressBarText.innerHTML = "0%";
  speedElement.innerHTML = "0 Mib/s";
}

/**
 * Makes the progress UI visible and enables related controls
 * such as the stop button.
 */
function showProgress() {
  progressWrapper.style.display = "block";
  progressBarText.style.display = "block";
  speedElement.style.display = "block";

  const stopBtn = document.getElementById("stopBtn");
  if (stopBtn) stopBtn.style.display = "inline-flex";
}

/**
 * Updates the progress bar UI with the given percentage.
 * Automatically triggers UI visibility if not already shown.
 *
 * @param {number} percent - Download progress percentage (0–100)
 */
function updateProgress(percent) {
  if (percent > 0 && progressWrapper.style.display !== "block") {
    showProgress();
  }

  progressBar.style.width = `${percent}%`;
  progressBarText.innerHTML = `${percent}%`;
}

/**
 * Fully resets the progress UI and hides all download indicators.
 * Called after completion or cancellation.
 */
function resetProgress() {
  progressBar.style.width = "0%";
  progressBarText.textContent = "";
  progressBarText.style.display = "none";
  progressWrapper.style.display = "none";

  speedElement.textContent = "0 Mib/s";
  speedElement.style.display = "none";

  stageElement.textContent = "";
  stageElement.style.display = "none";

  playlistInfoElement.textContent = "";
  playlistInfoElement.style.display = "none";

  const stopBtn = document.getElementById("stopBtn");
  if (stopBtn) stopBtn.style.display = "none";
}

/**
 * Main SSE stream handling download progress updates.
 * Supports:
 * - reset signal
 * - done signal
 * - percentage updates
 */
const evtSource = new EventSource("/download/progress");

evtSource.onmessage = e => {
  if (e.data === "reset") {
    startProgress();
    window.electronAPI.setProgress(0);
    return;
  }

  if (e.data === "done") {
    setTimeout(() => {
      resetProgress();
      window.electronAPI.setProgress(-1);
    }, 2000);
    return;
  }

  const percent = parseFloat(e.data);

  if (!isNaN(percent)) {
    updateProgress(percent);
    window.electronAPI.setProgress(percent);
  }
};

/**
 * SSE stream: download speed updates (e.g. "5.2 MiB/s").
 */
speedEvt.onmessage = e => {
  speedElement.style.display = "block";
  speedElement.textContent = e.data;
};

/**
 * SSE stream: download stage updates (e.g. downloading, merging, extracting).
 */
stageEvt.onmessage = e => {
  stageElement.style.display = "block";
  stageElement.textContent = e.data;
};

/**
 * SSE stream: playlist progress updates (e.g. "Item 1 of 15").
 */
playlistInfoEvt.onmessage = e => {
  playlistInfoElement.style.display = "block";
  playlistInfoElement.textContent = e.data;
};