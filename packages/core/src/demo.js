import { mapCodexEventToStatus } from './status.js';

const demoEvents = [
  { type: 'thread.started' },
  { type: 'turn.started' },
  { type: 'item.command_execution' },
  { type: 'approval.required' },
  { type: 'turn.completed' }
];

for (const event of demoEvents) {
  console.log(event.type, '=>', mapCodexEventToStatus(event));
}
