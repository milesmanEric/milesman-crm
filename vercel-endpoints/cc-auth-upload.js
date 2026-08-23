// Miles Man CRM — public Credit Card Authorization Form upload.
//
// WHERE THIS GOES: copy to api/cc-auth-upload.js in the milesman-auth Vercel
// project (C:\Users\ericl\milesman-auth-fix), then `vercel --prod`. Not part
// of the milesman-crm repo's own deploy (GitHub Pages, static files only,
// no secret storage) — the public page that POSTs here is cc-auth-upload.html
// in this repo.
//
// WHAT THIS DOES: a client opens a personalized link (generated from their
// CRM record — index.html's "Copy Upload Link" button on the client form,
// §4.12 in DOCUMENTATION.md) and uploads their completed, signed credit card
// authorization PDF. There's no login for the client — this endpoint is
// public the same way the Book a Trip form and the Jetpack subscribe
// endpoint are, and treats every request as untrusted input to validate,
// not as an authenticated call. The PDF is uploaded server-side straight
// into a private Google Drive folder using the SAME server-held Drive
// credential api/secure-sync.js already established — the browser (client
// or CRM) never holds a credential capable of reading Drive, only of
// POSTing a new file to this one endpoint.
//
// REQUIRED VERCEL ENV VARS (both already set for api/secure-sync.js):
//   GOOGLE_CLIENT_SECRET      — same OAuth 2.0 Client Secret Drive
//                               Backup/Restore and Secure Sync use
//   DRIVE_SERVER_REFRESH_TOKEN — a real refresh token for the account that
//                               should own the uploaded files (Debug Panel's
//                               "Copy Drive Refresh Token" button in the CRM,
//                               same value Secure Sync setup already used)
// No new env vars needed if Secure Sync (§4.1a) is already configured.
//
// WHY UPLOADS SHOULD SHOW UP IN THE CRM'S OWN "Browse Google Drive" PICKER:
// both this server-side credential and the CRM's own browser-side Drive
// connection are issued to the same OAuth Client ID (DRIVE_CLIENT_ID,
// hardcoded below to match index.html) for the same Google account under
// drive.file scope, which grants access per (app, file) rather than per
// individual token — in practice this means a folder/file created by one
// token for that client ID is visible to any other token for the same
// client ID + account, including the CRM's own picker. This has NOT been
// independently confirmed against a live upload+browse round trip (the
// environment this was built in has no way to test a real Drive upload) —
// if a client's uploaded PDF doesn't turn up in the CRM's Drive picker,
// check the Google Drive web UI directly (search "Credit Card Authorization
// Forms") before assuming the upload failed; the file is very likely there
// even if the picker can't surface it for some scope reason not caught here.
//
// FILE SIZE: capped at 8MB (MAX_BYTES below), matching cc-auth-upload.html's
// own client-side cap — keep the two in sync if this is ever changed.
// This is deliberately conservative, NOT a confirmed Vercel platform limit:
// standard Node.js Serverless Functions have historically capped request
// bodies well under 8MB on some plans, so if uploads fail with a 413 here,
// lower MAX_BYTES in both files, or move this endpoint to an Edge Function
// (different body-size rules) — verify against whatever the account's
// actual Vercel plan documents before raising it.
//
// SECURITY NOTE: this endpoint is intentionally public and unauthenticated,
// same trust model as the Book a Trip form (§4.4) — anyone with a link can
// upload a PDF, but the link grants no read access to anything, and every
// upload is validated server-side (real PDF magic bytes, not just the
// client-side .pdf check, which a malicious caller could bypass entirely)
// before it's written to Drive. There is no rate limiting — a determined
// abuser could still spam small PDFs at this endpoint; that's an accepted
// gap for a low-traffic single-client-facing form, not something this file
// defends against.

const DRIVE_CLIENT_ID = '1055867383042-an9l58o1qg22pt7o4ak8vaneeftv54ib.apps.googleusercontent.com';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const FOLDER_NAME = 'Credit Card Authorization Forms';
const MAX_BYTES = 8 * 1024 * 1024;
const PDF_MAGIC = Buffer.from('%PDF');

