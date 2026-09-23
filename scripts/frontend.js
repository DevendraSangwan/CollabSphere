const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, '127.0.0.1');
  });
}

async function getAvailablePort(startPort) {
  let port = startPort;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (await isPortFree(port)) {
      return port;
    }
    port += 1;
  }

  throw new Error(`No free port found starting from ${startPort}`);
}

(async () => {
  const preferredPort = Number(process.env.PORT || 4173);
  const port = await getAvailablePort(preferredPort);

  console.log(`Starting frontend-only app on http://localhost:${port}`);

  const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['http-server', 'client', '-p', String(port)], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
})();
