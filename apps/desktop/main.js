import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CodexRunner } from '../../packages/core/src/codexRunner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let activeRunner = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 760,
    backgroundColor: '#f7f7f7',
    title: 'ChatGPT File Helper',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('choose-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (result.canceled || !result.filePaths[0]) return null;
  return result.filePaths[0];
});

ipcMain.handle('run-task', async (_event, payload) => {
  const { prompt, cwd } = payload;

  if (activeRunner) {
    activeRunner.cancel();
    activeRunner = null;
  }

  activeRunner = new CodexRunner({ cwd });

  activeRunner.on('status', (status) => {
    mainWindow.webContents.send('runner-status', status);
  });

  activeRunner.on('event', (event) => {
    mainWindow.webContents.send('runner-event', event);
  });

  activeRunner.on('final', (message) => {
    mainWindow.webContents.send('runner-final', message);
  });

  activeRunner.on('stderr', (message) => {
    mainWindow.webContents.send('runner-stderr', message);
  });

  activeRunner.on('error', (error) => {
    mainWindow.webContents.send('runner-error', String(error));
  });

  activeRunner.on('close', ({ code, stderr }) => {
    mainWindow.webContents.send('runner-close', { code, stderr });
    activeRunner = null;
  });

  activeRunner.startRun(prompt, {
    cwd,
    skipGitRepoCheck: true
  });

  return { ok: true };
});