async function getServerDriveAccessToken() {
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.DRIVE_SERVER_REFRESH_TOKEN;
  if (!clientSecret || !refreshToken) {
    throw new Error('server_not_configured: GOOGLE_CLIENT_SECRET / DRIVE_SERVER_REFRESH_TOKEN are not set on this Vercel project.');
  }
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: DRIVE_CLIENT_ID,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }).toString()
  });
  const data = await r.json();
  if (!r.ok || !data.access_token) {
    throw new Error('drive_auth_failed: ' + (data.error_description || data.error || 'could not refresh the server Drive credential'));
  }
  return data.access_token;
}

// Finds the shared upload folder, creating it the first time this runs.
// Safe to call on every request — Drive API list/create calls are cheap,
// and there's no local state a serverless function could cache this in
// between cold starts anyway.
async function getOrCreateFolder(accessToken) {
  const q = "mimeType='application/vnd.google-apps.folder' and name='" + FOLDER_NAME + "' and trashed=false";
  const listUrl = DRIVE_FILES_URL + '?q=' + encodeURIComponent(q) + '&fields=' + encodeURIComponent('files(id,name)');
  const listRes = await fetch(listUrl, { headers: { Authorization: 'Bearer ' + accessToken } });
  const listData = await listRes.json();
  if (listRes.ok && listData.files && listData.files.length) {
    return listData.files[0].id;
  }
  const createRes = await fetch(DRIVE_FILES_URL + '?fields=id', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' })
  });
  const createData = await createRes.json();
  if (!createRes.ok || !createData.id) {
    throw new Error('drive_folder_failed: ' + (createData.error && createData.error.message || 'could not create the upload folder'));
  }
  return createData.id;
}

// Keeps the filename readable and safe for Drive/downstream tools without
// leaking arbitrary client input straight into the name — strips anything
// that isn't a common filename character.
function sanitizeForFilename(str) {
  return (str || '').toString().trim().replace(/[^\w \-().]/g, '').slice(0, 80);
}

module.exports = async (req, res) => {
  // Same origin every other proxy endpoint in this app allows — the public
  // upload page is served from GitHub Pages alongside the CRM itself.
  res.setHeader('Access-Control-Allow-Origin', 'https://milesmaneric.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }

  const body = req.body || {};
  const clientId = (body.clientId || '').toString().trim();
  const clientName = (body.clientName || '').toString().trim();
  const filename = (body.filename || '').toString().trim();
  const fileBase64 = body.fileBase64;

  if (!fileBase64) {
    res.status(400).json({ error: 'missing_file', error_description: 'No file data was received.' });
    return;
  }

  let buffer;
  try {
    buffer = Buffer.from(fileBase64, 'base64');
  } catch (e) {
    res.status(400).json({ error: 'bad_file_data', error_description: 'The uploaded file could not be decoded.' });
    return;
  }

  if (!buffer.length) {
    res.status(400).json({ error: 'empty_file', error_description: 'The uploaded file is empty.' });
    return;
  }
  if (buffer.length > MAX_BYTES) {
    res.status(413).json({ error: 'file_too_large', error_description: 'The file is larger than the ' + Math.round(MAX_BYTES / 1024 / 1024) + 'MB limit.' });
    return;
  }
  // Real server-side validation — the client-side .pdf/mime-type check in
  // cc-auth-upload.html is only a UX convenience and trivial to bypass, so
  // this is the actual security boundary against something other than a
  // PDF landing in the authorization-forms folder.
  if (buffer.subarray(0, 4).compare(PDF_MAGIC) !== 0) {
    res.status(400).json({ error: 'not_a_pdf', error_description: 'That file is not a valid PDF.' });
    return;
  }

  try {
    const accessToken = await getServerDriveAccessToken();
    const folderId = await getOrCreateFolder(accessToken);

    const namePart = sanitizeForFilename(clientName) || 'Unknown Client';
    const idPart = sanitizeForFilename(clientId) || 'no-id';
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const driveFilename = 'CC Auth - ' + namePart + ' (' + idPart + ') - ' + stamp + '.pdf';

    const metadata = { name: driveFilename, parents: [folderId] };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([buffer], { type: 'application/pdf' }), driveFilename);

    const uploadRes = await fetch(DRIVE_UPLOAD_URL + '?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + accessToken },
      body: form
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok || !uploadData.id) {
      throw new Error('drive_upload_failed: ' + (uploadData.error && uploadData.error.message || 'Drive rejected the upload'));
    }

    res.status(200).json({ ok: true, fileId: uploadData.id, fileName: uploadData.name, webViewLink: uploadData.webViewLink });
  } catch (e) {
    res.status(500).json({ error: 'upload_error', error_description: e.message });
  }
};
