// Miles Man CRM - Client Portal API.
//
// WHERE THIS GOES: copy to lib/portal.js in the milesman-auth Vercel project
// (C:\Users\ericl\milesman-auth-fix) and `vercel --prod`. Like
// client-agreement.js it is NOT its own function (the Hobby plan caps a
// project at 12): api/cc-auth-upload.js dispatches to it when called with
// ?service=portal, and a vercel.json rewrite maps /api/client-portal to
//   /api/cc-auth-upload?service=portal
// (see DOCUMENTATION.md §4.14 for the exact snippets). The public page that
// calls this is client-portal.html (same repo / GitHub Pages).
//
// WHAT IT DOES - lets a client log in and see their own trips and record:
//   * LOGIN is a passwordless "magic link": the client types their email, and
//     IF it matches a client record an email with a one-time-style link is
//     sent (from eric@themilesman.com via the same app-only Microsoft Graph
//     sender cc-auth-upload.js uses). The response is identical whether or not
//     the email matched, so the form can't be used to find out who is a client.
//     No passwords are stored anywhere.
//   * READS come from the CRM's Drive backup file (milesman-crm-backup.json,
//     the same file Secure Sync writes), read with the server-side Drive
//     credential. So the portal is only as fresh as the CRM's last backup;
//     the response carries dataAsOf (the file's modifiedTime) and the page
//     shows it. Only a WHITELISTED projection of the one client's data is ever
//     returned: no internal notes, pricing, points, supplier details, other
//     clients' records, or anything else in the backup.
//   * WRITES are CHANGE REQUESTS, never direct edits. The CRM's data lives in
//     the browser (localStorage) and the backup is overwritten by every CRM
//     backup, so writing into the backup from here would be silently lost or
//     would clobber real data. Instead each submission becomes a small JSON
//     file in the private Drive folder "Client Portal Requests" (created on
//     first use), Eric is emailed, and the CRM's "Client Portal Requests"
//     screen shows old -> new for each field with Apply / Dismiss.
//
// STAFF ACTIONS (staff-list / staff-resolve) are called by the CRM, not by
// clients, and are authenticated exactly like Secure Sync: a Google ID token,
// verified against Google's tokeninfo (audience, email_verified) and the
// ALLOWED_EMAILS allowlist.
//
// ENV VARS: GOOGLE_CLIENT_SECRET, DRIVE_SERVER_REFRESH_TOKEN, ALLOWED_EMAILS,
// MS_NOTIFY_CLIENT_ID, MS_NOTIFY_CLIENT_SECRET (all already set for
// cc-auth-upload.js / secure-sync.js), plus ONE NEW one:
//   PORTAL_SECRET - a long random string (32+ chars, e.g.
//                   `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`)
//                   used to HMAC-sign login links and session tokens.
// Optional: PORTAL_URL - where client-portal.html is served (defaults to the
// GitHub Pages copy). The login link is built from this and NEVER from the
// request, so a forged Host/Origin can't point a login email at another site.
//
// KNOWN LIMITS (accepted, documented in DOCUMENTATION.md §4.14):
//   * Login links and sessions are stateless signed tokens: a link works for
//     its whole 20-minute life (not strictly single-use) and "log out" only
//     forgets the session in that browser (it expires on its own after 8h).
//   * Rate limiting is per serverless instance and in memory (best effort).

const crypto = require('crypto');

const DRIVE_CLIENT_ID = '493779520648-pnchnino12e0dc893do88bikt041u5sa.apps.googleusercontent.com';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const BACKUP_FILENAME = 'milesman-crm-backup.json';
const REQUESTS_FOLDER_NAME = 'Client Portal Requests';
const REQUEST_PREFIX = 'portal-request-';

const MS_TENANT_ID = 'a9346e69-975d-4abb-861a-dea6e2464642';
const MS_TOKEN_URL = 'https://login.microsoftonline.com/' + MS_TENANT_ID + '/oauth2/v2.0/token';
const NOTIFY_EMAIL = 'eric@themilesman.com';
const MS_SEND_MAIL_URL = 'https://graph.microsoft.com/v1.0/users/' + encodeURIComponent(NOTIFY_EMAIL) + '/sendMail';

const ALLOWED_ORIGINS = ['https://milesmaneric.github.io', 'https://themilesman.com', 'https://www.themilesman.com'];
const DEFAULT_PORTAL_URL = 'https://milesmaneric.github.io/milesman-crm/client-portal.html';

