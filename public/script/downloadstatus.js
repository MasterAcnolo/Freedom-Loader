const form = document.getElementById("downloadForm");
const statusDiv = document.getElementById("downloadStatus");
const button = form.querySelector("button");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  button.disabled = true; // Empêche les clics multiples
  statusDiv.textContent = "Téléchargement en cours...";

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
    statusDiv.textContent = "❌ Une erreur s’est produite.";
  } finally {
    button.disabled = false;

    setTimeout(() => {
      statusDiv.textContent = "";
    }, 5000);
  }
});
