const form = document.getElementById("downloadForm");
const statusDiv = document.getElementById("downloadStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // empêche la soumission classique (rechargement)

  statusDiv.textContent = "⏳ Téléchargement en cours...";

  const formData = new FormData(form);
  const params = new URLSearchParams(formData);

  try {
    const res = await fetch("/download", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    if (!res.ok) {
      statusDiv.textContent = "❌ Erreur pendant le téléchargement.";
      return;
    }

    const text = await res.text();
    statusDiv.textContent = text; // affiche « Téléchargement terminé » ou autre message serveur
  } catch {
    statusDiv.textContent = "❌ Une erreur s’est produite.";
  }
});
