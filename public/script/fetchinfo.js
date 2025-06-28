document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("UrlInput");
  const infoDiv = document.getElementById("videoInfo");

  let lastFetchedUrl = "";

  urlInput.addEventListener("input", async () => {
    const url = urlInput.value.trim();
    console.log("Input détecté :", url);

    // Si URL vide ou trop courte : on vide et cache la div
    if (!url || url.length < 5) {
      infoDiv.innerHTML = "";
      infoDiv.classList.remove("visible");
      lastFetchedUrl = "";
      return;
    }
    // Si même URL que précédemment, on ne fait rien
    if (url === lastFetchedUrl) return;

    lastFetchedUrl = url;

    try {
      const res = await fetch("/info", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ url }),
      });

      if (!res.ok) {
        infoDiv.innerHTML = "❌ Impossible de récupérer les infos.";
        infoDiv.classList.remove("visible");
        return;
      }

      const data = await res.json();

      const minutes = Math.floor(data.duration / 60);
      const seconds = data.duration % 60;
      const durationStr = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;

      const date = data.upload_date || "";
      const readableDate = date
        ? `${date.slice(6, 8)}/${date.slice(4, 6)}/${date.slice(0, 4)}`
        : "Inconnue";

      const sizeMB = data.filesize_approx
        ? (data.filesize_approx / (1024 * 1024)).toFixed(2) + " Mo"
        : "Inconnue";

      const categories = data.categories
        ? data.categories.join(", ")
        : "Non spécifiées";

      infoDiv.innerHTML = `
        <h3>${data.title}</h3>
        <img src="${data.thumbnail}" width="320" alt="Thumbnail">
        <ul>
          <li><strong>Durée :</strong> ${durationStr}</li>
          <li><strong>Uploader :</strong> ${data.uploader || "Inconnu"}</li>
          <li><strong>Date d’upload :</strong> ${readableDate}</li>
          <li><strong>Vues :</strong> ${data.view_count?.toLocaleString() || "?"}</li>
          <li><strong>Likes :</strong> ${data.like_count?.toLocaleString() || "?"}</li>
          <li><strong>URL :</strong> <a href="${data.webpage_url}" target="_blank" rel="noopener noreferrer">${data.webpage_url}</a></li>
          <li><strong>Channel :</strong> <a href="${data.channel_url}" target="_blank" rel="noopener noreferrer">${data.channel_url}</a></li>
          <li><strong>Taille estimée :</strong> ${sizeMB}</li>
          <li><strong>Catégories :</strong> ${categories}</li>
        </ul>
      `;
      // Affiche la div avec la classe pour transition douce
      infoDiv.classList.add("visible");
    } catch (e) {
      console.error("Erreur lors de la récupération :", e);
      infoDiv.innerHTML = "❌ Erreur lors de la récupération.";
      infoDiv.classList.remove("visible");
    }
  });
});
