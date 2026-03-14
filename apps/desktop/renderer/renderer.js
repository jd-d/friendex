const promptInput = document.getElementById('prompt');
const outputGridEl = document.querySelector('.output-grid');
const statusBarEl = document.getElementById('status-bar');
const statusEl = document.getElementById('status');
const statusHelpEl = document.getElementById('status-help');
const finalOutputEl = document.getElementById('final-output');
const runNoteEl = document.getElementById('run-note');
const eventLogEl = document.getElementById('event-log');
const debugPanelEl = document.getElementById('debug-panel');
const settingsButton = document.getElementById('open-settings');
const settingsPanel = document.getElementById('settings-panel');
const settingsBackdrop = document.getElementById('settings-backdrop');
const settingsCwdInput = document.getElementById('settings-cwd');
const chooseFolderBtn = document.getElementById('choose-folder');
const saveFolderBtn = document.getElementById('save-folder');
const clearFolderBtn = document.getElementById('clear-folder');
const closeSettingsBtn = document.getElementById('close-settings');
const settingsNoteEl = document.getElementById('settings-note');
const statusBarToggleEl = document.getElementById('setting-status-bar');
const debugModeSelectEl = document.getElementById('setting-debug-mode');
const authStatusBadgeEl = document.getElementById('auth-status-badge');
const authMessageEl = document.getElementById('auth-message');
const refreshAuthBtn = document.getElementById('refresh-auth');
const startBrowserAuthBtn = document.getElementById('start-browser-auth');
const startDeviceAuthBtn = document.getElementById('start-device-auth');
const runBtn = document.getElementById('run');
const cancelBtn = document.getElementById('cancel');

let currentSettings = {
  workingFolder: '',
  statusBarVisible: true,
  debugMode: 'docked'
};
let currentAuthState = {
  state: 'checking',
  mode: 'status',
  message: 'Checking Codex access...'
};
let currentStatus = 'Idle.';
let cancelRequested = false;
let approvalHintVisible = false;
let permissionBlockDetected = false;
let permissionBlockDetails = '';

function setRunning(running) {
  runBtn.disabled = running;
  cancelBtn.hidden = !running;
}

function syncWorkingFolder() {
  settingsCwdInput.value = currentSettings.workingFolder || '';
}

function setSettingsNote(message, tone = 'muted') {
  settingsNoteEl.textContent = message;
  settingsNoteEl.classList.toggle('error-text', tone === 'error');
}

function openSettings() {
  syncWorkingFolder();
  settingsPanel.classList.add('is-open');
  settingsPanel.setAttribute('aria-hidden', 'false');
  settingsBackdrop.hidden = false;
  requestAnimationFrame(() => settingsCwdInput.focus());
}

function closeSettings() {
  settingsPanel.classList.remove('is-open');
  settingsPanel.setAttribute('aria-hidden', 'true');
  settingsBackdrop.hidden = true;
}

function setStatus(message) {
  currentStatus = message || 'Idle.';
  statusEl.textContent = currentStatus;
  renderStatusHelp();
}

function renderRunNote() {
  if (!permissionBlockDetected) {
    runNoteEl.hidden = true;
    runNoteEl.textContent = '';
    return;
  }

  runNoteEl.hidden = false;
  runNoteEl.textContent = permissionBlockDetails
    || 'This run was blocked by the current Codex permissions. Friendex currently uses non-interactive codex exec, so it cannot pop up a live approval dialog for you here.';
}

function maybeFlagApproval(text) {
  if (!text) {
    return;
  }

  if (/\bapproval\b|\bapprove\b|\bconfirm\b/i.test(text)) {
    approvalHintVisible = true;
    renderStatusHelp();
  }
}

function detectPermissionBlock(text) {
  if (!text) {
    return false;
  }

  return [
    /\bcannot request approval\b/i,
    /\bblocked by the current approval settings\b/i,
    /\bwrite operations are blocked\b/i,
    /\bworkspace is read-only\b/i,
    /\brejected by the sandbox\b/i,
    /\boutside the writable\b/i,
    /\bblocked by current Codex permissions\b/i,
    /\bblocked by policy\b/i
  ].some((pattern) => pattern.test(text));
}

function maybeCapturePermissionBlock(text) {
  if (!detectPermissionBlock(text)) {
    return;
  }

  permissionBlockDetected = true;
  permissionBlockDetails = 'This run was blocked by the current Codex permissions. Friendex currently uses non-interactive codex exec, so Codex finishes with an explanation instead of stopping here for a live approval dialog. Try a read-only planning task, or rerun with Codex permissions that allow the needed action.';
  renderRunNote();
  setStatus('Blocked by current permissions.');
}

