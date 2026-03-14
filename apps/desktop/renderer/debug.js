const debugStatusEl = document.getElementById('debug-status');
const eventLogEl = document.getElementById('event-log');

let currentStatus = 'Idle.';

function setStatus(message) {
  currentStatus = message || 'Idle.';
  debugStatusEl.textContent = `Status: ${currentStatus}`;
}

function renderDebugState(debugState) {
  eventLogEl.textContent = debugState.content || 'No debug output yet.';
}

window.friendlyCodex.onStatus((status) => {
  setStatus(status);
});

window.friendlyCodex.onFinal(() => {
  setStatus('Finished.');
});

window.friendlyCodex.onError(() => {
  setStatus('Something went wrong.');
});

window.friendlyCodex.onClose(({ code }) => {
  if (code === 0) {
    setStatus('Finished.');
    return;
  }

  setStatus('Task stopped.');
});

window.friendlyCodex.onDebugStateUpdated((debugState) => {
  renderDebugState(debugState);
});

window.friendlyCodex.getDebugState().then((debugState) => {
  renderDebugState(debugState);
});
