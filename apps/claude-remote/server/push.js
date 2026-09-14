'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const webpush = require('web-push');
const config = require('./config');

const STATE_DIR = path.join(os.homedir(), '.claude-remote');
const VAPID_FILE = path.join(STATE_DIR, 'vapid.json');
const SUBS_FILE = path.join(STATE_DIR, 'subscriptions.json');

function ensureDir() {
  fs.mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 });
}

// Load or generate the VAPID key pair. These identify this server to the push
// services and stay stable across restarts so existing subscriptions keep
// working.
function loadVapid() {
  ensureDir();
  try {
    const data = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf8'));
    if (data.publicKey && data.privateKey) return data;
  } catch (_) {
    /* generate below */
  }
  const keys = webpush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_FILE, JSON.stringify(keys, null, 2), { mode: 0o600 });
  return keys;
}

const vapid = loadVapid();
webpush.setVapidDetails(
  // A contact URI for the push service; mailto is fine.
  `mailto:claude-remote@${os.hostname()}.local`,
  vapid.publicKey,
  vapid.privateKey
);

// Subscriptions are keyed by their endpoint so re-subscribing is idempotent.
let subscriptions = new Map();
function loadSubs() {
  try {
    const arr = JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8'));
    subscriptions = new Map(arr.map((s) => [s.endpoint, s]));
  } catch (_) {
    subscriptions = new Map();
  }
}
function saveSubs() {
  ensureDir();
  fs.writeFileSync(SUBS_FILE, JSON.stringify([...subscriptions.values()], null, 2), {
    mode: 0o600,
  });
}
loadSubs();

function add(sub) {
  if (!sub || !sub.endpoint) return false;
  subscriptions.set(sub.endpoint, sub);
  saveSubs();
  return true;
}

function remove(endpoint) {
  const had = subscriptions.delete(endpoint);
  if (had) saveSubs();
  return had;
}

// Push a notification to every registered device. Stale subscriptions
// (410/404) are pruned automatically.
async function notifyAll(payload) {
  const body = JSON.stringify(payload);
  const dead = [];
  await Promise.all(
    [...subscriptions.values()].map(async (sub) => {
      try {
        await webpush.sendNotification(sub, body);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          dead.push(sub.endpoint);
        }
      }
    })
  );
  if (dead.length) {
    dead.forEach((e) => subscriptions.delete(e));
    saveSubs();
  }
}

module.exports = {
  publicKey: vapid.publicKey,
  add,
  remove,
  notifyAll,
  count: () => subscriptions.size,
};