const LOGIN_TTL_S = 20 * 60;
const SESSION_TTL_S = 8 * 60 * 60;
const BACKUP_CACHE_MS = 60 * 1000;

// ── small utilities ─────────────────────────────────────────────────────

function clean(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max || 200);
}
function normEmail(v) { return String(v == null ? '' : v).trim().toLowerCase(); }
function isEmail(v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) && v.length <= 120; }
function qEsc(v) { return String(v).replace(/[\\']/g, ''); }
function escHtml(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function todayStr() { return new Date().toISOString().slice(0, 10); }

// ── signed tokens (login link + session) ────────────────────────────────

function getSecret() {
  const s = process.env.PORTAL_SECRET;
  if (!s || s.length < 32) {
    throw new Error('server_not_configured: PORTAL_SECRET is missing or shorter than 32 characters on this Vercel project.');
  }
  return s;
}
function b64u(buf) { return Buffer.from(buf).toString('base64url'); }
function signToken(payload) {
  const body = b64u(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
  return body + '.' + sig;
}
// Returns the payload if the token is genuine, unexpired and of the expected
// type; otherwise null. Constant-time signature comparison.
function readToken(token, typ) {
  if (typeof token !== 'string' || token.length > 2000) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const expected = crypto.createHmac('sha256', getSecret()).update(parts[0]).digest();
  let given;
  try { given = Buffer.from(parts[1], 'base64url'); } catch (e) { return null; }
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  let p;
  try { p = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')); } catch (e) { return null; }
  if (!p || p.typ !== typ || typeof p.em !== 'string' || typeof p.exp !== 'number') return null;
  if (p.exp < Math.floor(Date.now() / 1000)) return null;
  return p;
}
function mintToken(typ, email, ttlSeconds) {
  return signToken({ typ: typ, em: email, exp: Math.floor(Date.now() / 1000) + ttlSeconds, n: crypto.randomBytes(8).toString('hex') });
}

// ── best-effort in-memory rate limiting ─────────────────────────────────

const hits = new Map();
function rateLimited(key, max, windowMs) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter(function (t) { return now - t < windowMs; });
  if (arr.length >= max) { hits.set(key, arr); return true; }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) { // keep memory bounded on a long-lived instance
    hits.forEach(function (v, k) { if (!v.length || now - v[v.length - 1] > windowMs) hits.delete(k); });
  }
  return false;
}
function clientIp(req) {
  const xf = String((req.headers && req.headers['x-forwarded-for']) || '').split(',')[0].trim();
  return xf || (req.socket && req.socket.remoteAddress) || 'unknown';
}

// ── Google Drive (server credential) ────────────────────────────────────

async function getDriveAccessToken() {
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.DRIVE_SERVER_REFRESH_TOKEN;
  if (!clientSecret || !refreshToken) {
    throw new Error('server_not_configured: GOOGLE_CLIENT_SECRET / DRIVE_SERVER_REFRESH_TOKEN are not set on this Vercel project.');
  }
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: DRIVE_CLIENT_ID, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }).toString()
  });
  const data = await r.json();
  if (!r.ok || !data.access_token) throw new Error('drive_auth_failed: ' + (data.error_description || data.error || 'could not refresh the server Drive credential'));
  return data.access_token;
}

async function driveList(token, q, fields) {
  const url = DRIVE_FILES_URL + '?q=' + encodeURIComponent(q) + '&orderBy=modifiedTime%20desc&pageSize=100&fields=' + encodeURIComponent(fields);
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  const d = await r.json();
  if (!r.ok) throw new Error('drive_list_failed: ' + (d.error && d.error.message || r.status));
  return d.files || [];
}
async function driveReadJson(token, fileId) {
  const r = await fetch(DRIVE_FILES_URL + '/' + encodeURIComponent(fileId) + '?alt=media', { headers: { Authorization: 'Bearer ' + token } });
  if (!r.ok) throw new Error('drive_read_failed: HTTP ' + r.status);
  return r.json();
}

