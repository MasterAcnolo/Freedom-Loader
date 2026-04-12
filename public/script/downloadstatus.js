const form = document.getElementById("downloadForm");
const statusDiv = document.getElementById("downloadStatus");
const button = form.querySelector("button[type=\"submit\"]");
const stopBtn = document.getElementById("stopBtn");
let isDownloading = false;
let userStoppedDownload = false;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  button.disabled = true;
  stopBtn.style.display = "inline-flex";
  statusDiv.style.display = "none"; // Hide status div
  isDownloading = true;
  userStoppedDownload = false;

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
        statusDiv.textContent = errorText;
        statusDiv.style.display = "block";
      }
      return;
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
    
  } catch (err) {
    console.error("Error stopping download:", err);
  } finally {
    isDownloading = false;
    button.disabled = false;
    stopBtn.disabled = false;
    stopBtn.style.display = "none";

    // Reset progress bar
    const progressWrapper = document.getElementById("downloadProgressWrapper");
    if (progressWrapper) progressWrapper.style.display = "none";
    
    const progressBar = document.getElementById("downloadProgress");
    if (progressBar) progressBar.style.width = "0%";
  }
}