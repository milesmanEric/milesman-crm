const CATEGORY_LABELS = {
  airline: 'Airlines',
  hotel: 'Hotels',
  'credit-card': 'Credit Cards',
  custom: 'Other',
};
const CATEGORY_ORDER = ['airline', 'hotel', 'credit-card', 'custom'];

const STATUS_LABELS = {
  ok: 'Connected',
  'needs-login': 'Needs login',
  error: 'Error',
  manual: 'Manual',
  never: 'Not connected',
};

let providers = [];
let accounts = [];
let vaultStatus = { vaultExists: false, vaultUnlocked: false };
let pendingConnectAccountId = null;

const $ = (sel) => document.querySelector(sel);

async function api(path, opts) {
  const res = await fetch(path, {
    method: opts?.method || 'GET',
    headers: opts?.body ? { 'Content-Type': 'application/json' } : undefined,
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

function openModal(id) { $('#' + id).classList.remove('hidden'); }
function closeModal(id) { $('#' + id).classList.add('hidden'); }
document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});

function timeAgo(iso) {
  if (!iso) return 'never';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function fmtBalance(n) {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('en-US');
}

async function refreshStatus() {
  vaultStatus = await api('/api/status');
  const badge = $('#vaultBadge');
  badge.textContent = vaultStatus.vaultUnlocked ? '🔓 Unlocked' : '🔒 Locked';
  badge.className = 'badge ' + (vaultStatus.vaultUnlocked ? 'unlocked' : 'locked');
}

async function loadProviders() {
  providers = await api('/api/providers');
  const select = $('#providerId');
  select.innerHTML = '';
  for (const cat of CATEGORY_ORDER) {
    const group = document.createElement('optgroup');
    group.label = CATEGORY_LABELS[cat];
    providers
      .filter((p) => p.category === cat)
      .forEach((p) => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.automated ? p.name : `${p.name} (manual only)`;
        group.appendChild(opt);
      });
    if (group.children.length) select.appendChild(group);
  }
}

async function loadAccounts() {
  accounts = await api('/api/accounts');
  renderSummary();
  renderGroups();
}

function renderSummary() {
  const el = $('#summary');
  el.innerHTML = '';
  for (const cat of CATEGORY_ORDER) {
    const inCat = accounts.filter((a) => a.category === cat);
    if (!inCat.length) continue;
    const total = inCat.reduce((sum, a) => sum + (a.balance || 0), 0);
    const tile = document.createElement('div');
    tile.className = 'summary-tile';
    tile.innerHTML = `<div class="n">${fmtBalance(total)}</div><div class="l">${CATEGORY_LABELS[cat]}</div>`;
    el.appendChild(tile);
  }
}

function providerFor(account) {
  return providers.find((p) => p.id === account.providerId) || { name: account.providerId, automated: false };
}

function cardActionsHtml(account, provider) {
  const buttons = [];
  if (provider.automated) {
    buttons.push(
      `<button class="btn btn-small" data-action="connect" data-id="${account.id}">${
        account.hasSession ? 'Reconnect' : 'Connect'
      }</button>`
    );
    if (account.hasSession) {
      buttons.push(`<button class="btn btn-small" data-action="refresh" data-id="${account.id}">Refresh</button>`);
    }
  }
  buttons.push(`<button class="btn btn-small" data-action="edit" data-id="${account.id}">Edit balance</button>`);
  buttons.push(`<button class="btn btn-small btn-danger" data-action="delete" data-id="${account.id}">Delete</button>`);
  return buttons.join('');
}

function renderGroups() {
  const container = $('#accountGroups');
  container.innerHTML = '';
  if (!accounts.length) {
    container.innerHTML = '<p class="empty">No accounts yet. Click "+ Add Account" to add your first program.</p>';
    return;
  }
  const groupTpl = $('#groupTemplate');
  const cardTpl = $('#cardTemplate');

  for (const cat of CATEGORY_ORDER) {
    const inCat = accounts.filter((a) => a.category === cat);
    if (!inCat.length) continue;
    const groupNode = groupTpl.content.cloneNode(true);
    groupNode.querySelector('.group-title').textContent = CATEGORY_LABELS[cat];
    const cardsEl = groupNode.querySelector('.cards');

    inCat
      .sort((a, b) => (providerFor(a).name || '').localeCompare(providerFor(b).name || ''))
      .forEach((account) => {
        const provider = providerFor(account);
        const node = cardTpl.content.cloneNode(true);
        node.querySelector('.card-name').textContent = provider.name;
        node.querySelector('.card-label').textContent = account.label || '';
        const dot = node.querySelector('.status-dot');
        dot.classList.add(account.lastCheckStatus || 'never');
        dot.title = STATUS_LABELS[account.lastCheckStatus] || account.lastCheckStatus;
        node.querySelector('.card-balance').textContent = fmtBalance(account.balance);
        node.querySelector('.card-tier').textContent = account.statusTier || '';
        node.querySelector('.card-meta').textContent = `Updated ${timeAgo(account.lastUpdated)} · ${
          STATUS_LABELS[account.lastCheckStatus] || account.lastCheckStatus
        }`;
        node.querySelector('.card-msg').textContent =
          account.lastCheckStatus === 'error' || account.lastCheckStatus === 'needs-login'
            ? account.lastCheckMessage || ''
            : '';
        node.querySelector('.card-actions').innerHTML = cardActionsHtml(account, provider);
        cardsEl.appendChild(node);
      });

    container.appendChild(groupNode);
  }
}

{
  $('#accountGroups').addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    try {
      if (action === 'connect') {
        pendingConnectAccountId = id;
        $('#connectForm').reset();
        $('#connectError').classList.add('hidden');
        $('#connectStatus').textContent = '';
        const account = accounts.find((a) => a.id === id);
        $('#connectTitle').textContent = `Connect ${providerFor(account).name}`;
        if (!vaultStatus.vaultUnlocked) {
          await ensureVaultUnlocked();
        }
        openModal('connectModal');
      } else if (action === 'refresh') {
        btn.disabled = true;
        btn.textContent = 'Refreshing…';
        await api(`/api/accounts/${id}/refresh`, { method: 'POST' });
        await loadAccounts();
      } else if (action === 'edit') {
        const account = accounts.find((a) => a.id === id);
        const value = prompt('New balance for ' + providerFor(account).name, account.balance ?? '');
        if (value === null) return;
        const n = Number(value.replace(/,/g, ''));
        if (!Number.isFinite(n)) return alert('Enter a plain number.');
        await api(`/api/accounts/${id}`, { method: 'PATCH', body: { balance: n } });
        await loadAccounts();
      } else if (action === 'delete') {
        const account = accounts.find((a) => a.id === id);
        if (!confirm(`Delete ${providerFor(account).name}${account.label ? ' (' + account.label + ')' : ''}? This also removes its saved credentials/session.`)) return;
        if (!vaultStatus.vaultUnlocked) await ensureVaultUnlocked();
        await api(`/api/accounts/${id}`, { method: 'DELETE' });
        await loadAccounts();
      }
    } catch (err) {
      alert(err.message);
      await loadAccounts();
    }
  });
}