let backupCache = null;
// The CRM's whole dataset, as last backed up. Cached briefly per instance:
// the file is several MB, and one portal visit makes several calls.
async function loadBackup(token) {
  if (backupCache && Date.now() - backupCache.at < BACKUP_CACHE_MS) return backupCache;
  const files = await driveList(token, "name='" + BACKUP_FILENAME + "' and trashed=false", 'files(id,modifiedTime)');
  if (!files.length) throw new Error('backup_not_found: ' + BACKUP_FILENAME + ' is not visible to the server Drive credential. Run Secure Sync: Save in the CRM.');
  const db = await driveReadJson(token, files[0].id);
  if (!db || !Array.isArray(db.clients) || !Array.isArray(db.trips)) throw new Error('backup_invalid: the backup file does not look like CRM data.');
  backupCache = { at: Date.now(), db: db, modifiedTime: files[0].modifiedTime };
  return backupCache;
}

async function getRequestsFolderId(token) {
  const q = "mimeType='application/vnd.google-apps.folder' and name='" + REQUESTS_FOLDER_NAME + "' and trashed=false";
  const found = await driveList(token, q, 'files(id)');
  if (found.length) return found[0].id;
  const r = await fetch(DRIVE_FILES_URL + '?fields=id', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: REQUESTS_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' })
  });
  const d = await r.json();
  if (!r.ok || !d.id) throw new Error('drive_folder_failed: ' + (d.error && d.error.message || 'could not create the "' + REQUESTS_FOLDER_NAME + '" folder'));
  return d.id;
}

// Pending requests, optionally for one client. Each file's appProperties
// carry {kind, status, clientId} so listing never has to open every file.
async function listRequests(token, clientId) {
  const folderId = await getRequestsFolderId(token);
  let q = "'" + folderId + "' in parents and trashed=false and appProperties has { key='kind' and value='portal-request' } and appProperties has { key='status' and value='pending' }";
  if (clientId) q += " and appProperties has { key='clientId' and value='" + qEsc(clientId) + "' }";
  const files = await driveList(token, q, 'files(id,name,createdTime)');
  const out = [];
  for (let i = 0; i < files.length && i < 100; i++) {
    try {
      const j = await driveReadJson(token, files[i].id);
      j.fileId = files[i].id;
      out.push(j);
    } catch (e) { console.error('portal: could not read request ' + files[i].id + ': ' + e.message); }
  }
  return out;
}

async function createRequestFile(token, rec) {
  const folderId = await getRequestsFolderId(token);
  const name = REQUEST_PREFIX + rec.createdAt.replace(/[:.]/g, '-') + '-' + rec.id + '.json';
  const metadata = {
    name: name, parents: [folderId], mimeType: 'application/json',
    appProperties: { kind: 'portal-request', status: 'pending', clientId: String(rec.clientId).slice(0, 100) }
  };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' }), name);
  const r = await fetch(DRIVE_UPLOAD_URL + '?uploadType=multipart&fields=id', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: form });
  const d = await r.json();
  if (!r.ok || !d.id) throw new Error('drive_upload_failed: ' + (d.error && d.error.message || 'Drive rejected the request file'));
  return d.id;
}

async function resolveRequestFile(token, fileId, status, by) {
  const cur = await driveReadJson(token, fileId);
  if (!cur || !cur.id || !cur.clientId) throw new Error('not_a_request: that file is not a portal request.');
  cur.status = status;
  cur.resolvedAt = new Date().toISOString();
  cur.resolvedBy = by;
  const up = await fetch(DRIVE_UPLOAD_URL + '/' + encodeURIComponent(fileId) + '?uploadType=media', {
    method: 'PATCH', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(cur, null, 2)
  });
  if (!up.ok) throw new Error('drive_update_failed: HTTP ' + up.status);
  const meta = await fetch(DRIVE_FILES_URL + '/' + encodeURIComponent(fileId), {
    method: 'PATCH', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ appProperties: { status: status } })
  });
  if (!meta.ok) throw new Error('drive_update_failed: HTTP ' + meta.status);
}

// ── Microsoft Graph mail (best effort) ──────────────────────────────────

