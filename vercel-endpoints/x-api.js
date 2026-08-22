// Miles Man CRM — X (Twitter) API v2 CORS relay.
//
// WHERE THIS GOES: copy to api/x-api.js in the milesman-auth Vercel project
// (C:\Users\ericl\milesman-auth-fix), then `vercel --prod`. Same ?path=
// shape as the existing api/wordpress-stats.js and api/facebook-graph.js
// relays, so it behaves like the rest of the proxy.
//
// No secret lives here — the browser sends its own X user access token
// through untouched. This exists purely because api.x.com doesn't send
// CORS headers a browser will accept.
//
// COST: every call through here is a billed X API read (~$0.010 for a
// user-scoped read). The CRM only calls this once per calendar day via its
// cached snapshot; if you see it firing more often than that, something has
// gone wrong with the cache in index.html's xFollowerSnapshot().

const ALLOWED_PREFIXES = ['/2/users/me', '/2/users/', '/2/tweets'];

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

  // Only relay read endpoints this app actually uses — keeps a leaked or
  // borrowed token from being able to drive arbitrary (billable, or
  // write) X API calls through this proxy.
  if (!ALLOWED_PREFIXES.some(p => path.startsWith(p))) {
    res.status(403).json({ error: 'path_not_allowed', error_description: 'This relay only serves X read endpoints used by the CRM.' });
    return;
  }

  // Everything except ?path= is forwarded to X as-is (e.g. user.fields=...).
  const params = new URLSearchParams();
  Object.keys(req.query).forEach(k => { if (k !== 'path') params.append(k, req.query[k]); });
  const qs = params.toString();
  const url = 'https://api.x.com' + path + (qs ? '?' + qs : '');

  try {
    const r = await fetch(url, { headers: { Authorization: auth } });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); }
    catch (e) { data = { error: 'bad_response', error_description: text.slice(0, 500) }; }
    // Pass X's status through rather than flattening to 200 — a 429 is
    // rate limiting, a 403 usually means the app lacks the scope or no
    // payment method is on file, and the CRM surfaces those messages
    // verbatim so the real cause is visible.
    res.status(r.ok ? 200 : r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: 'proxy_error', error_description: e.message });
  }
};