function getStatusHelp() {
  if (permissionBlockDetected) {
    return {
      tone: 'alert',
      message: 'Codex did not pause for live approval in this run. It finished with a permissions block instead. Adjust the Codex sandbox or approval settings for the next run if you want it to make changes.'
    };
  }

  if (currentAuthState.state === 'in-progress') {
    return {
      tone: 'alert',
      message: 'Finish the Codex sign-in step that opened outside this window, then return here.'
    };
  }

  if (currentAuthState.state === 'signed-out') {
    return {
      tone: 'alert',
      message: 'Open Settings and use Sign in before starting tasks that need Codex access.'
    };
  }

  if (currentAuthState.state === 'error') {
    return {
      tone: 'alert',
      message: 'Codex access could not be checked here. Open Settings for sign-in tools and details.'
    };
  }

  if (approvalHintVisible || /\bapproval\b|\bapprove\b|\bconfirm\b/i.test(currentStatus)) {
    return {
      tone: 'alert',
      message: 'This integration is non-interactive. If Codex needs more permission than the run allows, it will usually finish with a permissions explanation instead of pausing for a live approval dialog.'
    };
  }

  return {
    tone: 'muted',
    message: 'Friendex currently uses non-interactive codex exec. Open Settings if you need to sign in or change debug visibility.'
  };
}

function renderStatusHelp() {
  const help = getStatusHelp();
  statusHelpEl.textContent = help.message;
  statusHelpEl.classList.toggle('is-alert', help.tone === 'alert');
}

function renderSettings() {
  syncWorkingFolder();
  statusBarToggleEl.checked = currentSettings.statusBarVisible !== false;
  debugModeSelectEl.value = currentSettings.debugMode || 'docked';

  document.body.classList.toggle('status-bar-hidden', currentSettings.statusBarVisible === false);
  statusBarEl.hidden = currentSettings.statusBarVisible === false;

  const showDockedDebug = currentSettings.debugMode === 'docked';
  debugPanelEl.hidden = !showDockedDebug;
  outputGridEl.classList.toggle('debug-hidden', !showDockedDebug);
}

function getAuthBadgeLabel(state) {
  switch (state) {
    case 'signed-in':
      return 'Signed in';
    case 'signed-out':
      return 'Sign-in needed';
    case 'in-progress':
      return 'Sign-in in progress';
    case 'error':
      return 'Could not check access';
    default:
      return 'Checking access...';
  }
}

function renderAuthState() {
  authStatusBadgeEl.dataset.state = currentAuthState.state || 'checking';
  authStatusBadgeEl.textContent = getAuthBadgeLabel(currentAuthState.state);
  authMessageEl.textContent = currentAuthState.message || 'Checking whether Codex is already signed in.';

  const authBusy = currentAuthState.state === 'in-progress';
  refreshAuthBtn.disabled = authBusy;
  startBrowserAuthBtn.disabled = authBusy;
  startDeviceAuthBtn.disabled = authBusy;

  renderStatusHelp();
  renderRunNote();
}

async function saveWorkingFolder(folder) {
  const result = await window.friendlyCodex.setWorkingFolder(folder);
  if (!result.ok) {
    setSettingsNote(result.error || 'Could not save that folder.', 'error');
    return false;
  }

  currentSettings = {
    ...currentSettings,
    ...(result.settings || {})
  };
  renderSettings();
  setSettingsNote(
    currentSettings.workingFolder
      ? 'Working folder saved. New tasks will use it by default.'
      : 'Saved working folder cleared.'
  );
  return true;
}

async function updateAppSettings(partialSettings) {
  const result = await window.friendlyCodex.updateAppSettings(partialSettings);
  if (!result.ok) {
    renderSettings();
    setStatus(result.error || 'Could not update that setting.');
    return false;
  }

  currentSettings = {
    ...currentSettings,
    ...(result.settings || {})
  };
  renderSettings();
  return true;
}

async function refreshAuthState() {
  currentAuthState = await window.friendlyCodex.refreshAuthStatus();
  renderAuthState();
}

async function startAuthFlow(method) {
  const result = await window.friendlyCodex.startAuthFlow(method);
  if (!result.ok) {
    setStatus(result.error || 'Could not start Codex sign-in.');
    return;
  }

  openSettings();
}

async function runTask() {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    setStatus('Please enter a task first.');
    return;
  }

  if (currentAuthState.state === 'in-progress') {
    setStatus('Finish the Codex sign-in step before starting a task.');
    openSettings();
    return;
  }

  approvalHintVisible = false;
  permissionBlockDetected = false;
  permissionBlockDetails = '';
  cancelRequested = false;
  finalOutputEl.textContent = '';
  eventLogEl.textContent = '';
  renderRunNote();
  setStatus('Starting assistant.');
  setRunning(true);

  const result = await window.friendlyCodex.runTask({
    prompt,
    cwd: currentSettings.workingFolder || undefined
  });

  if (!result?.ok) {
    setStatus('Something went wrong.');
    setRunning(false);
  }
}