async function getMsAccessToken() {
  const id = process.env.MS_NOTIFY_CLIENT_ID, secret = process.env.MS_NOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error('server_not_configured: MS_NOTIFY_CLIENT_ID / MS_NOTIFY_CLIENT_SECRET are not set on this Vercel project.');
  const r = await fetch(MS_TOKEN_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: 'client_credentials', scope: 'https://graph.microsoft.com/.default' }).toString()
  });
  const d = await r.json();
  if (!r.ok || !d.access_token) throw new Error('ms_auth_failed: ' + (d.error_description || d.error || 'could not get a Graph token'));
  return d.access_token;
}
async function sendMail(to, subject, contentType, content, saveToSent) {
  const token = await getMsAccessToken();
  const r = await fetch(MS_SEND_MAIL_URL, {
    method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: { subject: subject, body: { contentType: contentType, content: content }, toRecipients: [{ emailAddress: { address: to } }] }, saveToSentItems: !!saveToSent })
  });
  if (!r.ok) {
    let detail = ''; try { detail = JSON.stringify(await r.json()); } catch (e) {}
    throw new Error('graph_sendmail_failed: HTTP ' + r.status + ' ' + detail);
  }
}

function loginEmailHtml(link, firstName) {
  return '<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;color:#111;line-height:1.5">' +
    '<h2 style="margin:0 0 12px">Your Miles Man client portal</h2>' +
    '<p>Hi' + (firstName ? ' ' + escHtml(firstName) : '') + ',</p>' +
    '<p>Click the button below to sign in and see your trips and your client record. The link works for 20 minutes.</p>' +
    '<p style="margin:22px 0"><a href="' + escHtml(link) + '" style="background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;display:inline-block">Sign in to my portal</a></p>' +
    '<p style="font-size:13px;color:#555">Or paste this address into your browser:<br><span style="word-break:break-all">' + escHtml(link) + '</span></p>' +
    '<p style="font-size:13px;color:#555">If you did not ask to sign in, you can ignore this email - nobody can get in without this link.</p>' +
    '<p style="font-size:13px;color:#555;margin-top:20px">The Miles Man<br>eric@themilesman.com</p></div>';
}

// ── CRM data -> what a client may see ───────────────────────────────────

function parseName(stored) {
  const s = clean(stored, 120);
  if (s.indexOf(',') >= 0) { const i = s.indexOf(','); return { last: s.slice(0, i).trim(), first: s.slice(i + 1).trim() }; }
  const bits = s.split(' ');
  if (bits.length < 2) return { first: '', last: s };
  return { first: bits.slice(0, -1).join(' '), last: bits[bits.length - 1] };
}
function displayName(stored) { const p = parseName(stored); return (p.first + ' ' + p.last).trim(); }

// Fields a client may ask to change. type -> validator/normalizer returning
// the cleaned value, or null when invalid.
const US_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EDITABLE = {
  email: { label: 'Email', type: 'email' },
  phone: { label: 'Phone', type: 'text', max: 30 },
  streetAddress: { label: 'Street address', type: 'text', max: 120 },
  city: { label: 'City', type: 'text', max: 80 },
  state: { label: 'State', type: 'text', max: 40 },
  zip: { label: 'ZIP / postal code', type: 'text', max: 20 },
  birthdate: { label: 'Date of birth', type: 'date' },
  countryOfCitizenship: { label: 'Country of citizenship', type: 'text', max: 80 },
  countryOfBirth: { label: 'Country of birth', type: 'text', max: 80 },
  passportExpiration: { label: 'Passport expiration date', type: 'date' },
  preferredAirline: { label: 'Preferred airline', type: 'text', max: 80 },
  preferredHotel: { label: 'Preferred hotel', type: 'text', max: 80 },
  preferredCruiseLine: { label: 'Preferred cruise line', type: 'text', max: 80 },
  okToText: { label: 'OK to text', type: 'bool' },
  name: { label: 'Name', type: 'text', max: 120 } // composed from firstName/lastName below
};
function normalizeValue(spec, v) {
  if (spec.type === 'bool') return v === true || v === 'true' ? true : (v === false || v === 'false' ? false : null);
  const s = clean(v, spec.max || 120);
  if (spec.type === 'email') { const e = normEmail(s); return e === '' || isEmail(e) ? e : null; }
  if (spec.type === 'date') {
    if (s === '') return '';
    if (!US_DATE.test(s) || isNaN(Date.parse(s + 'T00:00:00Z'))) return null;
    return s;
  }
  return s;
}
function currentValue(spec, c, key) {
  const v = c[key];
  if (spec.type === 'bool') return !!v;
  return v == null ? '' : (spec.type === 'email' ? normEmail(v) : String(v));
}

