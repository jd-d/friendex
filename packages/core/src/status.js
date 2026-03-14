export function mapCodexEventToStatus(event) {
  if (!event || typeof event !== 'object') {
    return 'Starting...';
  }

  const type = event.type;
  const item = event.item;

  switch (type) {
    case 'thread.started':
      return 'Starting session...';

    case 'turn.started':
      return 'Working on your request...';

    case 'turn.completed':
      return 'Finished.';

    case 'turn.failed':
      return 'Something went wrong.';

    case 'item.started':
      return mapItemStarted(item);

    case 'item.completed':
      return mapItemCompleted(item);

    case 'error':
      return 'Something went wrong.';

    default:
      return 'Working...';
  }
}

function mapItemStarted(item) {
  if (!item) return 'Working...';

  switch (item.type) {
    case 'command_execution':
      return 'Running a command...';
    case 'apply_patch':
      return 'Preparing changes...';
    case 'web_search':
      return 'Looking something up...';
    default:
      return 'Working...';
  }
}

function mapItemCompleted(item) {
  if (!item) return 'Working...';

  switch (item.type) {
    case 'agent_message':
      return 'Thinking...';
    case 'command_execution':
      return item.status === 'failed' ? 'Command failed, retrying...' : 'Checking results...';
    case 'apply_patch':
      return item.status === 'failed' ? 'Patch failed.' : 'Changes applied.';
    case 'web_search':
      return 'Processing results...';
    default:
      return 'Working...';
  }
}
