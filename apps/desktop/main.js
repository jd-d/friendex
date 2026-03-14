const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');

let mainWindow;
let debugWindow = null;
let activeRunner = null;
let CodexRunner = null;
let authProcess = null;
let appState = getDefaultAppState();
let debugState = {
  content: ''
};
let authState = {
  state: 'checking',
  mode: 'status',
  message: 'Checking Codex access...'
};
const IGNORABLE_STDERR_PATTERNS = [
  /unknown feature key in config:\s*rmcp_client/i,
  /shell_snapshot: Failed to create shell snapshot for powershell/i,
  /TokenRefreshFailed/i
];
const FRIENDEX_CODEX_CONFIG_OVERRIDES = [
  'mcp_servers={}',
  'features.apps=false'
];

function getDefaultAppState() {
  return {
    workingFolder: '',
    statusBarVisible: true,
    debugMode: 'docked'
  };
}

async function loadCore() {
  const core = await import('../../packages/core/src/codexRunner.js');
  CodexRunner = core.CodexRunner;
}

function getStateFilePath() {
  return path.join(app.getPath('userData'), 'desktop-state.json');
}

function normalizeAppState(savedState = {}) {
  const nextState = getDefaultAppState();
  nextState.workingFolder = typeof savedState.workingFolder === 'string' ? savedState.workingFolder : '';
  nextState.statusBarVisible = savedState.statusBarVisible !== false;
  nextState.debugMode = ['hidden', 'docked', 'popped'].includes(savedState.debugMode)
    ? savedState.debugMode
    : nextState.debugMode;
  return nextState;
}

async function loadAppState() {
  try {
    const raw = await fs.readFile(getStateFilePath(), 'utf8');
    appState = normalizeAppState(JSON.parse(raw));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Could not read desktop state.', error);
    }
    appState = getDefaultAppState();
  }
}

async function saveAppState() {
  await fs.mkdir(path.dirname(getStateFilePath()), { recursive: true });
  await fs.writeFile(getStateFilePath(), JSON.stringify(appState, null, 2), 'utf8');
}

async function normalizeWorkingFolder(folder) {
  const nextFolder = typeof folder === 'string' ? folder.trim() : '';

  if (!nextFolder) {
    return '';
  }

  const stats = await fs.stat(nextFolder);
  if (!stats.isDirectory()) {
    throw new Error('Working folder must be a folder.');
  }

  return nextFolder;
}

async function updateWorkingFolder(folder) {
  appState.workingFolder = await normalizeWorkingFolder(folder);
  await saveAppState();
  return { ...appState };
}

async function updateAppSettings(partialSettings = {}) {
  if (typeof partialSettings.statusBarVisible === 'boolean') {
    appState.statusBarVisible = partialSettings.statusBarVisible;
  }

  if (partialSettings.debugMode) {
    if (!['hidden', 'docked', 'popped'].includes(partialSettings.debugMode)) {
      throw new Error('Unsupported debug mode.');
    }
    appState.debugMode = partialSettings.debugMode;
  }

  await saveAppState();
  applyDebugMode();
  return { ...appState };
}

function getWindowTargets() {
  return [mainWindow, debugWindow].filter((window) => window && !window.isDestroyed());
}

function sendToWindows(channel, payload) {
  for (const window of getWindowTargets()) {
    window.webContents.send(channel, payload);
  }
}

function broadcastSettings() {
  sendToWindows('settings-updated', { ...appState });
}

function broadcastDebugState() {
  sendToWindows('debug-state-updated', {
    content: debugState.content,
    mode: appState.debugMode
  });
}

function setAuthState(partialState) {
  authState = {
    ...authState,
    ...partialState
  };
  sendToWindows('auth-state-updated', { ...authState });
}

function clearDebugLog() {
  debugState.content = '';
  broadcastDebugState();
}

function appendDebugLog(text) {
  if (!text) {
    return;
  }

  debugState.content += text;
  if (!text.endsWith('\n')) {
    debugState.content += '\n';
  }
  broadcastDebugState();
}

