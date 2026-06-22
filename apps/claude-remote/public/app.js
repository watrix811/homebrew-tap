'use strict';

// Named helper keys -> the byte sequence we send to the PTY.
const KEY_SEQUENCES = {
  esc: '\x1b',
  tab: '\t',
  'ctrl-c': '\x03',
  enter: '\r',
  up: '\x1b[A',
  down: '\x1b[B',
  right: '\x1b[C',
  left: '\x1b[D',
};

const els = {
  login: document.getElementById('login'),
  app: document.getElementById('app'),
  token: document.getElementById('token'),
  connect: document.getElementById('connect'),
  loginError: document.getElementById('login-error'),
  status: document.getElementById('status'),
  disconnect: document.getElementById('disconnect'),
  terminalHost: document.getElementById('terminal'),
  kbd: document.getElementById('kbd'),
  bell: document.getElementById('bell'),
};

let term;
let fitAddon;
let ws;
let reconnectTimer = null;
let intentionalClose = false;

function setStatus(state, label) {
  els.status.className = `status ${state}`;
  els.status.textContent = label;
}

function buildTerminal() {
  term = new Terminal({
    cursorBlink: true,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 13,
    theme: { background: '#0b0e14', foreground: '#d7dce5' },
    scrollback: 5000,
  });
  fitAddon = new FitAddon.FitAddon();
  term.loadAddon(fitAddon);
  term.open(els.terminalHost);
  fitAddon.fit();

  term.onData((data) => send({ type: 'input', data }));

  window.addEventListener('resize', debouncedFit);
  // iOS soft keyboard changes the viewport height.
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', debouncedFit);
  }
}

let fitTimer = null;
function debouncedFit() {
  clearTimeout(fitTimer);
  fitTimer = setTimeout(() => {
    if (!fitAddon) return;
    fitAddon.fit();
    send({ type: 'resize', cols: term.cols, rows: term.rows });
  }, 100);
}

function send(msg) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function connect(token) {
  intentionalClose = false;
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const url = `${proto}://${location.host}/ws?token=${encodeURIComponent(token)}`;
  setStatus('connecting', '接続中…');
  ws = new WebSocket(url);

  ws.onopen = () => {
    setStatus('connected', '接続済み');
    send({ type: 'resize', cols: term.cols, rows: term.rows });
    term.focus();
  };

  ws.onmessage = (ev) => {
    let msg;
    try {
      msg = JSON.parse(ev.data);
    } catch (_) {
      return;
    }
    if (msg.type === 'output') {
      term.write(msg.data);
    } else if (msg.type === 'exit') {
      term.write(`\r\n\x1b[33m[セッション終了 code=${msg.code}]\x1b[0m\r\n`);
    }
  };

  ws.onclose = (ev) => {
    if (intentionalClose) return;
    if (ev.code === 1006 || ev.code === 4401 || ev.code === 401) {
      // Likely auth failure on first connect: bounce back to login.
      if (els.app.hidden === false && !sessionStarted) {
        showLoginError('トークンが正しくないか、接続できませんでした。');
        showLogin();
        return;
      }
    }
    setStatus('disconnected', '切断 — 再接続中…');
    scheduleReconnect(token);
  };

  ws.onerror = () => {
    // onclose will handle UI transitions.
  };
}

let sessionStarted = false;
function scheduleReconnect(token) {
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => connect(token), 1500);
}

function showLoginError(text) {
  els.loginError.textContent = text;
  els.loginError.hidden = false;
}

function showLogin() {
  els.app.hidden = true;
  els.login.hidden = false;
  sessionStarted = false;
}

function startSession(token) {
  localStorage.setItem('cr_token', token);
  els.login.hidden = true;
  els.app.hidden = false;
  els.loginError.hidden = true;
  if (!term) buildTerminal();
  else debouncedFit();
  sessionStarted = true;
  connect(token);
  setupPush(token);
}

// --- Wire up UI ------------------------------------------------------------

els.connect.addEventListener('click', () => {
  const token = els.token.value.trim();
  if (!token) {
    showLoginError('トークンを入力してください。');
    return;
  }
  startSession(token);
});

els.token.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') els.connect.click();
});

els.disconnect.addEventListener('click', () => {
  intentionalClose = true;
  clearTimeout(reconnectTimer);
  if (ws) ws.close();
  localStorage.removeItem('cr_token');
  setStatus('disconnected', '未接続');
  showLogin();
});

// Helper key bar.
document.querySelectorAll('.keys button[data-key]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const seq = KEY_SEQUENCES[btn.dataset.key];
    if (seq) send({ type: 'input', data: seq });
    term.focus();
  });
});

// Re-focus terminal to summon the soft keyboard on iOS.
els.kbd.addEventListener('click', (e) => {
  e.preventDefault();
  term.focus();
});

// --- Web Push (notify when Claude is waiting for input) -------------------

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

let pushReady = false;
async function setupPush(token) {
  // Web Push needs a service worker + Notification API. On iOS this only works
  // when the site is installed to the Home Screen (standalone PWA).
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  try {
    const info = await fetch('/push/vapid-public-key').then((r) => r.json());
    if (!info.enabled || !info.publicKey) return; // tmux disabled => no idle detection
    window.__vapid = info.publicKey;
    window.__pushToken = token;
    await navigator.serviceWorker.register('/sw.js');
    pushReady = true;
    els.bell.hidden = false;
    refreshBell();
  } catch (_) {
    /* push unavailable; ignore */
  }
}

async function refreshBell() {
  if (!pushReady) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  els.bell.textContent = sub ? '🔔 通知ON' : '🔕 通知';
  els.bell.dataset.on = sub ? '1' : '';
}

async function togglePush() {
  if (!pushReady) return;
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  if (existing) {
    await fetch('/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: window.__pushToken, endpoint: existing.endpoint }),
    }).catch(() => {});
    await existing.unsubscribe();
    refreshBell();
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') {
    alert('通知が許可されませんでした。iOSではホーム画面に追加したアプリから有効化してください。');
    return;
  }
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(window.__vapid),
  });
  await fetch('/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: window.__pushToken, subscription: sub }),
  });
  refreshBell();
}

els.bell.addEventListener('click', (e) => {
  e.preventDefault();
  togglePush();
});

// Auto-connect if we already have a token saved.
const saved = localStorage.getItem('cr_token');
if (saved) {
  els.token.value = saved;
  startSession(saved);
}
