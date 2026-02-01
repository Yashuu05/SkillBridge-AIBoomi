// start-servers.js
const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting both servers...');

// Start React frontend
const react = exec('npm start', {
  cwd: process.cwd(),
  env: { ...process.env, BROWSER: 'none' }
});

react.stdout.on('data', (data) => {
  console.log(`[React] ${data}`);
});

// Start Python backend
const python = exec('python scripts/ai_server.py', {
  cwd: process.cwd()
});

python.stdout.on('data', (data) => {
  console.log(`[Python] ${data}`);
});

python.stderr.on('data', (data) => {
  console.error(`[Python Error] ${data}`);
});

// Handle exit
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping servers...');
  react.kill();
  python.kill();
  process.exit();
});