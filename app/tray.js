const {app, Menu, Tray, nativeImage} = require("electron");
const path = require("path");
const {logger} = require("../server/logger"); // Ajuste le chemin si besoin
const fs = require("fs");

/**
 * Global reference to the Tray instance to prevent garbage collection.
 * @type {Tray | null}
 */
let tray = null;

/**
 * Creates and configures the cross-platform System Tray.
 *
 * Responsibilities:
 * - Loads the appropriate icon format based on the operating system.
 * - Builds the right-click context menu.
 * - Handles left-click behavior to toggle main window visibility.
 *
 * @param {import('electron').BrowserWindow} mainWindow - The main application window.
 * @param {boolean} devMode - Indicates whether the application is running in development mode.
 * @returns {Tray} The created Tray instance.
 */
function createSystemTray(mainWindow, devMode) {
    // Prevent creating multiple tray instances
    if (tray) return tray;

    const isWin = process.platform === "win32";
    const iconName = isWin ? "app-icon.ico" : "app-icon-64x64.png"; 

    // Attempt to load the icon from the local build directory first
    let iconPath = path.join(__dirname, "..", "build", iconName);

    // Fallback to the extracted resources path if running in production
    if (!devMode && !fs.existsSync(iconPath)) {
        iconPath = path.join(process.resourcesPath, iconName);
    }

    if (!fs.existsSync(iconPath)) {
        logger.error(`System Tray icon not found at resolved path: ${iconPath}`);
    } else {
        logger.info("System Tray icon resolved successfully.");
    }
    
    const icon = nativeImage.createFromPath(iconPath);    

    if (icon.isEmpty()) {
        logger.error("System Tray icon file was found but could not be decoded by Electron (image is empty).");
    }

    tray = new Tray(icon);
    tray.setToolTip("Freedom Loader");

    /**
     * System Tray Context Menu (Right-click action).
     */
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Show Freedom Loader",
            click: () => {
                mainWindow.show();
            },
        },
        { type: "separator" },
        {
            label: "Quit",
            click: () => {
                /**
                 * Flags the application for a deliberate exit,
                 * bypassing the default "minimize to tray" behavior.
                 */
                app.isQuitting = true;
                app.quit();
            },
        },
    ]);

    tray.setContextMenu(contextMenu);

    /**
     * Left-click behavior: Toggles main window visibility.
     * but it remains standard practice for Windows and Linux environments.
     */
    tray.on("click", () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }
    });

    return tray;
}

/**
 * Safely destroys the tray icon to prevent OS-level crashes (especially on Linux/Wayland).
 * Should be called right before the application quits.
 */
function destroyTray() {
    if (tray && !tray.isDestroyed()) {
        tray.destroy();
        tray = null;
        logger.info("System Tray destroyed cleanly.");
    }
}

module.exports = {createSystemTray, destroyTray};