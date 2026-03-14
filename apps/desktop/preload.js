const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('friendlyCodex', {
  chooseFolder: () => ipcRenderer.invoke('choose-folder'),
  getAppSettings: () => ipcRenderer.invoke('get-app-settings'),
  updateAppSettings: (settings) => ipcRenderer.invoke('update-app-settings', settings),
  setWorkingFolder: (folder) => ipcRenderer.invoke('set-working-folder', folder),
  getDebugState: () => ipcRenderer.invoke('get-debug-state'),
  getAuthState: () => ipcRenderer.invoke('get-auth-state'),
  refreshAuthStatus: () => ipcRenderer.invoke('refresh-auth-status'),
  startAuthFlow: (method) => ipcRenderer.invoke('start-auth-flow', method),
  runTask: (payload) => ipcRenderer.invoke('run-task', payload),
  cancelTask: () => ipcRenderer.invoke('cancel-task'),
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', () => callback()),
  onSettingsUpdated: (callback) => ipcRenderer.on('settings-updated', (_event, value) => callback(value)),
  onDebugStateUpdated: (callback) => ipcRenderer.on('debug-state-updated', (_event, value) => callback(value)),
  onAuthStateUpdated: (callback) => ipcRenderer.on('auth-state-updated', (_event, value) => callback(value)),
  onStatus: (callback) => ipcRenderer.on('runner-status', (_event, value) => callback(value)),
  onEvent: (callback) => ipcRenderer.on('runner-event', (_event, value) => callback(value)),
  onMessage: (callback) => ipcRenderer.on('runner-message', (_event, value) => callback(value)),
  onCommand: (callback) => ipcRenderer.on('runner-command', (_event, value) => callback(value)),
  onFinal: (callback) => ipcRenderer.on('runner-final', (_event, value) => callback(value)),
  onUsage: (callback) => ipcRenderer.on('runner-usage', (_event, value) => callback(value)),
  onError: (callback) => ipcRenderer.on('runner-error', (_event, value) => callback(value)),
  onStderr: (callback) => ipcRenderer.on('runner-stderr', (_event, value) => callback(value)),
  onClose: (callback) => ipcRenderer.on('runner-close', (_event, value) => callback(value))
});
