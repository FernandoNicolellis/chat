const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  notifyMessage: (msg) => ipcRenderer.send('notify-message', msg)
});