function openSettingsPanel() {
  sendToWindows('open-settings');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 980,
    minHeight: 700,
    backgroundColor: '#f7f7f7',
    title: 'Friendex',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

function ensureDebugWindow() {
  if (debugWindow && !debugWindow.isDestroyed()) {
    debugWindow.focus();
    return;
  }

  debugWindow = new BrowserWindow({
    width: 700,
    height: 760,
    minWidth: 520,
    minHeight: 420,
    backgroundColor: '#f7f7f7',
    title: 'Friendex - Debug / events',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  debugWindow.loadFile(path.join(__dirname, 'renderer', 'debug.html'));
  debugWindow.on('closed', () => {
    debugWindow = null;
    if (appState.debugMode === 'popped') {
      appState.debugMode = 'docked';
      void saveAppState();
      broadcastSettings();
      broadcastDebugState();
    }
  });
}

function applyDebugMode() {
  if (appState.debugMode === 'popped') {
    ensureDebugWindow();
  } else if (debugWindow && !debugWindow.isDestroyed()) {
    debugWindow.close();
  }

  broadcastDebugState();
}

function spawnCodexForAuth(args) {
  if (process.platform === 'win32') {
    return spawn('cmd.exe', ['/d', '/s', '/c', ['codex', ...args].join(' ')], {
      env: process.env,
      windowsHide: true
    });
  }

  return spawn('codex', args, {
    env: process.env
  });
}

function formatAuthMessage(stdout, stderr) {
  return [stdout, stderr]
    .filter(Boolean)
    .join('\n')
    .trim()
    .slice(0, 1600);
}

function shouldIgnoreRunnerStderr(message) {
  if (!message) {
    return true;
  }

  if (message.includes('rmcp::') || message.includes('transport::')) {
    return true;
  }

  return IGNORABLE_STDERR_PATTERNS.some((pattern) => pattern.test(message));
}

async function refreshAuthStatus() {
  if (authProcess) {
    return { ...authState };
  }

  setAuthState({
    state: 'checking',
    mode: 'status',
    message: 'Checking Codex access...'
  });

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    const child = spawnCodexForAuth(['login', 'status']);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      const message = formatAuthMessage(stdout, stderr);
      const lowerMessage = message.toLowerCase();

      if (code === 0) {
        setAuthState({
          state: 'signed-in',
          mode: 'status',
          message: message || 'Codex is signed in.'
        });
      } else if (lowerMessage.includes('access is denied') || lowerMessage.includes('error loading configuration')) {
        setAuthState({
          state: 'error',
          mode: 'status',
          message: message || 'Codex access could not be checked.'
        });
      } else {
        setAuthState({
          state: 'signed-out',
          mode: 'status',
          message: message || 'Codex is not signed in.'
        });
      }

      resolve({ ...authState });
    });

    child.on('error', (error) => {
      setAuthState({
        state: 'error',
        mode: 'status',
        message: String(error)
      });
      resolve({ ...authState });
    });
  });
}

function startAuthFlow(method = 'browser') {
  if (authProcess) {
    return {
      ok: false,
      error: 'A Codex sign-in flow is already running.'
    };
  }

  const args = method === 'device' ? ['login', '--device-auth'] : ['login'];
  const startingMessage = method === 'device'
    ? 'Starting device sign-in. Copy the code below if Codex shows one.'
    : 'Starting browser sign-in for Codex.';

  let stdout = '';
  let stderr = '';
  authProcess = spawnCodexForAuth(args);

  setAuthState({
    state: 'in-progress',
    mode: method,
    message: startingMessage
  });

  authProcess.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
    const message = formatAuthMessage(stdout, stderr);
    if (message) {
      setAuthState({
        state: 'in-progress',
        mode: method,
        message
      });
    }
  });

  authProcess.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
    const message = formatAuthMessage(stdout, stderr);
    if (message) {
      setAuthState({
        state: 'in-progress',
        mode: method,
        message
      });
    }
  });

  authProcess.on('close', async (code) => {
    const message = formatAuthMessage(stdout, stderr);
    authProcess = null;

    if (code === 0) {
      setAuthState({
        state: 'signed-in',
        mode: method,
        message: message || 'Codex sign-in completed.'
      });
      await refreshAuthStatus();
      return;
    }

    const lowerMessage = message.toLowerCase();
    setAuthState({
      state: lowerMessage.includes('access is denied') ? 'error' : 'signed-out',
      mode: method,
      message: message || 'Codex sign-in did not complete.'
    });
  });

  authProcess.on('error', (error) => {
    authProcess = null;
    setAuthState({
      state: 'error',
      mode: method,
      message: String(error)
    });
  });

  return { ok: true };
}

