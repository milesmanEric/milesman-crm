// Shared logic for refreshing one account's balance, used by both the
// cron scheduler and the "Refresh now" button in the dashboard API.
//
// Deliberately does NOT touch vault.js: a headless refresh reuses the
// already-logged-in browser session saved to disk for that account, not
// the stored username/password, so it works whether or not the vault is
// currently unlocked. The vault is only needed when connecting an account
// for the first time (or reconnecting after a session expires), since
// that's the only moment a password actually needs to be typed anywhere.

const db = require('./db');
const providers = require('./providers');
const scrapeRunner = require('./scrapeRunner');

async function refreshAccount(accountId) {
  const account = db.getAccount(accountId);
  if (!account) throw new Error('Account not found: ' + accountId);

  const provider = providers.get(account.providerId);
  if (!provider || !provider.loginUrl) {
    return db.updateAccount(accountId, {
      lastCheckStatus: 'manual',
      lastCheckMessage: 'Manual-entry program; balance is not auto-refreshed.',
    });
  }
  if (!account.hasSession) {
    return db.updateAccount(accountId, {
      lastCheckStatus: 'needs-login',
      lastCheckMessage: 'Not connected yet — use "Connect" to log in once.',
    });
  }

  try {
    const result = await scrapeRunner.refreshHeadless(accountId, provider);
    const patch = {
      lastCheckStatus: result.status,
      lastCheckMessage: result.message,
      lastUpdated: new Date().toISOString(),
    };
    if (result.status === 'ok') {
      patch.balance = result.balance;
      if (result.statusTier) patch.statusTier = result.statusTier;
      patch.source = 'scraped';
    }
    if (result.status === 'needs-login') {
      patch.hasSession = false;
    }
    return db.updateAccount(accountId, patch);
  } catch (err) {
    return db.updateAccount(accountId, {
      lastCheckStatus: 'error',
      lastCheckMessage: err.message,
      lastUpdated: new Date().toISOString(),
    });
  }
}

async function refreshAll({ onlyStale = false } = {}) {
  const accounts = db.listAccounts();
  const results = [];
  for (const account of accounts) {
    const provider = providers.get(account.providerId);
    if (!provider || !provider.loginUrl || !account.hasSession) continue;
    if (onlyStale && account.lastUpdated) {
      const ageMs = Date.now() - new Date(account.lastUpdated).getTime();
      const minAgeMs = 30 * 60 * 1000; // don't re-check something checked <30min ago
      if (ageMs < minAgeMs) continue;
    }
    // Sequential on purpose: one real browser at a time keeps memory/CPU
    // bounded and avoids hammering several sites at once from one machine.
    // eslint-disable-next-line no-await-in-loop
    const updated = await refreshAccount(account.id).catch((err) => ({ error: err.message }));
    results.push({ id: account.id, updated });
  }
  return results;
}

module.exports = { refreshAccount, refreshAll };
