// Dev runner script - launches Vite and Electron together
import { spawn } from 'child_process';

console.log('Starting Vite dev server...');

const vite = spawn('bun', ['run', 'dev'], {
  cwd: 'E:\\AllAIONE\\agentic-ai',
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

// Wait for Vite to start, then launch Electron
setTimeout(() => {
  console.log('Starting Electron...');
  spawn('npx', ['electron', '.'], {
    cwd: 'E:\\AllAIONE\\agentic-ai',
    stdio: 'inherit',
    shell: true
  });
}, 3000);

vite.on('close', (code) => {
  process.exit(code || 0);
});