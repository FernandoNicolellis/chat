const { app, BrowserWindow, ipcMain, Notification, Menu, Tray, nativeImage } = require("electron");
const path = require("path");
const net = require("net");
const fs = require("fs");
const { spawn } = require("child_process");
const Store = require("electron-store");
const keytar = require("keytar");

//const URL = "http://62.146.177.17:1111/"
const URL = "http://localhost:1111"

let mainWindow;
let tray = null;
let isQuitting = false;
let activeNotifications = [];
const gotSingleInstanceLock = app.requestSingleInstanceLock();
const store = new Store();
const KEYTAR_SERVICE = "ChatPro";

// Prevent multiple app instances; extra launches should reuse the first one.
if (!gotSingleInstanceLock) {
  app.quit();
}

// If a second instance is launched, bring the existing window to the front.
app.on("second-instance", () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
});

// Register app auto-start at OS login (Windows packaged builds only).
function configureAutoStart() {
  // Only register startup for installed app builds.
  if (!app.isPackaged) return;
  if (process.platform !== "win32") return;

  app.setLoginItemSettings({
    openAtLogin: true,
    enabled: true,
    path: process.execPath,
  });
}

// Load and resize icons to preserve aspect ratio and improve Windows clarity.
function resolveIconPath(filename) {
  const candidates = [
    path.join(__dirname, "build", filename),
    path.join(process.resourcesPath || "", "build", filename),
    path.join(process.resourcesPath || "", "app.asar.unpacked", "build", filename),
  ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return null;
}

// Load and resize icons to preserve aspect ratio and improve Windows clarity.
function loadWindowIcon(filename) {
  const iconPath = resolveIconPath(filename);
  if (!iconPath) return null;

  const image = nativeImage.createFromPath(iconPath);
  if (image.isEmpty()) return null;

  // Avoid cropping: keep aspect ratio and scale to a large size for clarity.
  const { width, height } = image.getSize();
  if (width >= height) {
    return image.resize({ width: 512, quality: "best" });
  }
  return image.resize({ height: 512, quality: "best" });
}

// Create the main browser window and wire window lifecycle behavior.
function createWindow() {
  const openedAtLogin = app.getLoginItemSettings().wasOpenedAtLogin;
  const baseIcon = process.platform === "win32" ? loadWindowIcon("iconMsg.png") : resolveIconPath("iconMsg.png");
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    icon: baseIcon,
    show: !openedAtLogin,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });
  mainWindow.loadURL(URL);

  if (openedAtLogin) {
    mainWindow.hide();
  }

  mainWindow.on("focus", () => {
    mainWindow.webContents.send("window-focus", true);
  });
  mainWindow.on("blur", () => {
    mainWindow.webContents.send("window-focus", false);
  });

  if (process.platform === "win32") {
    mainWindow.on("close", (event) => {
      if (!isQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
    });
  }
}

// Update the taskbar/window icon based on unread-message count.
function setAppIcon(num) {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    let iconName = ''
    if (num == 0) iconName = "iconMsg.png"
    else if (num >= 1 && num <= 9) iconName = "iconMsg" + num + ".png"
    else if (num >= 10) iconName = "iconMsgPlus.png"

    const icon = process.platform === "win32" ? loadWindowIcon(iconName) : resolveIconPath(iconName);
    if (!icon) return;
    mainWindow.setIcon(icon); // win/linux runtime window icon
}

// Create system tray icon/menu and provide quick open/exit actions.
function createTray() {
  if (process.platform !== "win32") return;
  if (tray) return;

  const trayIconPath = resolveIconPath("iconMsg.png");
  if (!trayIconPath) return;

  const trayImage = nativeImage.createFromPath(trayIconPath).resize({ width: 16, height: 16, quality: "best" });
  tray = new Tray(trayImage.isEmpty() ? trayIconPath : trayImage);
  tray.setToolTip("ChatPro");

  const openApp = () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  };

  tray.on("click", openApp);
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Open ChatPro", click: openApp },
      {
        label: "Exit",
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ])
  );
}

let serverProcess;

// Check whether the local HTTP server is already listening on a port.
function isPortInUse(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" });
    socket.on("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => {
      resolve(false);
    });
  });
}

// Start the local Express server as a child process, avoiding duplicate starts.
async function startServer() {
  const serverPath = path.join(__dirname, "..", "server", "server.js");
  if (!fs.existsSync(serverPath)) {
    console.error(`Server file not found: ${serverPath}`);
    return;
  }

  const inUse = await isPortInUse(1111);
  if (inUse) return;

  serverProcess = spawn(process.execPath, [serverPath], {
    stdio: "inherit",
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
    },
  });
}

// Menu.setApplicationMenu(null)

// App bootstrap sequence after Electron is ready.
app.whenReady().then(() => {
  configureAutoStart();
  startServer();
  createWindow();
  createTray();
});

// Quit behavior: keep running in tray on Windows, standard close elsewhere.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && process.platform !== "win32") app.quit();
});

// Ensure child server process is terminated when the app exits.
app.on("quit", () => {
  if (serverProcess) serverProcess.kill();
});

// Mark intentional quit so close-to-tray logic does not intercept.
app.on("before-quit", () => {
  isQuitting = true;
});


if (process.platform === 'win32') {
    // Required for proper Windows notifications/taskbar identity.
    app.setAppUserModelId(process.execPath);
}

// Renderer -> main notification bridge.
ipcMain.on("notify", (event, payload) => {
    // Close all previous notifications
    activeNotifications.forEach(notif => notif.close());
    activeNotifications = [];

    const notification = new Notification({
        title: payload.title || "New message",
        body: payload.body || "",
    //icon: '',
  })

    notification.on('click', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
        }
        // Close this notification after click
        notification.close();
    });

    activeNotifications.push(notification);
    notification.show();
});

// Renderer request to change app icon badge state.
ipcMain.on("set-app-icon", (_event, num) => {
  setAppIcon(Number(num));
});

// Persist login email in local app storage.
ipcMain.handle("save-email", (_event, email) => {
  if (!email) return false;
  store.set("email", String(email));
  return true;
});

// Read saved login email.
ipcMain.handle("load-email", () => {
  return store.get("email", "");
});

// Remove saved login email.
ipcMain.handle("clear-email", () => {
  store.delete("email");
  return true;
});

// Save password securely in OS keychain/credential vault.
ipcMain.handle("save-password", async (_event, email, password) => {
  if (!email || !password) return false;
  await keytar.setPassword(KEYTAR_SERVICE, String(email), String(password));
  return true;
});

// Load password from OS keychain/credential vault.
ipcMain.handle("load-password", async (_event, email) => {
  if (!email) return "";
  const pwd = await keytar.getPassword(KEYTAR_SERVICE, String(email));
  return pwd || "";
});

// Delete password from OS keychain/credential vault.
ipcMain.handle("delete-password", async (_event, email) => {
  if (!email) return false;
  return await keytar.deletePassword(KEYTAR_SERVICE, String(email));
});