function brandRows(obj) {
  const rows = [];
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(function (k) {
      const v = obj[k];
      const bal = v && typeof v === 'object' ? v.balance : v;
      const status = v && typeof v === 'object' ? v.status : '';
      if ((bal === '' || bal == null || Number(bal) === 0) && !status) return;
      rows.push({ name: clean(k, 80), balance: bal == null ? '' : clean(bal, 30), status: clean(status, 40) });
    });
  }
  return rows;
}
function projectClient(c) {
  const p = parseName(c.name);
  return {
    id: c.id,
    firstName: p.first, lastName: p.last, name: displayName(c.name),
    email: normEmail(c.email), phone: clean(c.phone, 30),
    streetAddress: clean(c.streetAddress, 120), city: clean(c.city, 80), state: clean(c.state, 40), zip: clean(c.zip, 20),
    birthdate: clean(c.birthdate, 10), countryOfCitizenship: clean(c.countryOfCitizenship, 80), countryOfBirth: clean(c.countryOfBirth, 80),
    passportExpiration: clean(c.passportExpiration, 10),
    preferredAirline: clean(c.preferredAirline, 80), preferredHotel: clean(c.preferredHotel, 80), preferredCruiseLine: clean(c.preferredCruiseLine, 80),
    okToText: !!c.okToText,
    discounts: (Array.isArray(c.discounts) ? c.discounts : []).map(function (x) { return clean(x, 40); }).concat(c.discountOther ? [clean(c.discountOther, 60)] : []).filter(Boolean),
    interests: (Array.isArray(c.interests) ? c.interests : []).map(function (x) { return clean(x, 40); }).concat(c.interestOther ? [clean(c.interestOther, 60)] : []).filter(Boolean),
    loyalty: {
      airlines: brandRows(c.mileageBalances), hotels: brandRows(c.hotelBalances), cruise: brandRows(c.cruiseBalances), carRental: brandRows(c.carRentalBalances)
    }
  };
}

function isNonTravelIncomeTrip(t) {
  const p = String(t.product || '').toLowerCase();
  return p.indexOf('referral') !== -1 || p.indexOf('promo') !== -1 || p.indexOf('credit card consulting') !== -1 || p.indexOf('non-cash bonus') !== -1 || p.indexOf('noncash bonus') !== -1;
}
function arr(v) { return Array.isArray(v) ? v : (v && typeof v === 'object' ? [v] : []); }
function pick(o, keys) {
  const out = {};
  keys.forEach(function (k) { if (o && o[k] != null && o[k] !== '') out[k] = clean(o[k], 200); });
  return out;
}

// Booked-trip details a client may see: itinerary facts and confirmation
// numbers only. Prices, points, insurance, resort credit, notes and
// supplier/third-party booking details never leave the server.
function projectBooked(b, nameOf) {
  b = b || {};
  const out = {};
  const airRecords = b.airline && Array.isArray(b.airline.records) ? b.airline.records
    : (b.airline && typeof b.airline === 'object' && Object.keys(b.airline).length ? [b.airline] : []);
  const flights = airRecords.map(function (r) {
    return {
      recordNumber: clean(r.recordNumber || r.confirmationNumber, 40),
      passengers: arr(r.passengerClientIds).map(nameOf).filter(Boolean),
      segments: arr(r.segments).map(function (s) { return pick(s, ['airline', 'flightNumber', 'origin', 'destination', 'departDate', 'departTime', 'arrivalTime', 'classOfService']); })
    };
  }).filter(function (r) { return r.recordNumber || r.segments.length; });
  if (flights.length) out.flights = flights;
  const hotels = arr(b.hotel).map(function (h) { return pick(h, ['hotelBrand', 'property', 'confirmationNumber', 'checkInDate', 'nights']); }).filter(function (h) { return Object.keys(h).length; });
  if (hotels.length) out.hotels = hotels;
  if (b.cruise && typeof b.cruise === 'object') {
    const c = pick(b.cruise, ['confirmationNumber', 'cruiseLine', 'shipName', 'sailingDate', 'returnDate', 'nights', 'departurePort', 'returnPort']);
    c.cabins = arr(b.cruise.cabins).map(function (x) { return pick(x, ['cabinType', 'peopleInCabin', 'cabinNumber']); });
    if (Object.keys(c).length > 1 || c.cabins.length) out.cruise = c;
  }
  if (b.carRental && typeof b.carRental === 'object') {
    const c = pick(b.carRental, ['confirmationNumber', 'company', 'carSize', 'pickupLocation', 'dropoffLocation', 'pickupDate', 'dropoffDate', 'pickupTime', 'dropoffTime']);
    if (Object.keys(c).length) out.carRental = c;
  }
  const transfers = arr(b.transfers).map(function (x) { return pick(x, ['pickupDate', 'pickupTime', 'origin', 'destination', 'carType', 'provider', 'confirmationNumber']); }).filter(function (x) { return Object.keys(x).length; });
  if (transfers.length) out.transfers = transfers;
  const tours = arr(b.tours).map(function (x) { return pick(x, ['vendor', 'description', 'confirmationNumber']); }).filter(function (x) { return Object.keys(x).length; });
  if (tours.length) out.tours = tours;
  const parks = arr(b.themePark).map(function (x) { return pick(x, ['park', 'ticketType', 'confirmationNumber']); }).filter(function (x) { return Object.keys(x).length; });
  if (parks.length) out.themeParks = parks;
  ['train', 'bus'].forEach(function (k) {
    if (b[k] && typeof b[k] === 'object') {
      const x = pick(b[k], ['confirmationNumber', 'departureCity', 'arrivalCity', 'departureDate', 'returnDate', 'classOfService']);
      if (Object.keys(x).length) out[k] = x;
    }
  });
  return out;
}

