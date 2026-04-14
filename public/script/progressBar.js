const progressWrapper = document.getElementById("downloadProgressWrapper");
const progressBar = document.getElementById("downloadProgress");
const progressBarText = document.getElementById("downloadProgressText")

const speedElement = document.getElementById("downloadSpeedText");
const stageElement = document.getElementById("downloadStage");
const playlistInfoElement = document.getElementById("playlistInfoText");
const speedEvt = new EventSource("/download/speed");
const stageEvt = new EventSource("/download/stage");
const playlistInfoEvt = new EventSource("/download/playlist-info");

function startProgress() {
  progressBar.style.width = "0%";
  progressBarText.innerHTML = "0%";
  speedElement.innerHTML = "0 Mib/s";
}

function showProgress() {
  progressWrapper.style.display = "block";
  progressBarText.style.display = "block";
  speedElement.style.display = "block";

  // Show stop button
  const stopBtn = document.getElementById("stopBtn");
  if (stopBtn) stopBtn.style.display = "inline-flex";
}

function updateProgress(percent) {
  // Show progress div and stop button only when percent > 0
  if (percent > 0 && progressWrapper.style.display !== "block") {
    showProgress();
  }
  
  progressBar.style.width = `${percent}%`;
  progressBarText.innerHTML = `${percent}%`;
}

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

  // Hide stop button
  const stopBtn = document.getElementById("stopBtn");
  if (stopBtn) stopBtn.style.display = "none";
}

// SSE Connexion
const evtSource = new EventSource("/download/progress");
evtSource.onmessage = e => {
  if (e.data === "reset") {
    startProgress();
    window.electronAPI.setProgress(0);
    return;
  }

  if (e.data === "done") {
    // Keep progress bar visible for better UX, let toast handle the feedback
    setTimeout(() => {
      resetProgress();
      window.electronAPI.setProgress(-1); 
    }, 2000); // Wait 2s so user sees 100% progress
    return;
  }

  const percent = parseFloat(e.data);
  
  if (!isNaN(percent)) {
    updateProgress(percent);
    window.electronAPI.setProgress(percent); // Update Task Bar
    // Don't hide at 100%, wait for "done" signal instead
  }
};

speedEvt.onmessage = e => {
  speedElement.style.display = "block";
  speedElement.textContent = e.data; // ex: "5.2MiB/s"
};

stageEvt.onmessage = e => {
  stageElement.style.display = "block";
  stageElement.textContent = e.data; // ex: "📥 Downloading..."
};

playlistInfoEvt.onmessage = e => {
  playlistInfoElement.style.display = "block";
  playlistInfoElement.textContent = e.data; // ex: "Item 1 of 15"
};