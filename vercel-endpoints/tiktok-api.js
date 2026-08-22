// Miles Man CRM — TikTok Display API CORS relay.
//
// WHERE THIS GOES: copy to api/tiktok-api.js in the milesman-auth Vercel
// project (C:\Users\ericl\milesman-auth-fix), then `vercel --prod`. Same
// ?path= shape as the existing api/wordpress-stats.js/api/facebook-graph.js/
// api/x-api.js relays.
//
// No secret lives here — the browser's own TikTok user access token passes
// through untouched. This exists purely for CORS, the same reason every
// other *-api.js relay in this proxy exists.
//
// COST: free — TikTok's Display API has no per-request billing (unlike
// api/x-api.js, which forwards genuinely billable X reads).

const ALLOWED_PREFIXES = ['/v2/user/info/'];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://milesmaneric.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET') { res.status(405).json({ error: 'method_not_allowed' }); return; }

  const auth = req.headers.authorization;
  if (!auth) { res.status(401).json({ error: 'missing_authorization' }); return; }

  const path = req.query.path;
  if (!path) { res.status(400).json({ error: 'missing_path' }); return; }

  // Only relay the one read endpoint this app actually uses — keeps a
  // leaked or borrowed token from driving arbitrary calls (posting,
  // deleting video, etc.) through this proxy.
  if (!ALLOWED_PREFIXES.some(p => path.startsWith(p))) {
    res.status(403).json({ error: 'path_not_allowed', error_description: 'This relay only serves the TikTok read endpoint used by the CRM.' });
    return;
  }

  const params = new URLSearchParams();
  Object.keys(req.query).forEach(k => { if (k !== 'path') params.append(k, req.query[k]); });
  const qs = params.toString();
  const url = 'https://open.tiktokapis.com' + path + (qs ? '?' + qs : '');

  try {
    const r = await fetch(url, { headers: { Authorization: auth } });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); }
    catch (e) { data = { error: { code: 'bad_response', message: text.slice(0, 500) } }; }
    // TikTok wraps errors in {error:{code,message,log_id}} with HTTP 200
    // in some cases and a real 4xx/5xx status in others — pass the actual
    // HTTP status through so the browser's own error handling (which
    // checks resp.error.code) sees whichever shape TikTok actually sent.
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: { code: 'proxy_error', message: e.message } });
  }
};
