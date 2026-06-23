#!/usr/bin/env node
'use strict';

// Pre-flight check: verifies the Mac has everything Claude Remote needs and
// prints a readiness report. Run with `npm run doctor`.

const net = require('net');
const { execSync } = require('child_process');

const PORT = parseInt(process.env.CLAUDE_REMOTE_PORT || '4317', 10);
let problems = 0;

function ok(label, detail) {
  console.log(`  \x1b[32m✓\x1b[0m ${label}${detail ? ` — ${detail}` : ''}`);
}
function warn(label, detail) {
  console.log(`  \x1b[33m!\x1b[0m ${label}${detail ? ` — ${detail}` : ''}`);
}
function fail(label, detail) {
  problems++;
  console.log(`  \x1b[31m✗\x1b[0m ${label}${detail ? ` — ${detail}` : ''}`);
}

function which(cmd) {
  try {
    return execSync(`command -v ${cmd}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch (_) {
    return null;
  }
}

function checkPortFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port, '0.0.0.0');
  });
}

function firstLan() {
  const os = require('os');
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const i of ifaces) {
      if (i.family === 'IPv4' && !i.internal) return i.address;
    }
  }
  return null;
}

(async () => {
  console.log('\n  Claude Remote — doctor\n  ─────────────────────────────');

  // Node version
  const major = parseInt(process.versions.node.split('.')[0], 10);
  if (major >= 18) ok('Node.js', `v${process.versions.node}`);
  else fail('Node.js', `v${process.versions.node} (need >= 18)`);

  // node-pty present and loadable (native build)
  try {
    require('node-pty');
    ok('node-pty', 'native module loads');
  } catch (e) {
    fail('node-pty', 'not installed or failed to build — run `npm install`');
    if (/was compiled against a different Node/.test(String(e))) {
      warn('node-pty', 'rebuild needed: `npm rebuild node-pty`');
    }
  }

  // web-push present
  try {
    require('web-push');
    ok('web-push', 'available');
  } catch (_) {
    fail('web-push', 'not installed — run `npm install`');
  }

  // claude on PATH
  const claudeCmd = process.env.CLAUDE_REMOTE_CMD || 'claude';
  const claudePath = which(claudeCmd);
  if (claudePath) ok('Claude Code', claudePath);
  else fail('Claude Code', `\`${claudeCmd}\` not found on PATH — install Claude Code`);

  // tmux
  const tmux = which('tmux');
  if (tmux) ok('tmux', tmux);
  else warn('tmux', 'not found — recommended (`brew install tmux`); falls back to direct mode');

  // Port availability
  const free = await checkPortFree(PORT);
  if (free) ok('Port', `${PORT} is free`);
  else fail('Port', `${PORT} is already in use — set CLAUDE_REMOTE_PORT`);

  // LAN address hint
  const ip = firstLan();
  if (ip) ok('LAN address', `http://${ip}:${PORT}`);
  else warn('LAN address', 'no external IPv4 found (not on a network?)');

  console.log('  ─────────────────────────────');
  if (problems === 0) {
    console.log('  \x1b[32mReady.\x1b[0m Start with `npm start`.\n');
    process.exit(0);
  } else {
    console.log(`  \x1b[31m${problems} problem(s) found.\x1b[0m Fix the ✗ items above.\n`);
    process.exit(1);
  }
})();
