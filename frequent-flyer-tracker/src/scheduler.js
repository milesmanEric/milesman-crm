const cron = require('node-cron');
const config = require('./config');
const refreshService = require('./refreshService');

let task = null;

function start() {
  if (task) return task;
  const everyHours = Math.max(1, Math.round(config.refreshIntervalHours));
  const cronExpr = `0 */${everyHours} * * *`;
  task = cron.schedule(cronExpr, () => {
    refreshService
      .refreshAll({ onlyStale: true })
      .then((results) => {
        if (results.length) {
          console.log(`[scheduler] refreshed ${results.length} account(s)`);
        }
      })
      .catch((err) => console.error('[scheduler] refresh run failed:', err.message));
  });
  console.log(`[scheduler] background refresh scheduled every ${everyHours}h (${cronExpr})`);
  return task;
}

module.exports = { start };
