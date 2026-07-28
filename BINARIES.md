# External binaries

This project depends on three external tools that are **not bundled in the repository**.  
You must download them manually and place each binary in the correct folder before building or running the app locally.

---

## Required tools

| Tool    | Role                                        |
|---------|---------------------------------------------|
| yt-dlp  | Video and audio download engine             |
| ffmpeg  | Media encoding, transcoding, muxing         |
| ffprobe | Media file analysis and metadata extraction |
| deno    | JavaScript / TypeScript runtime             |

---

## Folder structure

Place the binaries exactly as shown below.  
Do not rename them — the application resolves them by these exact names.

```
resources/
└── binaries/
    ├── linux/
    │   ├── yt-dlp
    │   ├── ffmpeg
    │   ├── ffprobe
    │   └── deno
    └── win-32/
        ├── yt-dlp.exe
        ├── ffmpeg.exe
        ├── ffprobe.exe
        └── deno.exe
```

---

## Download links

### yt-dlp

| Platform | URL                                                                  |
|----------|----------------------------------------------------------------------|
| Windows  | https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe |
| Linux    | https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp     |

Rename the downloaded file to `yt-dlp` (or `yt-dlp.exe` on Windows).

---

### ffmpeg and ffprobe

**Windows and Linux** — both binaries are included in the same archive.

| Platform    | URL                                                                                                       |
|-------------|-----------------------------------------------------------------------------------------------------------|
| Windows x64 | https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip         |
| Linux x64   | https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz    |
| Linux arm64 | https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linuxarm64-gpl.tar.xz |

Extract the archive and copy `ffmpeg` and `ffprobe` from the `bin/` subfolder.

---

### deno

| Platform    | URL                                                                                          |
|-------------|----------------------------------------------------------------------------------------------|
| Windows x64 | https://github.com/denoland/deno/releases/latest/download/deno-x86_64-pc-windows-msvc.zip    |
| Linux x64   | https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip  |
| Linux arm64 | https://github.com/denoland/deno/releases/latest/download/deno-aarch64-unknown-linux-gnu.zip |

Each archive contains a single binary. Rename it to `deno` (or `deno.exe` on Windows).

---

## Permissions (Linux )

After placing the binaries, make them executable:

```bash
chmod +x resources/binaries/linux/yt-dlp
chmod +x resources/binaries/linux/ffmpeg
chmod +x resources/binaries/linux/ffprobe
chmod +x resources/binaries/linux/deno
```

---

## Notes

- These binaries are excluded from version control via `.gitignore`.
- Always use the latest stable release of each tool.