// Desktop shell for the Miles Man CRM.
//
// The CRM is a static web app whose Google / Microsoft / WordPress / Facebook / X
// OAuth redirects, Vercel endpoints and per-origin localStorage data are all tied to
// the hosted GitHub Pages origin. So the desktop app loads that hosted site rather
// than a bundled copy: sign-ins keep working, existing data is preserved per-profile,
// and every launch gets the latest CRM version automatically.
const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

const CRM_URL = process.env.CRM_URL || 'https://milesmaneric.github.io/milesman-crm/';
const CRM_ORIGIN = new URL(CRM_URL).origin;
const CRM_PATH = new URL(CRM_URL).pathname;

// Hosts that may open in an in-app popup (OAuth sign-in windows).
const AUTH_HOSTS = [
  'accounts.google.com', 'login.microsoftonline.com', 'login.live.com',
  'public-api.wordpress.com', 'www.facebook.com', 'api.twitter.com', 'twitter.com',
  'x.com', 'milesman-auth.vercel.app',
];

function isCrmUrl(u) {
  try { const p = new URL(u); return p.origin === CRM_ORIGIN && p.pathname.startsWith(CRM_PATH); }
  catch { return false; }
}
function isAuthUrl(u) {
  try { return AUTH_HOSTS.includes(new URL(u).hostname); } catch { return false; }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400, height: 900, minWidth: 900, minHeight: 600,
    title: 'Miles Man CRM',
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isCrmUrl(url) || isAuthUrl(url)) {
      return { action: 'allow', overrideBrowserWindowOptions: { width: 1000, height: 800, autoHideMenuBar: true } };
    }
    if (/^(https?|mailto|tel):/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (e, url) => {
    if (!isCrmUrl(url) && !isAuthUrl(url) && !url.startsWith('file:')) {
      e.preventDefault();
      if (/^https?:/i.test(url)) shell.openExternal(url);
    }
  });

  // Offline / unreachable: show a retry page instead of a blank window.
  win.webContents.on('did-fail-load', (_e, code, _desc, url, isMainFrame) => {
    if (isMainFrame && code !== -3 && url.startsWith('http')) {
      win.loadFile(path.join(__dirname, 'offline.html'));
    }
  });

  win.loadURL(CRM_URL);
  return win;
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const tpl = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { label: 'View', submenu: [
      { role: 'reload' }, { role: 'forceReload' }, { type: 'separator' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
      { type: 'separator' }, { role: 'togglefullscreen' }, { role: 'toggleDevTools' },
    ] },
    { role: 'windowMenu' },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));
}

// One instance only, so two windows never fight over the same local data.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const [w] = BrowserWindow.getAllWindows();
    if (w) { if (w.isMinimized()) w.restore(); w.focus(); }
  });
  app.whenReady().then(() => {
    buildMenu();
    createWindow();
    app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
