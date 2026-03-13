const cwdInput = document.getElementById('cwd');
const promptInput = document.getElementById('prompt');
const statusEl = document.getElementById('status');
const finalOutputEl = document.getElementById('final-output');
const eventLogEl = document.getElementById('event-log');
const chooseFolderBtn = document.getElementById('choose-folder');
const runBtn = document.getElementById('run');

chooseFolderBtn.addEventListener('click', async () => {
  const folder = await window.friendlyCodex.chooseFolder();
  if (folder) cwdInput.value = folder;
});

for (const button of document.querySelectorAll('.quick-task')) {
  button.addEventListener('click', () => {
    promptInput.value = button.dataset.prompt || '';
  });
}

runBtn.addEventListener('click', async () => {
  finalOutputEl.textContent = '';
  eventLogEl.textContent = '';
  statusEl.textContent = 'Starting…';

  await window.friendlyCodex.runTask({
    prompt: promptInput.value.trim(),
    cwd: cwdInput.value.trim() || undefined
  });
});

window.friendlyCodex.onStatus((status) => {
  statusEl.textContent = status;
});

window.friendlyCodex.onEvent((event) => {
  eventLogEl.textContent += JSON.stringify(event, null, 2) + '\n\n';
});

window.friendlyCodex.onFinal((message) => {
  finalOutputEl.textContent += message + '\n';
});

window.friendlyCodex.onError((message) => {
  statusEl.textContent = 'Something went wrong.';
  eventLogEl.textContent += `ERROR: ${message}\n`;
});

window.friendlyCodex.onStderr((message) => {
  eventLogEl.textContent += `STDERR: ${message}\n`;
});

window.friendlyCodex.onClose(({ code }) => {
  eventLogEl.textContent += `\nProcess exited with code ${code}.\n`;
});