function projectTrip(t, clientsById) {
  const nameOf = function (id) { const c = clientsById[id]; return c ? displayName(c.name) : ''; };
  let status = clean(t.status || 'Planning', 30);
  if (status === 'Completed' && t.departDate && t.departDate >= todayStr()) status = 'Upcoming';
  const travelerIds = [t.clientId].concat(arr(t.clientIds)).filter(function (x, i, a) { return x && a.indexOf(x) === i; });
  const booked = t.booked || {};
  return {
    id: t.id,
    name: clean(booked.tripName || t.destination || 'Trip', 120),
    status: status, type: clean(t.type, 30),
    origin: clean(t.origin, 80), destination: clean(t.destination, 80),
    departDate: clean(t.departDate, 10), returnDate: clean(t.returnDate, 10),
    travelers: travelerIds.map(nameOf).filter(Boolean),
    booked: projectBooked(booked, nameOf)
  };
}

function matchingClients(db, email) {
  const em = normEmail(email);
  if (!em) return [];
  return db.clients.filter(function (c) { return normEmail(c.email) === em; });
}

// ── handlers ────────────────────────────────────────────────────────────

function bearer(req) {
  const h = String((req.headers && (req.headers.authorization || req.headers.Authorization)) || '');
  return h.startsWith('Bearer ') ? h.slice(7).trim() : '';
}

async function handleRequestLink(req, res, b) {
  const email = normEmail(clean(b.email, 120));
  if (!isEmail(email)) return res.status(400).json({ error: 'bad_email', error_description: 'Please enter a valid email address.' });
  // Same answer however this goes, so the form can't be used to probe who is a client.
  const generic = function () { return res.status(200).json({ ok: true, message: 'If that email is on file, a sign-in link is on its way.' }); };
  if (rateLimited('ip:' + clientIp(req), 20, 60 * 60 * 1000) || rateLimited('em:' + email, 5, 60 * 60 * 1000)) return generic();
  getSecret(); // config error must surface to Eric, not be swallowed below
  try {
    const drive = await getDriveAccessToken();
    const { db } = await loadBackup(drive);
    const matches = matchingClients(db, email);
    if (!matches.length) return generic();
    if (rateLimited('em-min:' + email, 1, 60 * 1000)) return generic();
    const link = (process.env.PORTAL_URL || DEFAULT_PORTAL_URL) + '#t=' + encodeURIComponent(mintToken('login', email, LOGIN_TTL_S));
    await sendMail(email, 'Your Miles Man client portal sign-in link', 'HTML', loginEmailHtml(link, parseName(matches[0].name).first), false);
  } catch (e) {
    console.error('portal request-link failed:', e.message); // logged, never shown to the visitor
  }
  return generic();
}

