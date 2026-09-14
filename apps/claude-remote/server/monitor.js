'use strict';

const { EventEmitter } = require('events');
const { execFileSync } = require('child_process');
const pty = require('node-pty');
const config = require('./config');

// Watches the shared tmux session and emits `idle` when Claude Code stops
// producing output after having been active — i.e. it is most likely waiting
// for the user (a prompt, a permission request, or a finished turn).
//
// How it works: we attach a *read-only* tmux client. A read-only client only
// receives data when the pane actually changes, so a quiet stream means the
// TUI is static. While Claude is thinking it animates a spinner (continuous
// output = "active"); when it stops and waits, output goes silent. After
// `idleMs` of silence following activity we fire a single `idle` event.
class SessionMonitor extends EventEmitter {
  constructor({ idleMs = 6000 } = {}) {
    super();
    this.idleMs = idleMs;
    this.term = null;
    this.timer = null;
    this.lastActivity = 0;
    this.active = false; // have we seen output since the last idle event?
    this.notified = false; // already emitted idle for the current quiet period?
    this.stopped = false;
  }

  // Make sure the shared session exists (detached) so we have something to
  // attach to even before any phone connects.
  ensureSession() {
    try {
      execFileSync(config.tmuxBin, ['has-session', '-t', config.sessionName], {
        stdio: 'ignore',
      });
    } catch (_) {
      execFileSync(config.tmuxBin, [
        'new-session',
        '-d',
        '-s',
        config.sessionName,
        config.claudeCmd,
      ]);
    }
    // Size the session after whichever client is most recently active (the
    // phone), so this read-only monitor doesn't shrink the usable area.
    try {
      execFileSync(config.tmuxBin, [
        'set-option',
        '-t',
        config.sessionName,
        'window-size',
        'latest',
      ]);
    } catch (_) {
      /* older tmux without window-size; ignore */
    }
  }

  start() {
    if (!config.useTmux) return; // idle detection requires the shared session
    try {
      this.ensureSession();

      // Read-only attach in a roomy viewport so we never constrain the session.
      this.term = pty.spawn(
        config.tmuxBin,
        ['attach-session', '-r', '-t', config.sessionName],
        {
          name: 'xterm-256color',
          cols: 200,
          rows: 50,
          cwd: config.cwd,
          env: { ...process.env, TERM: 'xterm-256color' },
        }
      );

      this.term.onData(() => this.onActivity());
      this.term.onExit(() => {
        if (!this.stopped) setTimeout(() => this.restart(), 1000);
      });

      this.timer = setInterval(() => this.tick(), 1000);
    } catch (err) {
      // Don't let idle-detection problems take down the server.
      console.error('[monitor] failed to start idle detection:', err.message);
    }
  }

  onActivity() {
    this.lastActivity = Date.now();
    this.active = true;
    this.notified = false;
  }

  tick() {
    if (!this.active || this.notified) return;
    if (Date.now() - this.lastActivity >= this.idleMs) {
      this.notified = true;
      this.active = false;
      this.emit('idle');
    }
  }

  restart() {
    this.cleanup();
    this.start();
  }

  cleanup() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.term) {
      try {
        this.term.kill();
      } catch (_) {
        /* already gone */
      }
    }
    this.term = null;
  }

  stop() {
    this.stopped = true;
    this.cleanup();
  }
}

module.exports = { SessionMonitor };
