<?php
/**
 * Miles Man CRM — Jetpack auto-subscribe endpoint.
 *
 * WHY THIS EXISTS: Jetpack/WordPress.com has no public, documented REST API
 * for adding an individual email as a subscriber — the only officially
 * supported way is a manual CSV upload in WP Admin (Jetpack → Newsletter →
 * Subscribers → Add Subscribers → Upload CSV). This file adds one small
 * custom REST route directly on this site so the CRM (a separate app
 * hosted on GitHub Pages) can register a new subscriber automatically
 * whenever someone is marked "Subscriber" in the CRM.
 *
 * It calls Jetpack_Subscriptions::subscribe(), the same internal method
 * Jetpack's own subscribe widget/block uses. That's not a documented public
 * API, so if a future Jetpack update renames or removes it, this will start
 * returning "jetpack_unavailable" errors — check this file first if that
 * happens.
 *
 * Registering the subscription does NOT make it active immediately —
 * Jetpack still emails the address its own confirmation link, and the
 * person has to click it, exactly like using the subscribe widget by hand.
 *
 * ── INSTALLATION ──────────────────────────────────────────────────────────
 * 1. Easiest: install the free "Code Snippets" plugin, create a new snippet,
 *    paste everything below the opening "<?php" line, set it to run
 *    "Only in administration area? No" (run everywhere), and activate it.
 *    Alternative: save this whole file as
 *    wp-content/mu-plugins/jetpack-subscribe-endpoint.php on the server
 *    (mu-plugins load automatically, no activation step, but that folder
 *    isn't reachable through Code Snippets — needs FTP/SFTP or a file
 *    manager plugin).
 * 2. In WP Admin, go to Users → your profile → Application Passwords
 *    (near the bottom of the page) and create one named e.g. "Miles Man CRM".
 *    Copy the generated password immediately — it's shown only once.
 * 3. In the CRM's Analytics tab, under "WordPress.com / Jetpack Stats" →
 *    "Auto-Subscribe New Clients" → "Set Up Auto-Subscribe", enter the
 *    WordPress username the Application Password belongs to, and paste the
 *    Application Password (not your normal login password).
 * 4. Requires HTTPS (already true for themilesman.com) — WordPress core
 *    disables Application Passwords over plain HTTP.
 * ────────────────────────────────────────────────────────────────────────
 */

add_action('rest_api_init', function () {
    register_rest_route('milesman/v1', '/subscribers', array(
        'methods'             => 'POST',
        'callback'            => 'milesman_crm_add_jetpack_subscriber',
        'permission_callback' => function () {
            // Application Password auth resolves the current user the same
            // way a normal cookie-authenticated request would — this just
            // requires that resolved user to be an administrator.
            return current_user_can('manage_options');
        },
    ));
});

function milesman_crm_add_jetpack_subscriber(WP_REST_Request $request)
{
    $email = sanitize_email((string) $request->get_param('email'));

    if (!$email || !is_email($email)) {
        return new WP_Error('invalid_email', 'A valid email address is required.', array('status' => 400));
    }

    if (!class_exists('Jetpack_Subscriptions') || !method_exists('Jetpack_Subscriptions', 'subscribe')) {
        return new WP_Error(
            'jetpack_unavailable',
            'Jetpack Subscriptions isn\'t active on this site (module missing, or Jetpack changed its internals — see the comment at the top of jetpack-subscribe-endpoint.php).',
            array('status' => 500)
        );
    }

    $result = Jetpack_Subscriptions::subscribe($email);

    // subscribe() returns a WP_Error on failure (e.g. malformed address) in
    // the versions of Jetpack this was tested against — pass that through
    // as-is rather than masking it with a generic message.
    if (is_wp_error($result)) {
        return $result;
    }

    return rest_ensure_response(array(
        'success' => true,
        'email'   => $email,
    ));
}

/**
 * The CRM at milesmaneric.github.io is a different origin than
 * themilesman.com, so the browser needs this route to explicitly allow
 * cross-origin requests — WordPress's default REST CORS handling doesn't
 * cover custom routes called from another domain.
 */
add_filter('rest_pre_serve_request', function ($served, $result, $request) {
    if (strpos($request->get_route(), '/milesman/v1/') === 0) {
        header('Access-Control-Allow-Origin: https://milesmaneric.github.io');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
    }
    return $served;
}, 10, 3);

add_action('rest_api_init', function () {
    // Browsers send a preflight OPTIONS request before the real POST
    // (because it carries an Authorization header) — WordPress has no
    // built-in route for that, so this answers it directly rather than
    // letting it 404.
    add_action('init', function () {
        if (
            isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS'
            && isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], '/wp-json/milesman/v1/') !== false
        ) {
            header('Access-Control-Allow-Origin: https://milesmaneric.github.io');
            header('Access-Control-Allow-Methods: POST, OPTIONS');
            header('Access-Control-Allow-Headers: Authorization, Content-Type');
            status_header(200);
            exit;
        }
    }, 0);
});
