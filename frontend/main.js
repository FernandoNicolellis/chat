const { app, BrowserWindow, Tray, Menu, Notification, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'icon.png')
  });
  mainWindow.loadFile('index.html');
  mainWindow.on('minimize', function (event) {
    event.preventDefault();
    mainWindow.hide();
  });
}

app.whenReady().then(() => {
  createWindow();
  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow.show() },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('chatPro');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => mainWindow.show());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('notify-message', (event, message) => {
  new Notification({ title: 'New Chat Message', body: message }).show();
});
