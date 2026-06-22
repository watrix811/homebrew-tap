'use strict';

const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');
const { WebSocketServer } = require('ws');

const config = require('./config');
const { createTerminal } = require('./pty');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
};

// Constant-time token comparison to avoid timing attacks.
function tokenValid(provided) {
  if (!provided) return false;
  const a = Buffer.from(String(provided));
  const b = Buffer.from(config.token);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// --- Static file server (the mobile Web UI) -------------------------------

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';

  // Prevent path traversal.
  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Lightweight health/info endpoint (no secrets leaked).
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, tmux: config.useTmux, session: config.sessionName }));
    return;
  }
  serveStatic(req, res);
});

// --- WebSocket terminal bridge --------------------------------------------

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname !== '/ws') {
    socket.destroy();
    return;
  }
  // Token can arrive via query (?token=) or the Sec-WebSocket-Protocol header.
  const token = url.searchParams.get('token') || req.headers['sec-websocket-protocol'];
  if (!tokenValid(token)) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', (ws) => {
  const term = createTerminal({ cols: 80, rows: 24 });

  const onData = (data) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'output', data }));
    }
  };
  term.onData(onData);

  term.onExit(({ exitCode }) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'exit', code: exitCode }));
      ws.close();
    }
  });

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch (_) {
      return;
    }
    switch (msg.type) {
      case 'input':
        term.write(msg.data);
        break;
      case 'resize':
        if (Number.isInteger(msg.cols) && Number.isInteger(msg.rows)) {
          try {
            term.resize(msg.cols, msg.rows);
          } catch (_) {
            /* ignore resize errors */
          }
        }
        break;
      default:
        break;
    }
  });

  ws.on('close', () => {
    // Detach this viewport. With tmux the underlying Claude Code session keeps
    // running; killing the attach client is enough.
    try {
      term.kill();
    } catch (_) {
      /* already gone */
    }
  });
});

// --- Startup banner --------------------------------------------------------

server.listen(config.port, config.host, () => {
  const lines = [
    '',
    '  Claude Remote is running.',
    '  ─────────────────────────────────────────────',
    `  Local:    http://localhost:${config.port}`,
    `  Network:  http://<your-mac-ip>:${config.port}`,
    `  tmux:     ${config.useTmux ? `enabled (session "${config.sessionName}")` : 'disabled (direct mode)'}`,
    '',
    '  Open the URL on your phone and paste this token:',
    '',
    `      ${config.token}`,
    '',
    process.env.CLAUDE_REMOTE_TOKEN
      ? '  (token taken from CLAUDE_REMOTE_TOKEN)'
      : `  (token stored in ${config.tokenFile})`,
    '  To reach it from outside your LAN, run a tunnel, e.g.:',
    `      tailscale serve ${config.port}`,
    '  ─────────────────────────────────────────────',
    '',
  ];
  process.stdout.write(lines.join('\n'));
});
