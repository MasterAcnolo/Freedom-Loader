const progressWrapper = document.getElementById("downloadProgressWrapper");
const progressBar = document.getElementById("downloadProgress");
const progressBarText = document.getElementById("downloadProgressText")

function startProgress() {
  progressWrapper.style.display = "block";
  progressBar.style.width = "0%";
  progressBarText.style.display = "block";
  progressBarText.innerHTML = "0%";
}

function updateProgress(percent) {
  progressBar.style.width = `${percent}%`;
  progressBarText.innerHTML = `${percent}%`;
}

function resetProgress() {
  progressBar.style.width = "0%";
  progressBarText.innerHTML = "";
  progressBarText.style.display = "none";
  progressWrapper.style.display = "none";
}

// Connexion SSE
const evtSource = new EventSource("/download/progress");
evtSource.onmessage = e => {
  if (e.data === "reset") {
    startProgress();
    return;
  }

  if (e.data === "done") {
    resetProgress();
    return;
  }

  const percent = parseFloat(e.data);
  if (!isNaN(percent)) {
    updateProgress(percent);
    if (percent >= 100) setTimeout(resetProgress, 500);
  }
};