$('#refreshAllBtn').addEventListener('click', async () => {
  const btn = $('#refreshAllBtn');
  btn.disabled = true;
  btn.textContent = 'Refreshing…';
  try {
    await api('/api/refresh-all', { method: 'POST' });
  } catch (err) {
    alert(err.message);
  }
  btn.disabled = false;
  btn.textContent = 'Refresh All';
  await loadAccounts();
});

$('#addAccountBtn').addEventListener('click', async () => {
  if (!vaultStatus.vaultUnlocked) {
    const ok = await ensureVaultUnlocked();
    if (!ok) return;
  }
  $('#addForm').reset();
  $('#addError').classList.add('hidden');
  openModal('addModal');
});

$('#vaultBadge').addEventListener('click', async () => {
  if (vaultStatus.vaultUnlocked) {
    if (confirm('Lock the vault? Saved logins stay saved, but Connect/Add/Delete will ask for your master password again.')) {
      await api('/api/vault/lock', { method: 'POST' });
      await refreshStatus();
    }
  } else {
    await ensureVaultUnlocked();
  }
});

function ensureVaultUnlocked() {
  return new Promise((resolve) => {
    $('#vaultError').classList.add('hidden');
    $('#masterPassword').value = '';
    $('#masterPasswordConfirm').value = '';
    if (vaultStatus.vaultExists) {
      $('#vaultModalTitle').textContent = 'Unlock Vault';
      $('#vaultModalHint').textContent = 'Enter your master password to unlock saved logins.';
      $('#confirmRow').classList.add('hidden');
      $('#masterPasswordConfirm').required = false;
    } else {
      $('#vaultModalTitle').textContent = 'Create Master Password';
      $('#vaultModalHint').textContent =
        'This protects every program login you save. Pick something memorable — there is no recovery if you forget it, since nothing here can decrypt your data without it.';
      $('#confirmRow').classList.remove('hidden');
      $('#masterPasswordConfirm').required = true;
    }
    openModal('vaultModal');
    $('#vaultForm').onsubmit = async (e) => {
      e.preventDefault();
      const pw = $('#masterPassword').value;
      const confirmPw = $('#masterPasswordConfirm').value;
      try {
        if (vaultStatus.vaultExists) {
          await api('/api/vault/unlock', { method: 'POST', body: { masterPassword: pw } });
        } else {
          if (pw !== confirmPw) throw new Error('Passwords do not match.');
          await api('/api/vault/setup', { method: 'POST', body: { masterPassword: pw } });
        }
        await refreshStatus();
        closeModal('vaultModal');
        resolve(true);
      } catch (err) {
        $('#vaultError').textContent = err.message;
        $('#vaultError').classList.remove('hidden');
      }
    };
    document.querySelector('#vaultModal [data-close]').onclick = () => resolve(false);
  });
}

$('#addForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('/api/accounts', {
      method: 'POST',
      body: {
        providerId: $('#providerId').value,
        label: $('#accountLabel').value.trim(),
        username: $('#accountUsername').value.trim(),
        password: $('#accountPassword').value,
      },
    });
    closeModal('addModal');
    await loadAccounts();
  } catch (err) {
    $('#addError').textContent = err.message;
    $('#addError').classList.remove('hidden');
  }
});

$('#connectForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#connectSubmitBtn');
  btn.disabled = true;
  $('#connectStatus').textContent = 'Opening browser window on this machine — complete login there…';
  $('#connectError').classList.add('hidden');
  try {
    await api(`/api/accounts/${pendingConnectAccountId}/connect`, {
      method: 'POST',
      body: {
        username: $('#connectUsername').value.trim(),
        password: $('#connectPassword').value,
      },
    });
    $('#connectStatus').textContent = 'Connected.';
    closeModal('connectModal');
    await loadAccounts();
  } catch (err) {
    $('#connectError').textContent = err.message;
    $('#connectError').classList.remove('hidden');
    $('#connectStatus').textContent = '';
  }
  btn.disabled = false;
});

async function init() {
  await refreshStatus();
  await loadProviders();
  await loadAccounts();
  setInterval(async () => {
    await refreshStatus();
    await loadAccounts();
  }, 30000);
}

init();
