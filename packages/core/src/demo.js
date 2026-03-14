import { mapCodexEventToStatus } from './status.js';

// Real event shapes captured from codex exec --json
const demoEvents = [
  { type: 'thread.started', thread_id: 'demo-thread-001' },
  { type: 'turn.started' },
  { type: 'item.completed', item: { id: 'item_0', type: 'agent_message', text: "I'll check the directory contents." } },
  { type: 'item.started', item: { id: 'item_1', type: 'command_execution', command: 'ls -la', status: 'in_progress' } },
  { type: 'item.completed', item: { id: 'item_1', type: 'command_execution', command: 'ls -la', aggregated_output: 'file1.txt\nfile2.txt', exit_code: 0, status: 'completed' } },
  { type: 'item.completed', item: { id: 'item_3', type: 'command_execution', command: 'rm -rf /', exit_code: -1, status: 'failed' } },
  { type: 'item.completed', item: { id: 'item_2', type: 'agent_message', text: 'Here are the files I found in the directory.' } },
  { type: 'turn.completed', usage: { input_tokens: 1000, output_tokens: 200 } }
];

for (const event of demoEvents) {
  const label = event.item ? `${event.type} (${event.item.type})` : event.type;
  console.log(`${label} => ${mapCodexEventToStatus(event)}`);
}
