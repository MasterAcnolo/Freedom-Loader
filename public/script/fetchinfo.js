const urlInput = document.getElementById("UrlInput"); // Récupère le champ input où l'utilisateur entre l'URL
const infoDiv = document.getElementById("videoInfo"); // Récupère la div où on affichera les infos

let lastFetchedUrl = ""; // Pour éviter de refaire plusieurs requêtes pour la même URL

// On écoute chaque changement dans le champ URL
urlInput.addEventListener("input", async () => {
  const url = urlInput.value; // On prend la valeur actuelle du champ

  // Si pas d'URL, ou URL trop courte, ou déjà traitée, on sort
  if (!url || url.length < 5 || url === lastFetchedUrl) return;

  lastFetchedUrl = url; // On mémorise l'URL traitée

  try {
    // Envoi d'une requête POST vers le backend /info avec l'URL dans le corps
    const res = await fetch("/info", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url }) // Encode l'URL au format x-www-form-urlencoded
    });

    // Si la réponse n'est pas OK (erreur 4xx ou 5xx)
    if (!res.ok) {
      infoDiv.innerHTML = "❌ Impossible de récupérer les infos."; // Message d'erreur utilisateur
      return;
    }

    // On récupère la réponse JSON (les infos de la vidéo)
    const data = await res.json();

    // Formatage de la durée en minutes et secondes (ex: 4m 35s)
    const minutes = Math.floor(data.duration / 60);
    const seconds = data.duration % 60;
    const durationStr = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

    // Formatage de la date d'upload depuis YYYYMMDD vers JJ/MM/AAAA
    const date = data.upload_date || "";
    const readableDate = date
      ? `${date.slice(6, 8)}/${date.slice(4, 6)}/${date.slice(0, 4)}`
      : "Inconnue";

    // Taille estimée en Mo, ou "Inconnue" si pas dispo
    const sizeMB = data.filesize_approx
      ? (data.filesize_approx / (1024 * 1024)).toFixed(2) + " Mo"
      : "Inconnue";

    // Catégories en chaîne séparée par des virgules, ou "Non spécifiées"
    const categories = data.categories
      ? data.categories.join(", ")
      : "Non spécifiées";

    // Mise à jour du contenu HTML de la div avec toutes les infos formatées
    infoDiv.innerHTML = `
      <h3>${data.title}</h3>
      <img src="${data.thumbnail}" width="320">
      <ul>
        <li><strong>Durée :</strong> ${durationStr}</li>
        <li><strong>Uploader :</strong> ${data.uploader || "Inconnu"}</li>
        <li><strong>Date d’upload :</strong> ${readableDate}</li>
        <li><strong>Vues :</strong> ${data.view_count?.toLocaleString() || "?"}</li>
        <li><strong>Likes :</strong> ${data.like_count?.toLocaleString() || "?"}</li>
        <li><strong>URL :</strong> <a href="${data.webpage_url}" target="_blank">${data.webpage_url}</a></li>
        <li><strong>Channel :</strong> <a href="${data.channel_url}" target="_blank">${data.channel_url}</a></li>
        <li><strong>Taille estimée :</strong> ${sizeMB}</li>
        <li><strong>Catégories :</strong> ${categories}</li>
      </ul>
    `;
  } catch (e) {
    // Si une erreur survient lors de la récupération ou du parsing
    infoDiv.innerHTML = "❌ Erreur lors de la récupération.";
  }
});
