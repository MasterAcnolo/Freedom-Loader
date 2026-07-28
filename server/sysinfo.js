const os = require("os");
const fs = require("fs");
const { execSync } = require("child_process");
const { app } = require("electron");

/**
 * Reads /etc/os-release to get the Linux distribution name
 */
function getLinuxDistro() {
    try {
        const content = fs.readFileSync("/etc/os-release", "utf-8");
        const pretty = content.match(/^PRETTY_NAME="?(.+?)"?$/m);
        if (pretty) return pretty[1];
        const name = content.match(/^NAME="?(.+?)"?$/m);
        return name ? name[1] : "Unknown Linux";
    } catch {
        return "Unknown Linux";
    }
}

/**
 * Reads the package-type file written by electron-builder
 * to determine how the app was distributed (rpm, snap, AppImage, deb...)
 */
function getPackageType() {
    try {
        const pkgTypePath = require("path").join(process.resourcesPath, "package-type");
        if (fs.existsSync(pkgTypePath)) {
            return fs.readFileSync(pkgTypePath, "utf-8").trim();
        }
    } catch { /* ignore */ }
    return "unknown";
}

/**
 * Checks if Firefox is installed on the current platform
 */
function detectFirefox() {
    const platform = process.platform;

    if (platform === "win32") {
        const paths = [
            "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
            "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe",
            `${process.env.LOCALAPPDATA}\\Mozilla Firefox\\firefox.exe`,
        ];
        return paths.some(p => fs.existsSync(p));
    }

    if (platform === "linux") {
        const paths = [
            "/usr/bin/firefox",
            "/usr/bin/firefox-esr",
            "/usr/local/bin/firefox",
            "/snap/bin/firefox",
            "/var/lib/flatpak/exports/bin/org.mozilla.firefox",
            `${os.homedir()}/.local/share/flatpak/exports/bin/org.mozilla.firefox`,
        ];
        if (paths.some(p => fs.existsSync(p))) return true;
        try { execSync("which firefox", { stdio: "ignore" }); return true; } catch { return false; }
    }

    return false;
}

/**
 * Builds the system info object logged at startup
 * 
 * @param {string} logDir - path to the log directory
 * @param {string} downloadPath - current configured download path
 */
function getSystemInfo(logDir, downloadPath) {
    const platform = process.platform;
    const cpus = os.cpus();
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
    const freeMem  = (os.freemem()  / 1024 / 1024 / 1024).toFixed(1);

    let platformLabel;
    if (platform === "win32") {
        platformLabel = `Windows (${os.release()})`;
    } else if (platform === "linux") {
        platformLabel = `Linux — ${getLinuxDistro()}`;
    } else {
        platformLabel = `${platform} ${os.release()} (unsupported)`;
    }

    const info = {
        "Platform":        platformLabel,
        "Architecture":    os.arch(),
        "CPU":             cpus.length ? `${cpus[0].model.trim()} (${cpus.length} cores)` : "Unknown",
        "Memory":          `${freeMem} GB free / ${totalMem} GB total`,
        "Locale":          app.getLocale(),
        "Electron":        process.versions.electron,
        "Node":            process.versions.node,
        "Packaged":        String(app.isPackaged),
        "Package type":    app.isPackaged ? getPackageType() : "dev",
        "Firefox present": detectFirefox() ? "Yes" : "No — cookie features unavailable",
        "Log directory":   logDir,
        "Download path":   downloadPath,
    };

    // Linux-specific extras
    if (platform === "linux") {
        const sessionType = process.env.XDG_SESSION_TYPE || "unknown";
        const waylandDisplay = process.env.WAYLAND_DISPLAY;
        const x11Display = process.env.DISPLAY;

        info["Display server"]  = waylandDisplay
            ? `Wayland (${waylandDisplay})`
            : x11Display
            ? `X11 (${x11Display})`
            : sessionType !== "unknown"
            ? sessionType
            : "unknown";

        info["Desktop env"] = process.env.XDG_CURRENT_DESKTOP || process.env.DESKTOP_SESSION || "unknown";
    }

    return info;
}

/**
 * Logs system info at application startup
 *
 * @param {object} logger - winston logger instance
 * @param {string} logDir - path to the log directory
 * @param {string} downloadPath - current configured download path
 */
function logSystemInfo(logger, logDir, downloadPath) {
    const info = getSystemInfo(logDir, downloadPath);
    const maxKeyLen = Math.max(...Object.keys(info).map(k => k.length));

    logger.info("=".repeat(60));
    logger.info("SYSTEM INFO");
    logger.info("=".repeat(60));
    for (const [key, val] of Object.entries(info)) {
        logger.info(`  ${key.padEnd(maxKeyLen)} : ${val}`);
    }
    logger.info("=".repeat(60));
}

module.exports = { logSystemInfo };