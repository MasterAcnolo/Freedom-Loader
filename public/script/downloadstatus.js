const form = document.getElementById("downloadForm");
const statusDiv = document.getElementById("downloadStatus");
const button = form.querySelector("button");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  button.disabled = true; // Avoid multiple clicks
  statusDiv.textContent = "Download in progress...";

  const formData = new FormData(form);
  const params = new URLSearchParams(formData);

  try {
    const res = await fetch("/download", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    if (!res.ok) {
      statusDiv.textContent = res;
      return;
    }

    const text = await res.text();
    statusDiv.textContent = text;

  } catch {
    statusDiv.textContent = "❌ An Error has Occured.";
  } finally {
    button.disabled = false;

    setTimeout(() => {
      statusDiv.textContent = "";
    }, 5000);
  }
});