<div align="center">
  <img
    src="./build/banner.png"
    alt="Banner"
    style="width: 50%;;"/>

</div>

<div align="center">
  <a href="https://github.com/MasterAcnolo/Freedom-Loader/releases">
    <img src="https://img.shields.io/badge/Release-1.3.0-blue?style=for-the-badge">
  </a>
  <a href="https://masteracnolo.github.io/FreedomLoader/index.html">
    <img src="https://img.shields.io/badge/Freedom%20Loader-Open%20Page-111111?style=for-the-badge&logo=terminal&logoColor=white">
  </a>
  <a href="https://www.firefox.com/fr/?utm_campaign=SET_DEFAULT_BROWSER">
    <img src="https://img.shields.io/badge/Require Firefox-E66000?style=for-the-badge&logo=Firefox-Browser&logoColor=white">
  </a>
</div>
<br>

Freedom Loader is a **Windows desktop** application built with **Electron**.  
It provides a simple and reliable way to download video or audio content with metadata and advanced options, without ads or questionable third-party services.  
The goal is to offer a clean, user-friendly, and transparent download experience. It's important for me to make media content downloading accessible to people who love music or videos and don’t always have an internet connection.

---

## Features

- Video download with metadata (MP4)
- Audio-only download with thumbnail and tags (MP3)
- Full playlist support and better display in UI
- Automatic metadata retrieval (title, duration, author, etc.)
- Detailed logs (console + rotating files for 7 days)
- Progress Bar for download and network speed indicator
- Better UX when fetching info
- Custom output path with persistence
- Automatic dependency updates (YT-DLP)
- Automatic Application Update
- Multiple UI themes
- Simple, responsive interface
- Notifications on download completion (click to open folder)
- Discord Rich Presence

---

## Installation

Download the latest installer from the **Releases** page and run it (Defender could stop you but click on "Run Anyway" and it's good).  
Actually, **Firefox Browser** is the only browser supported for get cookies. You should install it. Follow the tutorial in the wiki page if you need some help, Firefox Section. [Link](https://masteracnolo.github.io/FreedomLoader/pages/wiki.html)

---

## FAQ

### Where are my downloaded files stored?

In your **Downloads** folder, inside **Freedom Loader**.  
Example path:  
`C:\Users\[YOUR NAME]\Downloads\Freedom Loader`

### I get an error after launching the app

Try restarting the application, checking the logs, or opening the developer console:  
`CTRL + SHIFT + I` -> “Toggle Developer Tools”.

<p align="center">
  <img src="build/example-developertools.png" width="20%" />
</p>

---

## Roadmap

- [x] ~~Website for Freedom Loader~~
- [ ] More format options
- [ ] Linux version
- [x] ~~Auto-updating YT-DLP~~
- [x] ~~Automatic project updates~~
- [x] ~~Better download status~~
- [ ] Better website support (currently only YouTube is fully supported, other site could work but i can't prove it)
- [ ] Subtitle support
- [x] ~~UI/UX improvements~~
- [ ] Language selection
- [ ] Download specific parts of a video
- [ ] Custom file naming
- [ ] Parallel downloads
- [ ] Automatic sponsor skipping
- [x] ~~Extract/split video using native chapters~~
- [x] ~~Custom output path selection~~

---

## Preview

<p align="center">
  <img src="build/apercu1.2.4.png" width="40%" />
</p>

---

## Technologies

This project uses:

<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">

  <a href="https://github.com/yt-dlp/yt-dlp">
    <img src="https://img.shields.io/badge/yt--dlp-Visit%20Repo-cf0000?style=for-the-badge&logo=github&logoColor=white">
  </a>

  <a href="https://github.com/FFmpeg/FFmpeg">
    <img src="https://img.shields.io/badge/FFmpeg-Visit%20Repo-666666?style=for-the-badge&logo=ffmpeg&logoColor=white" />
  </a>

  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Node.js-Visit%20Repo-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  </a>

  <a href="https://github.com/electron/electron">
    <img src="https://img.shields.io/badge/Electron-Visit%20Repo-47848F?style=for-the-badge&logo=electron&logoColor=white" />
  </a>

  <a href="https://github.com/denoland/deno/">
    <img src="https://img.shields.io/badge/Deno-Visit%20Repo-14e0cc?style=for-the-badge&logo=deno&logoColor=white" />
  </a>

</div>

---

## Contributing

Contributions are welcome.

### Bug Reports

Use the GitHub Issues system and include reproduction steps and logs when possible.  
Logs can be found here:  
`C:\Users\[USERNAME]\AppData\Local\FreedomLoader\logs\LOGS-20xx-xx-xx.log`

### Feature Requests

Open a feature request issue with a clear description and use cases.

### Pull Requests

Fork the repository, make your changes, and submit a PR once everything is tested and clean.

---

## Support the Project

If you'd like to support development:

<a href="https://paypal.me/axelnicolas25">
  <img src="https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white" />
</a>

---

## License

Freedom Loader is released under the **GNU General Public License v3.0 (GPLv3)**.  
You are free to use, modify, and redistribute the software under the terms of this license.

See the full license in the [LICENSE](./LICENSE) file.

---

## Note

AI assistance was used occasionally to speed up development, but all code and decisions were reviewed and validated manually.
