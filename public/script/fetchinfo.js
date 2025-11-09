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

function formatDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return "Inconnue";
  return `${dateStr.slice(6,8)}/${dateStr.slice(4,6)}/${dateStr.slice(0,4)}`;
}

function formatSize(bytes) {
  return bytes ? (bytes / (1024*1024)).toFixed(2) + " Mo" : "Inconnue";
}

async function fetchVideoInfo(url) {
  try {
    const res = await fetch("/info", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url }),
    });

    if (!res.ok) return { error: `Erreur serveur: ${res.status}` };

    const data = await res.json();
    if (!data) return { error: "Données manquantes" };

    return data;
  } catch (e) {
    return { error: "Erreur réseau ou JSON" };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("UrlInput");
  const infoDiv = document.getElementById("videoInfo");
  let lastFetchedUrl = "";

  urlInput.addEventListener("input", async () => {
    const url = urlInput.value.trim();

    if (!url || url.length < 5) {
      infoDiv.innerHTML = "";
      infoDiv.classList.remove("visible");
      lastFetchedUrl = "";
      return;
    }

    if (url === lastFetchedUrl) return;
    lastFetchedUrl = url;

    const data = await fetchVideoInfo(url);
    if (data.error) {
      infoDiv.innerHTML = `❌ ${data.error}`;
      infoDiv.classList.remove("visible");
      return;
    }

    if (data.type === "playlist") {
      infoDiv.innerHTML = `
        <p style="color:orange;"><strong>Playlist détectée – ${data.count} vidéos</strong></p>
        <h3>${data.title}</h3>
        <p><strong>Channel :</strong> ${data.channel || "Inconnu"}</p>
        <div id="playlistVideos"></div>
      `;
      const listDiv = document.getElementById("playlistVideos");
      data.videos.forEach(v => {
        const durationStr = `${Math.floor(v.duration/60)}m ${(v.duration%60).toString().padStart(2,"0")}s`;
        listDiv.innerHTML += `
          <div style="margin-bottom:12px;">
            <img src="${v.thumbnail}" width="160" alt="Thumbnail">
            <p><strong>${v.title}</strong></p>
            <p>Durée : ${durationStr}</p>
            <p>URL : <a href="${v.webpage_url}" target="_blank">${v.webpage_url}</a></p>
          </div>
        `;
      });
      infoDiv.classList.add("visible");
    return;
  }


    // Vidéo normale
    const durationStr = `${Math.floor(data.duration/60)}m ${(data.duration%60)
      .toString()
      .padStart(2,"0")}s`;
    const sizeStr = formatSize(data.filesize_approx);
    const readableDate = formatDate(data.upload_date);
    const categories = data.categories?.join(", ") || "Non spécifiées";

    infoDiv.innerHTML = `
      <h3>${data.title}</h3>
      <img src="${data.thumbnail}" width="320" alt="Thumbnail">
      <ul>
        <li><strong>Durée :</strong> ${durationStr}</li>
        <li><strong>Uploader :</strong> ${data.uploader || "Inconnu"}</li>
        <li><strong>Date d’upload :</strong> ${readableDate}</li>
        <li><strong>Vues :</strong> ${data.view_count?.toLocaleString() || "?"}</li>
        <li><strong>Likes :</strong> ${data.like_count?.toLocaleString() || "?"}</li>
        <li><strong>URL :</strong> <a href="${data.webpage_url}" target="_blank">${data.webpage_url}</a></li>
        <li><strong>Channel :</strong> <a href="${data.channel_url}" target="_blank">${data.channel_url}</a></li>
        <li><strong>Taille estimée :</strong> ${sizeStr}</li>
        <li><strong>Catégories :</strong> ${categories}</li>
      </ul>
    `;
    infoDiv.classList.add("visible");
  });
})