const progressWrapper = document.getElementById("downloadProgressWrapper");
const progressBar = document.getElementById("downloadProgress");
const progressBarText = document.getElementById("downloadProgressText")

const speedElement = document.getElementById("downloadSpeedText");
const speedEvt = new EventSource("/download/speed");

function startProgress() {
  progressWrapper.style.display = "block";
  progressBar.style.width = "0%";
  progressBarText.style.display = "block";
  progressBarText.innerHTML = "0%";

  speedElement.style.display = "block";
  speedElement.innerHTML = "0 Mib/s";
}

function updateProgress(percent) {
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
}

// Connexion SSE
const evtSource = new EventSource("/download/progress");
evtSource.onmessage = e => {
  if (e.data === "reset") {
    startProgress();
    window.electronAPI.setProgress(0);
    return;
  }

  if (e.data === "done") {
    resetProgress();
    window.electronAPI.setProgress(-1); 
    return;
  }

  const percent = parseFloat(e.data);
  
  if (!isNaN(percent)) {
    updateProgress(percent);
    window.electronAPI.setProgress(percent); // update barre des tâches
    if (percent >= 100) setTimeout(() => {
      resetProgress();
      window.electronAPI.setProgress(-1); // retire la barre
    }, 500);
  }
};

speedEvt.onmessage = e => {
  speedElement.style.display = "block";
  speedElement.textContent = e.data; // ex: "5.2MiB/s"
};