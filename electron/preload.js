const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronNotify", (payload) => {
  ipcRenderer.send("notify", payload);
});

contextBridge.exposeInMainWorld("windowFocus", {
  onChange: (cb) => ipcRenderer.on("window-focus", (_event, focused) => cb(focused)),
});

contextBridge.exposeInMainWorld("appIcon", {
  set: (active) => ipcRenderer.send("set-app-icon", active),
});

contextBridge.exposeInMainWorld("credentials", {
  saveEmail: (email) => ipcRenderer.invoke("save-email", email),
  loadEmail: () => ipcRenderer.invoke("load-email"),
  clearEmail: () => ipcRenderer.invoke("clear-email"),
  savePassword: (email, password) => ipcRenderer.invoke("save-password", email, password),
  loadPassword: (email) => ipcRenderer.invoke("load-password", email),
  deletePassword: (email) => ipcRenderer.invoke("delete-password", email),
});
