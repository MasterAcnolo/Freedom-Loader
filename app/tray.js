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
 * - Load the appropriate icon for the OS.
 * - Build the right-click context menu.
 * - Handle left-click behavior (toggle window visibility).
 *
 * @param {import('electron').BrowserWindow} mainWindow - The main application window.
 * @param devMode - is application packaged
 * @returns {Tray} The created Tray instance.
 */
function createSystemTray(mainWindow, devMode) {
    // Prevent creating multiple instances
    if (tray) return tray;

    /**
     * Resolve the icon path.
     * Tip: Use a .png for Linux/macOS and a .ico for Windows for best results.
     * Here we use a generic PNG assuming it exists in your resources folder.
     */
    const iconPath = devMode ?
        path.join(__dirname, "..", "build", "app-icon-64x64.png") :
        path.join(process.resourcesPath, "build", "app-icon-64x64.png");

    if (!fs.existsSync(iconPath)) {
        logger.error(`❌ ERREUR : L'icône du Tray est introuvable à ce chemin : ${iconPath}`);
    } else {
        logger.info(`✅ Icône trouvée pour le Tray !`);
    }

    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon);
    tray.setToolTip("Freedom Loader");

    /**
     * The context menu (Right-click).
     */
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Show Freedom Loader",
            click: () => {
                mainWindow.show();
            },
        },
        {type: "separator"},
        {
            label: "Quit",
            click: () => {
                /**
                 * Tell the app it's a deliberate exit,
                 * bypassing the "minimize to tray" behavior.
                 */
                app.isQuitting = true;
                app.quit();
            },
        },
    ]);

    tray.setContextMenu(contextMenu);

    /**
     * Left-click behavior: Toggle window visibility.
     * Note: macOS doesn't usually use left-click on tray, but Windows/Linux do.
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