app.whenReady().then(async () => {
  await loadCore();
  await loadAppState();

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Restart App',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            if (activeRunner) {
              activeRunner.cancel();
              activeRunner = null;
            }
            app.relaunch();
            app.exit(0);
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' }
      ]
    },
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Open Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            openSettingsPanel();
          }
        }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);

  createWindow();
  applyDebugMode();
  void refreshAuthStatus();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('choose-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    defaultPath: appState.workingFolder || app.getPath('home'),
    properties: ['openDirectory']
  });

  if (result.canceled || !result.filePaths[0]) return null;
  return result.filePaths[0];
});

ipcMain.handle('get-app-settings', () => {
  return { ...appState };
});

ipcMain.handle('update-app-settings', async (_event, partialSettings) => {
  try {
    const settings = await updateAppSettings(partialSettings);
    broadcastSettings();
    return { ok: true, settings };
  } catch (error) {
    return {
      ok: false,
      error: error.message
    };
  }
});

ipcMain.handle('set-working-folder', async (_event, folder) => {
  try {
    const settings = await updateWorkingFolder(folder);
    broadcastSettings();
    return { ok: true, settings };
  } catch (error) {
    return {
      ok: false,
      error: error.code === 'ENOENT' ? 'That folder could not be found.' : error.message
    };
  }
});

ipcMain.handle('cancel-task', () => {
  if (activeRunner) {
    activeRunner.cancel();
    activeRunner = null;
  }
  return { ok: true };
});

ipcMain.handle('get-debug-state', () => {
  return {
    content: debugState.content,
    mode: appState.debugMode
  };
});

ipcMain.handle('get-auth-state', () => {
  return { ...authState };
});

ipcMain.handle('refresh-auth-status', async () => {
  return refreshAuthStatus();
});

ipcMain.handle('start-auth-flow', (_event, method) => {
  return startAuthFlow(method);
});

ipcMain.handle('run-task', async (_event, payload) => {
  const { prompt, cwd } = payload;
  const workingDirectory = cwd || appState.workingFolder || undefined;

  if (activeRunner) {
    activeRunner.cancel();
    activeRunner = null;
  }

  activeRunner = new CodexRunner({ cwd: workingDirectory });
  clearDebugLog();

  activeRunner.on('status', (status) => {
    sendToWindows('runner-status', status);
  });

  activeRunner.on('event', (event) => {
    sendToWindows('runner-event', event);
    if (event.item?.type === 'command_execution' || event.item?.type === 'agent_message') {
      return;
    }
    appendDebugLog(JSON.stringify(event, null, 2));
  });

  activeRunner.on('message', (text) => {
    sendToWindows('runner-message', text);
  });

  activeRunner.on('command', (info) => {
    sendToWindows('runner-command', info);

    if (info.phase === 'started') {
      appendDebugLog(`> Running: ${info.command}`);
      return;
    }

    const icon = info.status === 'failed' ? 'x' : 'ok';
    appendDebugLog(`${icon} Exit ${info.exitCode}: ${info.command}`);
    if (info.output) {
      appendDebugLog(`  ${info.output.trim().slice(0, 500)}`);
    }
    appendDebugLog('');
  });

  activeRunner.on('final', (message) => {
    sendToWindows('runner-final', message);
  });

  activeRunner.on('usage', (usage) => {
    sendToWindows('runner-usage', usage);
  });

  activeRunner.on('stderr', (message) => {
    if (shouldIgnoreRunnerStderr(message)) {
      return;
    }

    sendToWindows('runner-stderr', message);
    appendDebugLog(`STDERR: ${message.trimEnd()}`);
  });

  activeRunner.on('error', (error) => {
    sendToWindows('runner-error', String(error));
    appendDebugLog(`ERROR: ${String(error)}`);
  });

  activeRunner.on('close', ({ code, stderr }) => {
    sendToWindows('runner-close', { code, stderr });
    appendDebugLog(`Process exited with code ${code}.`);
    activeRunner = null;
  });

  activeRunner.startRun(prompt, {
    cwd: workingDirectory,
    skipGitRepoCheck: true,
    configOverrides: FRIENDEX_CODEX_CONFIG_OVERRIDES
  });

  return { ok: true };
});
