const form = document.getElementById("downloadForm");
const statusDiv = document.getElementById("downloadStatus");
const button = form.querySelector("button[type=\"submit\"]");
const stopBtn = document.getElementById("stopBtn");

/**
 * Indicates whether a download process is currently active.
 * Used to prevent duplicate submissions and to gate UI actions
 * such as disabling the form or showing progress.
 */
let isDownloading = false;

/**
 * Indicates whether the current download was explicitly
 * stopped by the user via the cancel action.
 *
 * Used to differentiate between:
 * - user-initiated cancellation
 * - failures or natural completion
 */
let userStoppedDownload = false;



/**
 * Handles download form submission.
 *
 * - Validates user input (URL)
 * - Disables UI during download
 * - Sends request to backend `/download`
 * - Manages success / error states
 * - Restores UI state after completion
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const urlInput = form.querySelector("input[name='url']");
  const url = urlInput.value.trim();
  
  // Basic URL validation
  if (!url) {
    window.showError("Please enter a URL");
    return;
  }
  
  button.disabled = true;
  statusDiv.style.display = "none";
  isDownloading = true;
  userStoppedDownload = false;

  // Show progress UI immediately with initial message
  showInitialProgress();

  const formData = new FormData(form);
  const params = new URLSearchParams(formData);

  try {
    const res = await fetch("/download", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    if (!res.ok) {
      if (!userStoppedDownload) {
        const errorText = await res.text();
        window.showError(errorText);
        resetProgressBar();
      }
      return;
    }

    // Download successful - check if notifications are enabled
    const features = await window.electronAPI.getFeatures();
    if (features.notifySystem) {
      window.showSuccess("Download completed!");
    }

  } catch (err) {
    if (!isDownloading && !userStoppedDownload) {
      statusDiv.style.display = "none";
    }
  } finally {
    isDownloading = false;
    button.disabled = false;
    stopBtn.style.display = "none";
  }
});

/**
 * Displays initial download progress UI immediately
 * when a download starts.
 *
 * Initializes progress bar, speed indicator, stage text
 * and shows the stop button.
 */
function showInitialProgress() {
  const progressWrapper = document.getElementById("downloadProgressWrapper");
  const progressBarText = document.getElementById("downloadProgressText");
  const speedElement = document.getElementById("downloadSpeedText");
  const stageElement = document.getElementById("downloadStage");
  const stopBtn = document.getElementById("stopBtn");
  
  if (progressWrapper) progressWrapper.style.display = "block";
  if (progressBarText) {
    progressBarText.style.display = "block";
    progressBarText.innerHTML = "0%";
  }
  if (speedElement) {
    speedElement.style.display = "block";
    speedElement.textContent = "0 Mib/s";
  }
  if (stageElement) {
    stageElement.style.display = "block";
    stageElement.textContent = "Retrieving data...";
  }
  if (stopBtn) stopBtn.style.display = "inline-flex";
}

/**
 * Cancels the current download process.
 *
 * Sends a request to backend `/download/cancel`,
 * updates UI state and resets progress indicators.
 *
 * Prevents duplicate calls if no download is active.
 */
async function stopDownload() {
  if (!isDownloading) return;

  userStoppedDownload = true;
  button.disabled = true;
  stopBtn.disabled = true;

  try {
    await fetch("/download/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    
    window.showWarning("Download stopped");
  } catch (err) {
    console.error("Error stopping download:", err);
  } finally {
    isDownloading = false;
    button.disabled = false;
    stopBtn.disabled = false;
    stopBtn.style.display = "none";
    resetProgressBar();
  }
}

/**
 * Resets all download progress UI elements to their
 * default hidden state.
 *
 * Used after completion or cancellation of a download.
 */
function resetProgressBar() {
  const progressWrapper = document.getElementById("downloadProgressWrapper");
  if (progressWrapper) progressWrapper.style.display = "none";
  
  const progressBar = document.getElementById("downloadProgress");
  if (progressBar) progressBar.style.width = "0%";

  const progressBarText = document.getElementById("downloadProgressText");
  if (progressBarText) progressBarText.style.display = "none";

  const speedElement = document.getElementById("downloadSpeedText");
  if (speedElement) speedElement.style.display = "none";

  const playlistInfoElement = document.getElementById("playlistInfoText");
  if (playlistInfoElement) playlistInfoElement.style.display = "none";
}