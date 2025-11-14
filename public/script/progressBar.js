const progressWrapper = document.getElementById("downloadProgressWrapper");
const progressBar = document.getElementById("downloadProgress");

function startProgress() {
  progressWrapper.style.display = "block";
  progressBar.style.width = "0%";
}

function updateProgress(percent) {
  progressBar.style.width = `${percent}%`;
}

// Réinitialise et cache
function resetProgress() {
  progressBar.style.width = "0%";
  progressWrapper.style.display = "none";
}

// Connexion SSE, c'est Server-sent events est une technologie grâce à laquelle un navigateur reçoit des mises à jour automatiques à partir d'un serveur via une connexion HTTP. 
const evtSource = new EventSource("/download/progress");
evtSource.onmessage = e => {
  const percent = parseFloat(e.data);
  if (!isNaN(percent)) {
    updateProgress(percent);
    if (percent >= 100) {
      setTimeout(resetProgress, 500);
    }
  }
};
