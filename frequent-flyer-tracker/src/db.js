// Plain-JSON data store for accounts + their last-known balances.
//
// Only non-secret data lives here (provider id, label, balance, status
// tier, timestamps, last check status). Actual login credentials live only
// in vault.js's encrypted store.

const fs = require('fs');
const crypto = require('crypto');
const config = require('./config');

function load() {
  if (!fs.existsSync(config.dbFile)) return { accounts: [] };
  return JSON.parse(fs.readFileSync(config.dbFile, 'utf8'));
}

function save(data) {
  fs.mkdirSync(config.dataDir, { recursive: true });
  const tmp = config.dbFile + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, config.dbFile);
}

function listAccounts() {
  return load().accounts;
}

function getAccount(id) {
  return load().accounts.find((a) => a.id === id) || null;
}

function addAccount({ providerId, category, label, source }) {
  const data = load();
  const account = {
    id: crypto.randomUUID(),
    providerId,
    category,
    label: label || null,
    balance: null,
    statusTier: null,
    lastUpdated: null,
    lastCheckStatus: 'never',
    lastCheckMessage: null,
    source: source || 'scraped',
    hasSession: false,
    createdAt: new Date().toISOString(),
  };
  data.accounts.push(account);
  save(data);
  return account;
}

function updateAccount(id, patch) {
  const data = load();
  const idx = data.accounts.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Account not found: ' + id);
  data.accounts[idx] = { ...data.accounts[idx], ...patch };
  save(data);
  return data.accounts[idx];
}

function deleteAccount(id) {
  const data = load();
  data.accounts = data.accounts.filter((a) => a.id !== id);
  save(data);
}

module.exports = { listAccounts, getAccount, addAccount, updateAccount, deleteAccount };
