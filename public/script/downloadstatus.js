// Récupération du formulaire de téléchargement
const form = document.getElementById("downloadForm");

// Div où on affiche l'état de progression (en cours, erreur, succès)
const statusDiv = document.getElementById("downloadStatus");

// Récupération du bouton de validation pour pouvoir le désactiver pendant la requête
const button = form.querySelector("button");

// On intercepte la soumission du formulaire
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // empêche le rechargement de la page par le navigateur

  // On désactive le bouton pour éviter les clics multiples
  button.disabled = true;

  // Affiche un message d'attente à l'utilisateur
  statusDiv.textContent = "⏳ Téléchargement en cours...";

  // Prépare les données du formulaire sous forme URL-encoded
  const formData = new FormData(form);
  const params = new URLSearchParams(formData);

  try {
    // Envoi de la requête POST vers /download avec les données du formulaire
    const res = await fetch("/download", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    // Si la réponse n'est pas un succès (code 4xx ou 5xx)
    if (!res.ok) {
      statusDiv.textContent = "❌ Erreur pendant le téléchargement.";
      return;
    }

    // On récupère le texte de la réponse du serveur
    const text = await res.text();

    // Affiche le message de fin de téléchargement (par exemple « Téléchargement terminé »)
    statusDiv.textContent = text;
  } catch {
    // Gestion d'erreur en cas de problème réseau ou autre
    statusDiv.textContent = "❌ Une erreur s’est produite.";
  } finally {
    // Réactive le bouton pour autoriser d'autres soumissions
    button.disabled = false;

    // Efface le message de status après 5 secondes pour garder l'UI propre
    setTimeout(() => {
      statusDiv.textContent = "";
    }, 5000);
  }
});