function handleVerify(res, b) {
  const p = readToken(String(b.token || ''), 'login');
  if (!p) return res.status(401).json({ error: 'link_invalid', error_description: 'This sign-in link has expired or is not valid. Please request a new one.' });
  return res.status(200).json({ ok: true, session: mintToken('sess', p.em, SESSION_TTL_S), expiresIn: SESSION_TTL_S });
}

function sessionEmail(req) {
  const p = readToken(bearer(req), 'sess');
  return p ? p.em : null;
}

async function handleMe(req, res) {
  const email = sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'session_expired', error_description: 'Your session has expired. Please sign in again.' });
  const drive = await getDriveAccessToken();
  const { db, modifiedTime } = await loadBackup(drive);
  const matches = matchingClients(db, email);
  if (!matches.length) return res.status(403).json({ error: 'no_record', error_description: 'We could not find a client record for this email.' });
  const clientsById = {};
  db.clients.forEach(function (c) { clientsById[c.id] = c; });
  const records = [];
  for (let i = 0; i < matches.length; i++) {
    const c = matches[i];
    const trips = db.trips.filter(function (t) {
      if (isNonTravelIncomeTrip(t)) return false;
      return t.clientId === c.id || arr(t.clientIds).indexOf(c.id) !== -1;
    }).map(function (t) { return projectTrip(t, clientsById); });
    let pending = [];
    try { pending = (await listRequests(drive, c.id)).map(function (r) { return { id: r.id, createdAt: r.createdAt, changes: r.changes, message: r.message || '' }; }); }
    catch (e) { console.error('portal: pending list failed:', e.message); }
    records.push({ profile: projectClient(c), trips: trips, pendingRequests: pending });
  }
  return res.status(200).json({ ok: true, email: email, dataAsOf: modifiedTime, records: records });
}

async function handleUpdate(req, res, b) {
  const email = sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'session_expired', error_description: 'Your session has expired. Please sign in again.' });
  if (rateLimited('upd:' + email, 10, 60 * 60 * 1000)) return res.status(429).json({ error: 'too_many', error_description: 'Too many changes were submitted recently. Please try again later.' });
  const drive = await getDriveAccessToken();
  const { db } = await loadBackup(drive);
  const c = matchingClients(db, email).find(function (x) { return x.id === String(b.clientId || ''); });
  if (!c) return res.status(403).json({ error: 'no_record', error_description: 'That record does not belong to this sign-in.' });

  const incoming = b.changes && typeof b.changes === 'object' ? b.changes : {};
  const changes = {};
  const errors = [];
  // First/last name are virtual: they only ever produce a single "name" change in the CRM's "Last, First" form.
  if (incoming.firstName !== undefined || incoming.lastName !== undefined) {
    const cur = parseName(c.name);
    const first = incoming.firstName !== undefined ? clean(incoming.firstName, 60) : cur.first;
    const last = incoming.lastName !== undefined ? clean(incoming.lastName, 60) : cur.last;
    if (!first || !last) errors.push('Please give both a first and a last name.');
    else if (first !== cur.first || last !== cur.last) changes.name = { label: EDITABLE.name.label, from: clean(c.name, 120), to: last + ', ' + first };
  }
  Object.keys(incoming).forEach(function (k) {
    if (k === 'firstName' || k === 'lastName' || k === 'name') return;
    const spec = EDITABLE[k];
    if (!spec) return; // anything not on the whitelist is silently ignored
    const val = normalizeValue(spec, incoming[k]);
    if (val === null) { errors.push(spec.label + ' is not valid.'); return; }
    const cur = currentValue(spec, c, k);
    if (val === cur) return;
    changes[k] = { label: spec.label, from: spec.type === 'bool' ? (cur ? 'Yes' : 'No') : cur, to: spec.type === 'bool' ? (val ? 'Yes' : 'No') : val, raw: val };
  });
  if (errors.length) return res.status(400).json({ error: 'bad_value', error_description: errors.join(' ') });
  if (!Object.keys(changes).length) return res.status(400).json({ error: 'no_changes', error_description: 'Nothing was changed.' });
  if (changes.email && changes.email.raw === '') return res.status(400).json({ error: 'bad_value', error_description: 'Email cannot be blank - it is how you sign in.' });
  // Store the typed value under "to" for the CRM to apply; keep display and raw both for booleans.
  Object.keys(changes).forEach(function (k) {
    const ch = changes[k];
    if (ch.raw !== undefined) { ch.value = ch.raw; delete ch.raw; } else { ch.value = ch.to; }
  });

  const rec = {
    id: crypto.randomBytes(6).toString('hex'),
    status: 'pending',
    createdAt: new Date().toISOString(),
    clientId: c.id, clientName: displayName(c.name), clientEmail: email,
    changes: changes,
    message: clean(b.message, 1000),
    ip: clientIp(req)
  };
  await createRequestFile(drive, rec);

  let emailSent = false;
  try {
    const lines = ['A client submitted changes from the portal.', '', 'Client: ' + rec.clientName + ' (' + rec.clientId + ')', 'Email: ' + email, ''];
    Object.keys(changes).forEach(function (k) { lines.push(changes[k].label + ': ' + (changes[k].from || '(blank)') + '  ->  ' + (changes[k].to || '(blank)')); });
    if (rec.message) lines.push('', 'Message: ' + rec.message);
    lines.push('', 'Review and apply in the CRM: File menu -> Client Portal Requests.');
    await sendMail(NOTIFY_EMAIL, 'Client portal change request - ' + rec.clientName, 'Text', lines.join('\n'), true);
    emailSent = true;
  } catch (e) { console.error('portal: notification email failed:', e.message); }

  return res.status(200).json({ ok: true, requestId: rec.id, emailSent: emailSent });
}

