const path = require('path');
const express = require('express');
const config = require('./config');
const vault = require('./vault');
const db = require('./db');
const providers = require('./providers');
const scrapeRunner = require('./scrapeRunner');
const refreshService = require('./refreshService');
const scheduler = require('./scheduler');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

function requireUnlocked(req, res, next) {
  if (!vault.isUnlocked()) return res.status(423).json({ error: 'Vault is locked.' });
  next();
}

app.get('/api/status', (req, res) => {
  res.json({ vaultExists: vault.exists(), vaultUnlocked: vault.isUnlocked() });
});

app.post('/api/vault/setup', (req, res) => {
  try {
    vault.setup(req.body.masterPassword || '');
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/vault/unlock', (req, res) => {
  try {
    vault.unlock(req.body.masterPassword || '');
    res.json({ ok: true });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.post('/api/vault/lock', (req, res) => {
  vault.lock();
  res.json({ ok: true });
});

app.get('/api/providers', (req, res) => {
  res.json(
    providers.list().map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      automated: !!p.loginUrl,
    }))
  );
});

app.get('/api/accounts', (req, res) => {
  res.json(db.listAccounts());
});

app.post('/api/accounts', requireUnlocked, (req, res) => {
  const { providerId, label, username, password } = req.body;
  const provider = providers.get(providerId);
  if (!provider) return res.status(400).json({ error: 'Unknown provider: ' + providerId });

  const account = db.addAccount({
    providerId,
    category: provider.category,
    label,
    source: provider.loginUrl ? 'scraped' : 'manual',
  });

  if (provider.loginUrl && username && password) {
    vault.saveCredential(account.id, { username, password });
  }
  res.status(201).json(account);
});

app.patch('/api/accounts/:id', (req, res) => {
  try {
    const allowed = ['label', 'balance', 'statusTier'];
    const patch = {};
    for (const key of allowed) {
      if (key in req.body) patch[key] = req.body[key];
    }
    if ('balance' in patch || 'statusTier' in patch) {
      patch.source = 'manual';
      patch.lastUpdated = new Date().toISOString();
      patch.lastCheckStatus = 'manual';
      patch.lastCheckMessage = 'Manually edited.';
    }
    res.json(db.updateAccount(req.params.id, patch));
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.delete('/api/accounts/:id', requireUnlocked, (req, res) => {
  db.deleteAccount(req.params.id);
  vault.deleteCredential(req.params.id);
  res.json({ ok: true });
});

// Opens a visible browser window on THIS machine so you can complete
// login (and any 2FA/CAPTCHA) once. Saves username/password to the vault
// first if new ones were provided, otherwise reuses whatever's already
// stored for this account.
app.post('/api/accounts/:id/connect', requireUnlocked, async (req, res) => {
  const account = db.getAccount(req.params.id);
  if (!account) return res.status(404).json({ error: 'Account not found.' });
  const provider = providers.get(account.providerId);
  if (!provider || !provider.loginUrl) {
    return res.status(400).json({ error: 'This program has no automated login.' });
  }

  const { username, password } = req.body || {};
  if (username && password) {
    vault.saveCredential(account.id, { username, password });
  }
  const credentials = vault.getCredential(account.id);
  if (!credentials) {
    return res.status(400).json({ error: 'No saved credentials for this account yet — provide username/password.' });
  }

  try {
    const result = await scrapeRunner.loginInteractive(account.id, provider, credentials);
    if (result.success) {
      const patch = {
        hasSession: true,
        lastCheckStatus: 'ok',
        lastCheckMessage: null,
        lastUpdated: new Date().toISOString(),
        source: 'scraped',
      };
      if (result.balance !== null && result.balance !== undefined) patch.balance = result.balance;
      if (result.statusTier) patch.statusTier = result.statusTier;
      res.json(db.updateAccount(account.id, patch));
    } else {
      res.json(
        db.updateAccount(account.id, {
          hasSession: false,
          lastCheckStatus: 'error',
          lastCheckMessage: result.message,
          lastUpdated: new Date().toISOString(),
        })
      );
    }
  } catch (err) {
    res.status(500).json(
      db.updateAccount(account.id, {
        lastCheckStatus: 'error',
        lastCheckMessage: err.message,
        lastUpdated: new Date().toISOString(),
      })
    );
  }
});

app.post('/api/accounts/:id/refresh', async (req, res) => {
  try {
    res.json(await refreshService.refreshAccount(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/refresh-all', async (req, res) => {
  try {
    res.json(await refreshService.refreshAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(config.port, '127.0.0.1', () => {
  console.log(`Frequent Flyer Tracker running at http://127.0.0.1:${config.port}`);
  scheduler.start();
});
