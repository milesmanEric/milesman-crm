# Miles Man CRM — Android app

A Trusted Web Activity (TWA) that opens the hosted CRM (https://milesmaneric.github.io/milesman-crm/) full screen in Chrome.
A TWA is used instead of an embedded WebView because Google blocks sign-in inside WebViews, and the CRM needs Google (Drive) and Microsoft (Outlook) sign-in.
The site also ships a web manifest + service worker, so it is installable straight from Chrome ("Add to Home screen") with no APK at all.

## Get the APK
Run the **Build Android app** GitHub Action (Actions tab) and download `miles-man-crm-android` → `app-debug.apk`.
Sideload it (allow "install unknown apps"). It is debug-signed; Play Store publishing needs a release keystore and
a `/.well-known/assetlinks.json` on the domain (GitHub Pages project sites can't serve that path), which is also what hides the Chrome address bar.
Without it, the app still works but shows a thin URL bar at the top.

Local build: `cd android && gradle assembleDebug` (needs JDK 17 + Android SDK).
