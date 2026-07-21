'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

// Where we persist the auth token so it stays stable across restarts.
const STATE_DIR = path.join(os.homedir(), '.claude-remote');
const TOKEN_FILE = path.join(STATE_DIR, 'token');

function ensureStateDir() {
  fs.mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 });
}

// Resolve (or generate and persist) the shared auth token.
function resolveToken() {
  if (process.env.CLAUDE_REMOTE_TOKEN) {
    return process.env.CLAUDE_REMOTE_TOKEN.trim();
  }
  ensureStateDir();
  try {
    const existing = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
    if (existing) return existing;
  } catch (_) {
    // file does not exist yet
  }
  const token = crypto.randomBytes(24).toString('base64url');
  fs.writeFileSync(TOKEN_FILE, token, { mode: 0o600 });
  return token;
}

// Resolve a command to an absolute path. node-pty's posix_spawn does not do
// the PATH lookup that the shell / execFile do, so launching by bare name
// (e.g. "tmux") can fail with "posix_spawnp failed" even when the binary is
// on PATH. Resolving here makes spawning robust regardless of how PATH is set.
function resolveBin(name) {
  if (!name || name.includes('/') || name.includes(' ')) return name;
  try {
    const out = execSync(`command -v ${name} 2>/dev/null`, {
      shell: '/bin/sh',
    })
      .toString()
      .trim();
    return out || name;
  } catch (_) {
    return name;
  }
}

// Is tmux available on this machine?
function hasTmux() {
  try {
    execSync('command -v tmux', { stdio: 'ignore' });
    return true;
  } catch (_) {
    return false;
  }
}

const useTmux = process.env.CLAUDE_REMOTE_TMUX
  ? process.env.CLAUDE_REMOTE_TMUX !== '0'
  : hasTmux();

module.exports = {
  host: process.env.CLAUDE_REMOTE_HOST || '0.0.0.0',
  port: parseInt(process.env.CLAUDE_REMOTE_PORT || '4317', 10),
  token: resolveToken(),
  tokenFile: TOKEN_FILE,
  // Command that actually launches Claude Code (resolved to an absolute path).
  claudeCmd: resolveBin(process.env.CLAUDE_REMOTE_CMD || 'claude'),
  // Absolute path to tmux, for the same node-pty PATH-resolution reason.
  tmuxBin: resolveBin('tmux'),
  // tmux session name shared between the Mac terminal and remote clients.
  sessionName: process.env.CLAUDE_REMOTE_SESSION || 'claude-remote',
  useTmux,
  shell: process.env.SHELL || '/bin/zsh',
  cwd: process.env.CLAUDE_REMOTE_CWD || process.cwd(),
};
