import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('friendlyCodex', {
  chooseFolder: () => ipcRenderer.invoke('choose-folder'),
  runTask: (payload) => ipcRenderer.invoke('run-task', payload),
  onStatus: (callback) => ipcRenderer.on('runner-status', (_event, value) => callback(value)),
  onEvent: (callback) => ipcRenderer.on('runner-event', (_event, value) => callback(value)),
  onFinal: (callback) => ipcRenderer.on('runner-final', (_event, value) => callback(value)),
  onError: (callback) => ipcRenderer.on('runner-error', (_event, value) => callback(value)),
  onStderr: (callback) => ipcRenderer.on('runner-stderr', (_event, value) => callback(value)),
  onClose: (callback) => ipcRenderer.on('runner-close', (_event, value) => callback(value))
});
