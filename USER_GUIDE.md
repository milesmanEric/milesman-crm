# Miles Man CRM — User Guide

A plain-English walkthrough of how to actually use the CRM day to day. For technical/architecture details (data model, integrations, code structure), see [DOCUMENTATION.md](DOCUMENTATION.md) instead — this guide is written for the person using the tool, not the person maintaining the code.

---

## What this tool does

The CRM tracks everything about your clients, their trips, your suppliers, and your follow-up tasks — clients booking trips (flights, hotels, cruises, car rentals, tours, theme parks, trains, buses), often paid for partly or fully with miles/points.

Two things feed it automatically, with no action needed from you:
- **Book a Trip form** submissions (from the website) become client + trip records.
- **Contact Form** submissions (from the website) become client + lead records.

Both are checked automatically every 5 minutes as long as the CRM tab is open and Outlook is connected (see [Connecting Outlook](#connecting-outlook) below).

---

## Signing in

The first time you open the CRM on a new device/browser, you'll be asked to set a password for that device — it's stored only in that browser, never sent anywhere, and can't be recovered if you forget it (use **Forgot password?** on the login screen to reset it, which only resets the login itself, never your client data). After that, you'll stay signed in on that device until you click **Lock** (sidebar, near the bottom) or clear your browser data.

Worth knowing: this password screen keeps a casual visitor who stumbles on the CRM's web address from seeing your data at a glance, but it isn't real security — anyone who deliberately went looking could get around it. **Secure Sync** (see [Backing up your data](#backing-up-your-data)) is the one feature with actual server-verified access control.

**Change Password** (sidebar) lets you set a new one (asks for the current password first).

---

## The stat numbers at the top of every page are clickable

Every number in the row of boxes at the top of Dashboard, Clients, Trips, Suppliers, and Planner can be clicked. It opens a list of exactly which records add up to that number — click any row in that list to jump straight to that client, trip, supplier, or task. This is the fastest way to answer "which trips make up this revenue number" or "who are these upcoming clients."

On the Dashboard specifically, the **Total Revenue** and **Upcoming** tiles' lists only show trips that are actually Completed or Upcoming — a trip still in Planning, just Confirmed, or Cancelled won't clutter either list even if it has a future date or a dollar value on it. **Points deployed** totals only the actual miles/points redemptions recorded in trips' Booked Trip Details (the per-program amounts under Airline and each Hotel entry) — not the simple Points Used field on the basic trip form.

(On a Supplier's or Invoice's own detail screen, the numbers there instead scroll you down to the transaction table that's already shown below — no extra click needed to see the detail, it's already on the same screen.)

---

## Clients

**Adding a client**: Clients page → **+ Add Client**. Name and email are required. Everything else — phone, address, birthdate, citizenship/birth country, how they were referred, preferred airline/hotel/cruise line, and mileage/points balances for every airline, hotel, cruise line, car rental, and credit card program — is optional and can be filled in over time.

**Notes**: every client has a running note timeline. Add a note and tag it with a type (Email Sent, Email Received, Initial Call, Follow-up, General, Text Message Sent/Received, **Lead**, Mailchimp Email Sent, Facebook Message) so the Activity Report can filter on it later.

**Paying Client / Subscriber**: two checkboxes on the client record, useful for filtering your list down to real clients vs. newsletter-only contacts.

**Attachments**: paste Google Drive links directly, or use "Browse Google Drive" to pick a file without leaving the CRM.

**Referral Credits**: a section on the client record listing who they've referred, when, the $ amount, whether it's been used yet (checkbox), and — if it came from an actual sent certificate — a small `#000123` certificate number badge. Rows get added automatically when you send the "Referral Credit Earned" email (see [Emailing clients](#emailing-clients)), or add one yourself with **+ Add Referral Credit** for anything not sent through that flow (a manually-added row has no certificate number, since no certificate was actually issued for it). If a certificate went to more than one referrer at once, checking (or unchecking) "Used" on any one of their rows automatically checks/unchecks it on every other referrer's matching row too, since they all share the one physical certificate.

---

## Trips

**Adding a trip**: Trips page → **+ Add Trip**, or open a client and add a trip from there. Client and Destination are the only required fields.

The trip form has two parts:

1. **The basics** — origin/destination, dates, status (Planning/Confirmed/Completed/Cancelled), trip type, airline, hotel, cruise line, points used, cash paid, total value, booking reference, and a free-text Notes box. This is what shows up in the Trips list and on the Calendar.

2. **Booked Trip Details** — a more detailed, confirmed-booking recap, broken into the same categories as the public trip-request form: **Airline, Hotel, Cruise, Car Rental, Tours, Theme Park, Train, Bus.** Each one has its own **confirmation number** and **Price ($)** field, so you're not hunting through Notes for a locator code or trying to remember what each piece actually cost.
   - **Airline** and **Hotel** also let you record **miles/points redemptions** — pick the loyalty program (any airline, hotel, or credit card program) it came from, how many points/miles were used, and the cash cost that went with it (taxes/fees, or however you like to track it). This is important when a booking is paid for with a mix of sources — e.g. part Delta miles, part a transferred Amex points balance.
   - **Airline** supports **more than one flight segment** — click **+ Add Flight** for each additional leg (a connecting flight, or the return leg of a round trip). Each segment gets its own airline, flight number, origin, destination, depart date, depart/arrival time, and class of service. Confirmation Number, the points redemption(s), and Price stay shared across all segments, since one PNR and one price usually cover the whole booking. Remove a segment with the trash icon on that row.
   - **Hotel** supports **more than one hotel per trip** — click **+ Add Hotel** for each additional stay (useful for multi-city trips). Each hotel entry gets its own confirmation number, check-in date, number of nights, price, and its own miles/points program + amount. Remove a hotel entry with the trash icon on that row.
   - **Tours** likewise supports **more than one tour per trip** — click **+ Add Tour** for each additional booking. Each tour entry gets its own confirmation number, vendor (a dropdown covering every cruise line plus Tauck, Viator, and Get Your Guide — a tour is often a cruise line's own shore excursion), price, and description. Remove a tour entry with the trash icon on that row.
   - **Cruise** likewise supports **more than one cabin per booking** — click **+ Add Cabin** for each additional cabin on the same sailing (e.g. a family split across two cabins). Each cabin entry gets its own Cabin Type and People In Cabin; Confirmation Number, Cruise Line, Ship Name, Sailing Date, Nights, Departure Port, Loyalty Number, and Price stay shared across all cabins. Remove a cabin entry with the trash icon on that row.
   - Picking a **Cruise Line** automatically updates the Ship Name and every Cabin Type dropdown to that cruise line's real options.

None of this is required — fill in whatever you actually have confirmed. Leave a category blank if it doesn't apply to that trip.

---

## Suppliers

The Suppliers page (labeled "Suppliers" in the nav, called `vendors` internally) is your directory of airlines, hotels, cruise lines, car rental companies, and referral partners. Each supplier card shows how many trips and clients are linked to it and how much revenue has flowed through it, computed automatically from your trip records — you don't update these numbers by hand.

**Automatic supplier linking**: when a client's trip request names an airline, hotel brand, cruise line, car rental company, theme park, or tour vendor that matches an existing Supplier record by name, the client gets linked onto that supplier automatically, and that supplier becomes the trip's supplier if nothing else already claimed that slot. This only works for an **exact name match** — if a supplier is named "Delta Air Lines" in your list but a request says just "Delta," it won't connect automatically. Keep supplier names matching the option text on the intake form (e.g. "Delta," "Marriott," "Royal Caribbean") for this to work reliably.

**Revenue imports create a missing Supplier for you.** When you import a revenue report (either the "Clean & Import Revenue File"/"Import Revenue CSV" buttons or the automatic Outlook sync) and a row names a supplier that isn't in your Suppliers list yet, the CRM adds it automatically — before creating the client and/or trip for that row — instead of leaving the trip with no supplier. If the exact same supplier name shows up on more than one row in the same import, only one Supplier record gets created and every row links to it. If you'd already imported a trip before its supplier existed, re-running that same import will retroactively link the supplier onto the existing trip rather than creating a duplicate.

---

## Planner

Your follow-up task list, with the linked client's phone and email shown right in the table. Most tasks get created automatically — one per new trip request and one per new contact-form lead — but you can add your own anytime with **+ Add Task**.

Checking a task's box marks it done immediately, but the row stays put — checked, struck through — instead of vanishing right away, so you can still see what you just did and hit the trash icon on it if it was a mistake. It'll drop off the default (Open) view the next time you navigate away and back, or switch the filter to "Done" and back. The trash icon deletes a task outright, any time.

---

## Calendar

A month view with every trip painted across its travel dates. Click into a day to see (and add) trips landing on that date. A trip marked **Cancelled** never shows here — not on the month grid, not in a day's trip list — even if it has dates that would otherwise land in view.

---

## Reports

Three tabs:
- **Activity Report** — every note logged across every client, filterable by date range, note type, and client. Export to CSV.
- **By Invoice #** — trips grouped by booking/invoice reference, filterable by date range, supplier, and client. Export to CSV. (This avoids double-counting revenue when a booking has multiple line items sharing the same reference.)

  The date range has a **Filter By** choice: **Travel Date** or **Invoice Date**. These can be genuinely different dates — a trip might get booked in June for August travel — so if a trip you're expecting isn't showing up for a date range, try switching which date you're filtering by before assuming something's wrong. Invoice Date only gets filled in automatically for revenue-imported trips; you can also set it by hand on any trip's Invoice Date field.

  **Trips imported before this feature existed have no Invoice Date at all** — filtering those by Invoice Date will show nothing for them until you fix that. Re-run the exact same "Clean & Import Revenue File" / "Import Revenue CSV" import on the same source file: it recognizes the trips it already created and fills in the missing Invoice Date on them (and links a supplier too, if one's since been added) instead of creating duplicates.
- **Unused Certificates** — every referral bonus certificate that hasn't been marked "Used" yet, across every client, with its certificate number, all the referrers it names, who they referred, the date it was issued, and the $100 amount. Optionally filter down to one referrer. Export to CSV. Click a row to jump to the first referrer's client record. This is the place to check before a certificate slips through the cracks — once you mark it Used on any of its referrers' records, it drops off this list (see [Clients](#clients)).

---

## Emailing clients

Three different tools, depending on what you need:

- **Email** (the mail-merge tool) — quick canned messages: Welcome New Client, General Follow-Up, Trip Confirmation, Thank You & Referral, or **Referral Credit Earned**. Pick a client, preview with their name/email filled in, send.
  - **Referral Credit Earned** works differently from the others: pick one or more **referrers** (the checkbox list replaces the usual single-client dropdown) and one or more **referred clients**. The email greets all the referrers together ("Hi Aaron and Alice,"), mentions all the referred people in the body, goes out to every referrer's email at once, and adds a row to each referrer's **Referral Credits** section (see [Clients](#clients)) when you click Send or Log as Note. You can't pick the same person as both a referrer and someone they referred — you'll get a warning instead of a nonsensical email.
    - Every send generates exactly **one $100 certificate**, no matter how many referrers or referred people you picked — with the Miles Man logo, all the referrers' names on the "issued to" line together (e.g. "Aaron Referrer and Alice Referrer"), a unique certificate number that only ever goes up, and the redemption terms (good for $100 off booking fees/trip cost; a trip means a unique booking record number; no value once redeemed; non-transferable but usable if you book a trip for someone else with your own miles/points/credit card). The certificate number only gets assigned once you actually click Send or Log — previewing or changing your selections doesn't burn a number.
    - Clicking **Open in Outlook** also downloads a PDF of the certificate(s) and copies the certificate itself to your clipboard. Paste it into the email body (Ctrl/Cmd+V) like usual, and **attach the downloaded PDF yourself** — Outlook (or any email app) can't auto-attach a file from a `mailto:` link, so this is the one email in the CRM where you need that one extra manual step.
- **Email Quote** — for building a real cruise pricing quote to send a client, with cabin options and pricing laid out in a styled email. Ready-made polished templates now cover **Virgin Voyages, Princess, Royal Caribbean, Ritz Carlton Yachts, Seabourn, Explora Journeys, and Windstar** (Ritz Carlton Yachts, Seabourn, and Explora Journeys are all-inclusive ultra-luxury lines, so their "what's included" lists reflect that — all-suite, dining, beverages, gratuities, WiFi; Windstar isn't all-inclusive, so it lists dining/entertainment/stateroom like Royal Caribbean instead). Every sent quote also gets a PDF copy saved automatically to a "Miles Man Quotes" folder in Google Drive, named `<client>.<cruise line>.<sailing date>.pdf`.
- **Email Itinerary** — pick a client and one of their **actual booked trips**, and it builds a nicely formatted recap email straight from whatever's on that trip record (dates, flight/hotel/cruise details, car rental, tours, theme park, train, bus, confirmation info, points/cash/value, and your trip notes). Any section the trip doesn't have data for is simply left out — it never shows an empty "Hotel Details" box for a flight-only trip.

All three work the same way at send time: the email gets copied to your clipboard (since a plain `mailto:` link can't carry formatting) and Outlook opens addressed to the client — paste (Ctrl/Cmd+V) into the body and send. A note gets logged on the client's record automatically.

---

## Connecting Outlook

Email menu → **Sync Outlook Emails**. This is a one-time login (until you sign out or the token expires) that unlocks:
- Logging sent/received emails to each client's notes automatically.
- Automatically importing Book a Trip form submissions and Contact Form leads every 5 minutes.

**This only runs while the CRM tab is open in your browser** — there's no server running these checks in the background, so if you close the tab, imports pause until you reopen it.

If something seems stuck (Outlook not syncing, an import that should have happened didn't), try **Reset Outlook Login** and reconnect.

---

## Backing up your data

Everything lives in your browser only — closing the tab doesn't lose data, but clearing your browser's data, or a browser crash with corrupted storage, would. The File menu has two ways to back up/restore against the same Google Drive file — either works, but they're not equally secure:

- **Secure Sync: Save / Load** (top of the File menu) — the recommended option. Checks your identity against Google's own servers before touching anything.
- **Backup to Google Drive / Restore from Google Drive** (grouped under "Manual Fallback (not identity-verified)" below it) — still fully functional, kept as a fallback for now.

Use whichever is set up and working for you regularly (or after any significant batch of changes) as your real safety net — the "Restore"/"Load" side of either one pulls the latest backup down if you ever need to recover, or if you're picking up on a different computer.

If you back up from two devices without restoring in between, the CRM will warn you and block the upload rather than silently overwriting the other device's newer data — restore first, then back up again.

---

## Mailchimp

If you send a newsletter/campaign through Mailchimp, **Sync Mailchimp Activity** checks which of your clients actually received the most recent campaign and logs it to their notes automatically. **Log Mailchimp Campaign** is the manual fallback if you'd rather just note that a campaign went out without connecting to Mailchimp's API.

---

## When something goes wrong

Every import/sync feature writes to a hidden **Debug Log** as it runs — request counts, warnings, per-client match results, errors. This is the first place to check when a sync "did nothing" or an import skipped something you expected to see. Ask whoever maintains the CRM's code how to open it if you can't find it.
