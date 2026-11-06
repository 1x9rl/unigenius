import { spawn } from 'node:child_process';

// Keep both services in one workflow and stop them together.
const services = [
  spawn(process.execPath, ['--env-file-if-exists=.env', 'index.mjs'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '8787' },
  }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], {
    stdio: 'inherit',
  }),
];

let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const service of services) service.kill('SIGTERM');
}

for (const service of services) {
  service.on('error', (error) => {
    console.error('Unable to start service:', error);
    stop(1);
  });
  service.on('exit', (code) => stop(code ?? 1));
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