// Staff (CRM) authentication - same checks as Secure Sync.
async function verifyStaff(req) {
  const idToken = bearer(req);
  if (!idToken) return null;
  const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken));
  if (!r.ok) return null;
  const t = await r.json();
  if (t.aud !== DRIVE_CLIENT_ID) return null;
  if (String(t.email_verified) !== 'true') return null;
  const allowed = String(process.env.ALLOWED_EMAILS || '').split(',').map(normEmail).filter(Boolean);
  const em = normEmail(t.email);
  return allowed.indexOf(em) !== -1 ? em : null;
}

async function handleStaffList(req, res) {
  const who = await verifyStaff(req);
  if (!who) return res.status(401).json({ error: 'not_allowed', error_description: 'Not authorized.' });
  const drive = await getDriveAccessToken();
  const requests = await listRequests(drive, null);
  requests.sort(function (a, b) { return String(a.createdAt).localeCompare(String(b.createdAt)); });
  return res.status(200).json({ ok: true, requests: requests });
}

async function handleStaffResolve(req, res, b) {
  const who = await verifyStaff(req);
  if (!who) return res.status(401).json({ error: 'not_allowed', error_description: 'Not authorized.' });
  const status = b.status === 'applied' ? 'applied' : (b.status === 'dismissed' ? 'dismissed' : '');
  const fileId = String(b.fileId || '');
  if (!status || !/^[\w-]{10,100}$/.test(fileId)) return res.status(400).json({ error: 'bad_request', error_description: 'status and fileId are required.' });
  const drive = await getDriveAccessToken();
  await resolveRequestFile(drive, fileId, status, who);
  return res.status(200).json({ ok: true });
}

async function portalHandler(req, res) {
  const origin = (req.headers && req.headers.origin) || '';
  if (ALLOWED_ORIGINS.indexOf(origin) >= 0) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  if (origin && ALLOWED_ORIGINS.indexOf(origin) < 0) { res.status(403).json({ error: 'forbidden_origin' }); return; }

  const b = req.body && typeof req.body === 'object' ? req.body : {};
  try {
    switch (b.action) {
      case 'request-link': return await handleRequestLink(req, res, b);
      case 'verify': return handleVerify(res, b);
      case 'me': return await handleMe(req, res);
      case 'update': return await handleUpdate(req, res, b);
      case 'staff-list': return await handleStaffList(req, res);
      case 'staff-resolve': return await handleStaffResolve(req, res, b);
      default: return res.status(400).json({ error: 'bad_action' });
    }
  } catch (e) {
    console.error('portal error:', e.message);
    const code = /^(\w+):/.exec(e.message);
    return res.status(500).json({ error: code ? code[1] : 'portal_error', error_description: 'The portal is temporarily unavailable. Please try again in a few minutes.' });
  }
}

module.exports = portalHandler;
module.exports._test = { signToken, readToken, mintToken, projectTrip, projectClient, parseName, normalizeValue, isNonTravelIncomeTrip, _resetCache: function () { backupCache = null; hits.clear(); } };
