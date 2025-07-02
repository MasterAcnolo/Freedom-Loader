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

// On attend que le DOM soit complètement chargé
document.addEventListener("DOMContentLoaded", () => {
  // Récupération des éléments du DOM pour interaction
  const urlInput = document.getElementById("UrlInput");
  const infoDiv = document.getElementById("videoInfo");

  // Stocke la dernière URL fetchée pour éviter les requêtes répétées inutiles
  let lastFetchedUrl = "";

  // Active les logs DEBUG pour le développement
  const DEBUG = true;

  // Écoute les changements dans l'input URL
  urlInput.addEventListener("input", async () => {
    const url = urlInput.value.trim();

    if (DEBUG) console.log("[DEBUG] Input détecté :", url);

    // Si l'URL est vide ou trop courte, on reset l'affichage
    if (!url || url.length < 5) {
      if (DEBUG) console.log("[DEBUG] URL vide ou trop courte, reset affichage.");
      infoDiv.innerHTML = "";
      infoDiv.classList.remove("visible");
      lastFetchedUrl = "";
      return;
    }

    // Si l'URL est identique à la dernière requêtée, on ne refait pas la requête
    if (url === lastFetchedUrl) {
      if (DEBUG) console.log("[DEBUG] Même URL que précédemment, pas de fetch.");
      return;
    }

    // Mémorise l'URL actuelle comme dernière URL traitée
    lastFetchedUrl = url;

    try {
      if (DEBUG) console.log("[DEBUG] Envoi requête POST vers /info avec URL:", url);

      // Envoi de la requête POST pour récupérer les infos de la vidéo
      const res = await fetch("/info", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ url }),
      });

      if (DEBUG) console.log("[DEBUG] Réponse status:", res.status);

      // Si la réponse HTTP est une erreur, on affiche un message
      if (!res.ok) {
        console.error(`[ERROR] Réponse HTTP ${res.status}: ${res.statusText}`);
        infoDiv.innerHTML = "❌ Impossible de récupérer les infos (erreur serveur).";
        infoDiv.classList.remove("visible");
        return;
      }

      // Parse la réponse JSON contenant les infos vidéo
      const data = await res.json();
      if (DEBUG) console.log("[DEBUG] Données reçues:", data);

      // Vérification simple que les données attendues sont présentes
      if (!data || !data.title || !data.thumbnail) {
        console.warn("[WARNING] Données incomplètes", data);
        infoDiv.innerHTML = "❌ Données incomplètes reçues.";
        infoDiv.classList.remove("visible");
        return;
      }

      // Formatage de la durée en minutes et secondes
      const minutes = Math.floor(data.duration / 60);
      const seconds = data.duration % 60;
      const durationStr = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;

      // Formatage de la date d'upload au format JJ/MM/AAAA
      const date = data.upload_date || "";
      const readableDate = date
        ? `${date.slice(6, 8)}/${date.slice(4, 6)}/${date.slice(0, 4)}`
        : "Inconnue";

      // Conversion taille approximative en Mo
      const sizeMB = data.filesize_approx
        ? (data.filesize_approx / (1024 * 1024)).toFixed(2) + " Mo"
        : "Inconnue";

      // Gestion des catégories, affichage par défaut si absentes
      const categories = data.categories
        ? data.categories.join(", ")
        : "Non spécifiées";

      // Construction du HTML pour afficher les informations de la vidéo
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

      // Affiche la div contenant les infos
      infoDiv.classList.add("visible");

      if (DEBUG) console.log("[DEBUG] Info affichée avec succès.");
    } catch (e) {
      // En cas d'erreur réseau ou JSON, on affiche un message d'erreur
      console.error("[CRITICAL] Erreur lors de la récupération:", e);
      infoDiv.innerHTML = "❌ Erreur réseau ou JSON.";
      infoDiv.classList.remove("visible");
    }
  });
});
