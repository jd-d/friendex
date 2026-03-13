export function mapCodexEventToStatus(event) {
  if (!event || typeof event !== 'object') {
    return 'Starting…';
  }

  const type = event.type || event.event || 'unknown';

  switch (type) {
    case 'thread.started':
      return 'Starting session…';
    case 'turn.started':
      return 'Working on your request…';
    case 'turn.completed':
      return 'Finished.';
    case 'turn.failed':
      return 'Something went wrong.';
    case 'item.web_search':
    case 'web_search':
      return 'Looking something up…';
    case 'item.command_execution':
    case 'command_execution':
      return 'Checking files…';
    case 'item.apply_patch':
    case 'apply_patch':
      return 'Preparing changes…';
    case 'approval.required':
      return 'Waiting for your approval…';
    case 'error':
      return 'Something went wrong.';
    default:
      return 'Working…';
  }
}
