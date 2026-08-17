const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

module.exports = {
  port: process.env.PORT ? Number(process.env.PORT) : 4178,
  dataDir: DATA_DIR,
  dbFile: path.join(DATA_DIR, 'db.json'),
  vaultFile: path.join(DATA_DIR, 'vault.json'),
  sessionsDir: path.join(DATA_DIR, 'sessions'),
  // How often the background scheduler refreshes balances for accounts
  // that already have a saved (logged-in) browser session.
  refreshIntervalHours: process.env.REFRESH_INTERVAL_HOURS
    ? Number(process.env.REFRESH_INTERVAL_HOURS)
    : 6,
};
