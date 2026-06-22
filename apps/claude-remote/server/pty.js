'use strict';

const pty = require('node-pty');
const config = require('./config');

// Build the argv that opens (or creates) the shared Claude Code session.
//
// With tmux we use `new-session -A`, which attaches to an existing session of
// the same name or creates one running Claude Code. This makes the session
// persistent and lets you also `tmux attach -t <name>` from the Mac terminal
// to watch / drive the exact same Claude Code instance.
function sessionCommand() {
  if (config.useTmux) {
    return {
      file: 'tmux',
      args: [
        'new-session',
        '-A',
        '-s',
        config.sessionName,
        config.claudeCmd,
      ],
    };
  }
  // Fallback: run Claude Code directly through the login shell. The session is
  // not persistent in this mode (closing all clients ends it).
  return {
    file: config.shell,
    args: ['-lc', config.claudeCmd],
  };
}

// Spawn a PTY viewport for a single connected client.
function createTerminal({ cols = 80, rows = 24 } = {}) {
  const { file, args } = sessionCommand();
  return pty.spawn(file, args, {
    name: 'xterm-256color',
    cols,
    rows,
    cwd: config.cwd,
    env: { ...process.env, TERM: 'xterm-256color' },
  });
}

module.exports = { createTerminal, sessionCommand };
