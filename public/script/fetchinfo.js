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

    if (!res.ok) return { error: `Erreur Lors de la récupération des informations` };

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
  const loaderBox = document.getElementById("loaderBox");

  let lastFetchedUrl = "";

  urlInput.addEventListener("input", async () => {
    const url = urlInput.value.trim();

    // Si champ vide -> reset total
    if (!url || url.length < 2) {
      infoDiv.innerHTML = "";
      infoDiv.classList.remove("visible", "playlist-mode");
      lastFetchedUrl = "";
      return;
    }

    if (url === lastFetchedUrl) return;
    lastFetchedUrl = url;

    loaderBox.style.display = "flex";
    const data = await fetchVideoInfo(url);
    loaderBox.style.display = "none";

    // Gestion des erreurs
    if (data.error) {
      infoDiv.innerHTML = `
        <div style="
          padding:7px;
          background:var(----infos-box-color);
        ">
          <strong>${data.error}</strong> 
        </div>
      `;
      infoDiv.classList.add("visible");
      infoDiv.classList.remove("playlist-mode");
      loaderBox.style.display = "none";
      return;
    }

    // ---------- PLAYLIST ----------
    if (data.type === "playlist") {
      infoDiv.classList.add("playlist-mode");
      infoDiv.innerHTML = `
        <h3 style="color:var(--video-info-heading-color);"><strong>Playlist détectée: ${data.title}</strong></h3>
        <h3 style="color:var(--video-info-heading-color);"><strong>Nombre de vidéos: ${data.count}</strong></h3>
        <p><strong>Channel :</strong> ${data.channel || "Unknown"}</p>
        <div id="playlistVideos"></div>
      `;

      const listDiv = document.getElementById("playlistVideos");

      data.videos.forEach(v => {
        const durationStr = v.duration
          ? `${Math.floor(v.duration / 60)}m ${(v.duration % 60).toString().padStart(2,"0")}s` : "Inconnue";

        const videoUrl = v.id ? `https://www.youtube.com/watch?v=${v.id}` : v.url;

        listDiv.innerHTML += `
          <div style="margin-bottom:12px;">
            <img src="${v.thumbnail}" width="160" alt="Thumbnail">
            <p><strong>${v.title}</strong></p>
            <p>Durée : ${durationStr}</p>
            <p><a href="${videoUrl}" target="_blank">URL</a>
              <button class="copy-btn" data-url="${videoUrl}">📋</button>
            </p>
          </div>
        `;
      });

      // Gestion du bouton copier
      listDiv.addEventListener("click", (event) => {
        if (event.target.classList.contains("copy-btn")) {
          const btn = event.target;
          if (btn.disabled) return;

          btn.disabled = true;
          const url = btn.dataset.url;
          navigator.clipboard.writeText(url)
            .then(() => {
              const original = btn.textContent;

              btn.style.opacity = 0;
              btn.style.transform = "scale(0.7)";

              setTimeout(() => {
                btn.textContent = "✅";
                btn.style.opacity = 1;
                btn.style.transform = "scale(1)";

                setTimeout(() => {
                  btn.style.opacity = 0;
                  btn.style.transform = "scale(0.7)";

                  setTimeout(() => {
                    btn.textContent = original;
                    btn.style.opacity = 1;
                    btn.style.transform = "scale(1)";
                    btn.disabled = false;
                  }, 300);

                }, 1000);

              }, 300);
            })
            .catch(() => {
              const original = btn.textContent;
              btn.textContent = "❌";
              setTimeout(() => {
                btn.textContent = original;
                btn.disabled = false;
              }, 1500);
            });
        }
      });

      infoDiv.classList.add("visible");
      return;
    }

    infoDiv.classList.remove("playlist-mode");

    // ---------- VIDEO NORMALE ----------
    const durationStr = data.duration
      ? `${Math.floor(data.duration/60)}m ${(data.duration%60).toString().padStart(2,"0")}s`
      : "Inconnue";

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