settingsButton.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
settingsBackdrop.addEventListener('click', closeSettings);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && settingsPanel.classList.contains('is-open')) {
    closeSettings();
  }
});

chooseFolderBtn.addEventListener('click', async () => {
  const folder = await window.friendlyCodex.chooseFolder();
  if (!folder) {
    return;
  }

  settingsCwdInput.value = folder;
  await saveWorkingFolder(folder);
});

saveFolderBtn.addEventListener('click', async () => {
  const saved = await saveWorkingFolder(settingsCwdInput.value);
  if (saved) {
    closeSettings();
  }
});

clearFolderBtn.addEventListener('click', async () => {
  const cleared = await saveWorkingFolder('');
  if (cleared) {
    closeSettings();
  }
});

statusBarToggleEl.addEventListener('change', async () => {
  await updateAppSettings({
    statusBarVisible: statusBarToggleEl.checked
  });
});

debugModeSelectEl.addEventListener('change', async () => {
  await updateAppSettings({
    debugMode: debugModeSelectEl.value
  });
});

refreshAuthBtn.addEventListener('click', refreshAuthState);
startBrowserAuthBtn.addEventListener('click', async () => {
  await startAuthFlow('browser');
});
startDeviceAuthBtn.addEventListener('click', async () => {
  await startAuthFlow('device');
});

for (const button of document.querySelectorAll('.quick-task')) {
  button.addEventListener('click', () => {
    promptInput.value = button.dataset.prompt || '';
    promptInput.focus();
  });
}

runBtn.addEventListener('click', runTask);

cancelBtn.addEventListener('click', async () => {
  cancelRequested = true;
  setStatus('Cancelling...');
  await window.friendlyCodex.cancelTask();
});

window.friendlyCodex.onStatus((status) => {
  maybeFlagApproval(status);
  if (!cancelRequested) {
    setStatus(status);
  }
});

window.friendlyCodex.onOpenSettings(() => {
  openSettings();
});

window.friendlyCodex.onSettingsUpdated((settings) => {
  currentSettings = {
    ...currentSettings,
    ...settings
  };
  renderSettings();
});

window.friendlyCodex.onDebugStateUpdated((debugState) => {
  eventLogEl.textContent = debugState.content || '';
});

window.friendlyCodex.onAuthStateUpdated((authState) => {
  currentAuthState = {
    ...currentAuthState,
    ...authState
  };
  renderAuthState();
});

window.friendlyCodex.onMessage((text) => {
  maybeCapturePermissionBlock(text);
  finalOutputEl.textContent = text;
});

window.friendlyCodex.onEvent((event) => {
  const eventText = JSON.stringify(event);
  maybeFlagApproval(eventText);
  maybeCapturePermissionBlock(eventText);
});

window.friendlyCodex.onFinal((message) => {
  maybeCapturePermissionBlock(message);
  finalOutputEl.textContent = message;
  setStatus(permissionBlockDetected ? 'Blocked by current permissions.' : 'Finished.');
  setRunning(false);
});

window.friendlyCodex.onError((message) => {
  maybeFlagApproval(message);
  maybeCapturePermissionBlock(message);
  setStatus('Something went wrong.');
  setRunning(false);
});

window.friendlyCodex.onStderr((message) => {
  maybeFlagApproval(message);
  maybeCapturePermissionBlock(message);
});

window.friendlyCodex.onClose(({ code }) => {
  if (cancelRequested) {
    setStatus('Cancelled.');
  } else if (permissionBlockDetected) {
    setStatus('Blocked by current permissions.');
  } else if (code === 0) {
    setStatus('Finished.');
  } else if (currentStatus !== 'Something went wrong.') {
    setStatus('Something went wrong.');
  }

  cancelRequested = false;
  setRunning(false);
});

Promise.all([
  window.friendlyCodex.getAppSettings(),
  window.friendlyCodex.getDebugState(),
  window.friendlyCodex.getAuthState()
]).then(([settings, debugState, authState]) => {
  currentSettings = {
    ...currentSettings,
    ...settings
  };
  currentAuthState = {
    ...currentAuthState,
    ...authState
  };

  renderSettings();
  renderAuthState();
  eventLogEl.textContent = debugState.content || '';
  setSettingsNote('This folder will still be here after you restart the app.');
  renderRunNote();
  setStatus('Idle.');
});
