/*
  This file is part of Freedom Loader.

  Copyright (C) 2025 MasterAcnolo

  Freedom Loader is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License.

  Freedom Loader is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("UrlInput");
  const infoDiv = document.getElementById("videoInfo");

  let lastFetchedUrl = "";
  const DEBUG = true;

  urlInput.addEventListener("input", async () => {
    const url = urlInput.value.trim();
    if (DEBUG) console.log("[DEBUG] Input détecté :", url);

    if (!url || url.length < 5) {
      if (DEBUG) console.log("[DEBUG] URL vide ou trop courte, reset affichage.");
      infoDiv.innerHTML = "";
      infoDiv.classList.remove("visible");
      lastFetchedUrl = "";
      return;
    }

    if (url === lastFetchedUrl) {
      if (DEBUG) console.log("[DEBUG] Même URL que précédemment, pas de fetch.");
      return;
    }

    lastFetchedUrl = url;

    try {
      if (DEBUG) console.log("[DEBUG] Envoi requête POST vers /info avec URL:", url);
      const res = await fetch("/info", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ url }),
      });

      if (DEBUG) console.log("[DEBUG] Réponse status:", res.status);

      if (!res.ok) {
        console.error(`[ERROR] Réponse HTTP ${res.status}: ${res.statusText}`);
        infoDiv.innerHTML = "❌ Impossible de récupérer les infos (erreur serveur).";
        infoDiv.classList.remove("visible");
        return;
      }

      const data = await res.json();
      if (DEBUG) console.log("[DEBUG] Données reçues:", data);

      // Vérification minimaliste
      if (!data || !data.title || !data.thumbnail) {
        console.warn("[WARNING] Données incomplètes", data);
        infoDiv.innerHTML = "❌ Données incomplètes reçues.";
        infoDiv.classList.remove("visible");
        return;
      }

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
      infoDiv.classList.add("visible");

      if (DEBUG) console.log("[DEBUG] Info affichée avec succès.");
    } catch (e) {
      console.error("[CRITICAL] Erreur lors de la récupération:", e);
      infoDiv.innerHTML = "❌ Erreur réseau ou JSON.";
      infoDiv.classList.remove("visible");
    }
  });
});
