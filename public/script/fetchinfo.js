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

    if (!res.ok) return { error: `An Error occured when fetching info` };

    const data = await res.json();
    if (!data) return { error: "Data is Missing" };

    return data;
  } catch (e) {
    return { error: "Network or JSON Issue" };
  }
}


async function init() {

  document.addEventListener("DOMContentLoaded", () => {
    const urlInput = document.getElementById("UrlInput");
    const infoDiv = document.getElementById("videoInfo");
    const loaderBox = document.getElementById("loaderBox");

    let lastFetchedUrl = "";

    urlInput.addEventListener("input", async () => {

      const configFeatures = await window.electronAPI.getFeatures();
      if (!configFeatures.autoCheckInfo) return;

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
          <div class="playlist-header">
            <div class="playlist-info">
              <div class="playlist-badge">Detected Playlist</div>
              <h3 class="playlist-title">${data.title}</h3>
              <div class="playlist-meta">
                <span class="playlist-count">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  ${data.count} vidéos
                </span>
                ${data.channel ? `<span class="playlist-channel">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                    <path d="M5 20C5 16.134 8.134 13 12 13C15.866 13 19 16.134 19 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  ${data.channel}
                </span>` : ''}
              </div>
            </div>
          </div>
          <div id="playlistVideos"></div>
        `;

        const listDiv = document.getElementById("playlistVideos");

        data.videos.forEach(v => {
          const durationStr = v.duration
            ? `${Math.floor(v.duration / 60)}:${(v.duration % 60).toString().padStart(2,"0")}` : "--:--";

          const videoUrl = v.id ? `https://www.youtube.com/watch?v=${v.id}` : v.url;

          listDiv.innerHTML += `
            <div class="playlist-video-card">
              <div class="video-thumbnail-wrapper">
                <img src="${v.thumbnail}" alt="${v.title}" class="video-thumbnail">
                <span class="video-duration">${durationStr}</span>
              </div>
              <div class="video-content">
                <h4 class="video-title" title="${v.title}">${v.title}</h4>
                ${v.uploader ? `<p class="video-uploader">${v.uploader}</p>` : ''}
                <div class="video-actions">
                  <a href="${videoUrl}" target="_blank" class="video-link">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Ouvrir
                  </a>
                  <button class="copy-btn" data-url="${videoUrl}" title="Copier l'URL">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
                      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          `;
        });

        // Gestion du bouton copier
        listDiv.addEventListener("click", (event) => {
          if (event.target.classList.contains("copy-btn") || event.target.closest(".copy-btn")) {
            const btn = event.target.closest(".copy-btn") || event.target;
            if (btn.disabled) return;

            btn.disabled = true;
            const url = btn.dataset.url;
            navigator.clipboard.writeText(url)
              .then(() => {
                const original = btn.innerHTML;

                btn.style.opacity = 0;
                btn.style.transform = "scale(0.7)";

                setTimeout(() => {
                  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>`;
                  btn.style.opacity = 1;
                  btn.style.transform = "scale(1)";

                  setTimeout(() => {
                    btn.style.opacity = 0;
                    btn.style.transform = "scale(0.7)";

                    setTimeout(() => {
                      btn.innerHTML = original;
                      btn.style.opacity = 1;
                      btn.style.transform = "scale(1)";
                      btn.disabled = false;
                    }, 300);

                  }, 1000);

                }, 300);
              })
              .catch(() => {
                const original = btn.innerHTML;
                btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                </svg>`;
                setTimeout(() => {
                  btn.innerHTML = original;
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
        : "Unknown";

      const sizeStr = formatSize(data.filesize_approx);
      const readableDate = formatDate(data.upload_date);
      const categories = data.categories?.join(", ") || "Non spécifiées";

      infoDiv.innerHTML = `
        <h3>${data.title}</h3>
        <img src="${data.thumbnail}" width="320" alt="Thumbnail">
        <ul>
          <li><strong>Duration :</strong> ${durationStr}</li>
          <li><strong>Uploader :</strong> ${data.uploader || "Inconnu"}</li>
          <li><strong>Upload Date :</strong> ${readableDate}</li>
          <li><strong>Views :</strong> ${data.view_count?.toLocaleString() || "?"}</li>
          <li><strong>Likes :</strong> ${data.like_count?.toLocaleString() || "?"}</li>
          <li><strong>URL :</strong> <a href="${data.webpage_url}" target="_blank">${data.webpage_url}</a></li>
          <li><strong>Channel :</strong> <a href="${data.channel_url}" target="_blank">${data.channel_url}</a></li>
          <li><strong>Estimed Size :</strong> ${sizeStr}</li>
          <li><strong>Category :</strong> ${categories}</li>
        </ul>
      `;

      infoDiv.classList.add("visible");
    });

  })

};

init();