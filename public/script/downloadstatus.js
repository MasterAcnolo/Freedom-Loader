const form = document.getElementById("downloadForm");
const statusDiv = document.getElementById("downloadStatus");
const button = form.querySelector("button[type=\"submit\"]");
const stopBtn = document.getElementById("stopBtn");
let isDownloading = false;
let userStoppedDownload = false;

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

    // Download successful
    window.showSuccess("Download completed!");

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

function resetProgressBar() {
  const progressWrapper = document.getElementById("downloadProgressWrapper");
  if (progressWrapper) progressWrapper.style.display = "none";
  
  const progressBar = document.getElementById("downloadProgress");
  if (progressBar) progressBar.style.width = "0%";

  const progressBarText = document.getElementById("downloadProgressText");
  if (progressBarText) progressBarText.style.display = "none";

  const speedElement = document.getElementById("downloadSpeedText");
  if (speedElement) speedElement.style.display = "none";
}