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

The first time you open the CRM on a new device/browser, you'll be asked to set a password for that device — it's stored only in that browser, never sent anywhere, and can't be recovered if you forget it (use **Forgot password?** on the login screen to reset it, which only resets the login itself, never your client data). After that, you'll stay signed in on that device until you click **Lock** or **Close** (sidebar, near the bottom) or clear your browser data.

**Close** does everything **Lock** does (ends the session, asks for your password again next time), plus explicitly saves everything first — your local data, and a quiet backup to Google Drive if it's connected — before locking. Use it when you're wrapping up for the day and want to be sure everything's saved; use **Lock** for a quick "step away from the desk" that doesn't need the extra save.

Worth knowing: this password screen keeps a casual visitor who stumbles on the CRM's web address from seeing your data at a glance, but it isn't real security — anyone who deliberately went looking could get around it. **Secure Sync** (see [Backing up your data](#backing-up-your-data)) is the one feature with actual server-verified access control.

**Change Password** (sidebar) lets you set a new one (asks for the current password first).

---

## The stat numbers at the top of every page are clickable

Every number in the row of boxes at the top of Dashboard, Clients, Trips, Suppliers, and Planner can be clicked. It opens a list of exactly which records add up to that number — click any row in that list to jump straight to that client, trip, supplier, or task. This is the fastest way to answer "which trips make up this revenue number" or "who are these upcoming clients."

On the Dashboard specifically, the **Total Revenue** and **Upcoming** tiles' lists only show trips that are actually Completed or Upcoming — a trip still in Planning, just Confirmed, or Cancelled won't clutter either list even if it has a future date or a dollar value on it. **Points deployed** totals only the actual miles/points redemptions recorded in trips' Booked Trip Details (the per-program amounts under every section's Points Used block — Airline, Cruise, Car Rental, Tours, Theme Park, Train, Bus, and each individual Hotel entry's own Points Used block) — not the simple Points Used field on the basic trip form.

The Dashboard also has a **Planner tasks — today & overdue** card: your 10 most pressing open tasks (whatever's due today or already past due, most-overdue first), each showing its linked client(s) and due date. Click a task to open it, click a client name to open their record instead (a task linked to more than one client lists each of them separately), or hit **View all** to jump to the full Planner list filtered the same way.

(On a Supplier's or Invoice's own detail screen, the numbers there instead scroll you down to the transaction table that's already shown below — no extra click needed to see the detail, it's already on the same screen.)

---

## Clicking outside a popup window won't lose your changes

Any popup window (Edit Client, Edit Task, Add Trip, etc.) stays open if you click the dimmed area outside it — that used to close the window immediately, discarding anything you'd typed. Close it on purpose instead, with its **X** button or **Cancel**.

---

## Clients

**Adding a client**: Clients page → **+ Add Client**. Name and email are required. Everything else — phone, address, birthdate, citizenship/birth country, how they were referred, preferred airline/hotel/cruise line, mileage/points balances for every airline, hotel, cruise line, car rental, and credit card program, and which airline- and hotel-branded credit cards they hold — is optional and can be filled in over time.

**If an existing client submits the Book a Trip form again** (website submission, imported via CSV or the automatic Outlook sync), any mileage/points balance they filled in on that new submission replaces what's already on their record for that program — points balances change constantly, so the newest number they typed in is trusted over whatever was there before. If they left a program blank on that particular submission, their existing balance for it is left alone rather than getting cleared out.

Each mileage/points section (Mileage Balances, Hotel Point Balances, Cruise Line Loyalty, Car Rental Loyalty, Credit Card Point Balances) can be collapsed — click the section name (the little arrow flips to show open/closed) to hide or show its list of programs. A section that already has a balance set in it opens expanded automatically; an empty one starts collapsed, so the form isn't an overwhelming wall of fields for a client you haven't filled everything in for yet. Same behavior on the trip form's copy of these sections.

**Airline/Hotel Credit Cards**: two checklists on the client record — check off any co-branded cards the client actually holds (e.g. United Explorer Card, Delta SkyMiles Reserve, Marriott Bonvoy Boundless, Hilton Honors Aspire), grouped by airline/hotel. This is separate from the Credit Card Point Balances section above it — that one's for general travel rewards cards (Chase Sapphire, Amex Platinum, etc.) with a points balance; this is just a plain "do they have this specific airline/hotel card, yes or no." The same two checklists also show up on the trip form, alongside the client's other loyalty balances, so you can check them without leaving the trip you're working on.

**Notes**: every client has a running note timeline. Add a note and tag it with a type (Email Sent, Email Received, Initial Call, Follow-up, Post-Trip Follow-up, General, Text Message Sent/Received, **Lead**, Mailchimp Email Sent, Facebook Message) so the Activity Report can filter on it later.

**Tasks**: a client's own Planner tasks show right on their record — title, due date, and Open/Done status — with **+ Add Task** to add a new one linked to them. This includes tasks where the client is only one of several linked (see [Planner](#planner)), not just tasks where they're the primary contact. Clicking a task opens the full task editor (same one Planner uses), so you can change its due date, description, or anything else without leaving the client record.

**Paying Client / Subscriber**: two checkboxes on the client record, useful for filtering your list down to real clients vs. newsletter-only contacts.

**Attachments**: paste Google Drive links directly, or use "Browse Google Drive" to pick a file without leaving the CRM.

**Referral Credits**: a section on the client record listing who they've referred, when, the $ amount, whether it's been used yet (checkbox), and — if it came from an actual sent certificate — a small `#000123` certificate number badge. Rows get added automatically when you send the "Referral Credit Earned" email (see [Emailing clients](#emailing-clients)), or add one yourself with **+ Add Referral Credit** for anything not sent through that flow (a manually-added row has no certificate number, since no certificate was actually issued for it). If a certificate went to more than one referrer at once, checking (or unchecking) "Used" on any one of their rows automatically checks/unchecks it on every other referrer's matching row too, since they all share the one physical certificate.

---

## Trips

**Adding a trip**: Trips page → **+ Add Trip**, or open a client and add a trip from there. Client and Destination are the only required fields.

**Every trip on the Trips page starts collapsed** as a one-line summary (client, destination, dates) — click it to expand and see the full row (flight, status, points, value, product, supplier, invoice #, edit/delete). Click it again to collapse it back. The ▾/▸ arrow on the left shows which state it's in. The **Trips** stat above the table counts these summary lines, not raw trip records — so it won't go up just because one trip happens to have several linked legs.

**Status filter** now lets you check off any combination of statuses instead of picking just one — click the status button to open the checklist. It defaults to everything except **Cancelled**, so cancelled trips stay out of view until you specifically ask to see them.

**Linked Trips**: if a trip is really one leg of a bigger multi-city vacation booked as separate trip records (say, a NYC leg and a Paris leg), check the other leg(s) off in the **Linked Trips** list. Linking works both ways automatically — check "Paris Leg" from the NYC trip's form, and the Paris trip's own Linked Trips list picks up the NYC trip too, no need to set it from both sides. Unchecking removes the link from both as well.

Once linked, the Trips page shows those legs grouped together under one summary line (client name, every leg's destination in order, the overall date range, and a trip count) instead of scattered among all your other unrelated trips — expanding it reveals each leg as its own indented row rather than just the one trip's own row. Search, status filter, and column sorting all still work as usual — a group just moves as a unit to wherever its first leg lands under the current sort.

The trip form has two parts:

1. **The basics** — origin/destination, dates, status (Planning/Confirmed/Completed/Cancelled), trip type, airline, hotel, cruise line, points used, cash paid, total value, Invoice Number, and a free-text Notes box. This is what shows up in the Trips list and on the Calendar.

2. **Booked Trip Details** — starts with an optional **Trip Name** (e.g. "Smith Family Alaska Cruise") — purely a friendly label, used only to personalize the greeting line of the Email Itinerary ("Here's your itinerary for Smith Family Alaska Cruise!") instead of the plain destination. Below that, a more detailed, confirmed-booking recap broken into the same categories as the public trip-request form: **Airline, Hotel, Cruise, Car Rental, Tours, Theme Park, Train, Bus.** Each one has its own **confirmation number**, **Price ($)**, and **Notes** field (Tours uses its existing Description field for this instead of a separate Notes box), so you're not hunting through the trip's main Notes box for a locator code, a cost, or a detail specific to that one piece of the booking.
   - Every section has a **Points Used** block — click **+ Add Points Used** for each miles/points redemption that went into that piece of the booking. Add as many rows as you need. Each row has a program dropdown (every airline, hotel, and credit card option in one combined list), how many points/miles were used, and the cash cost that went with it (taxes/fees, or however you like to track it). This is important when a booking is paid for with a mix of sources — e.g. part Delta miles, part a transferred Amex points balance. Remove a row with the trash icon on it. On every section except Hotel, this list is shared for the whole section (same as its Confirmation Number/Price/Notes); **Hotel** is the one exception — since each hotel stay is already its own line item, each hotel entry gets its **own** Points Used list instead of one shared across every hotel on the trip (see below).
   - **Airline** is a list of **Records** — click **+ Add Record** for each separate confirmation/PNR. Most trips only need one, but if the group isn't all ticketed together (say, two passengers on an award-ticket record and two more on a separate revenue-fare record), give each its own Record instead of trying to force everyone under one confirmation number. Each Record has its own Record Number, Number of Passengers (1-9), Passengers (a multi-select of every client — hold Ctrl/Cmd to pick more than one), Non-Stop Flights Only, Price, Notes, its own **Flights** list (click **+ Add Flight** for each leg — a connecting flight or the return leg of a round trip; each flight gets its own airline, flight number, origin, destination, depart date, depart/arrival time, and class of service), and its own **Points Used** list. Number of Passengers and Passengers need to agree **within that Record**: pick 2 passengers but only select 1 name and you'll see a warning right there, and Save Trip will refuse to save until every Record's counts match. Remove a Record, a flight, or a points row with the trash icon on it.
   - **Hotel** supports **more than one hotel per trip** — click **+ Add Hotel** for each additional stay (useful for multi-city trips). Each hotel entry gets its own confirmation number, check-in date, number of nights, price, notes, and its own Points Used list (add as many redemption rows as that stay needs). Remove a hotel entry with the trash icon on that row.
   - **Tours** likewise supports **more than one tour per trip** — click **+ Add Tour** for each additional booking. Each tour entry gets its own confirmation number, vendor (a dropdown covering every cruise line plus Tauck, Viator, and Get Your Guide — a tour is often a cruise line's own shore excursion), price, and description. Remove a tour entry with the trash icon on that row.
   - **Cruise** likewise supports **more than one cabin per booking** — click **+ Add Cabin** for each additional cabin on the same sailing (e.g. a family split across two cabins). Each cabin entry gets its own Cabin Type, People In Cabin, and Cabin Number; Confirmation Number, Cruise Line, Ship Name, Sailing Date, Return Date, Nights, Departure Port, Return Port, Loyalty Number, Price, and Notes stay shared across all cabins. Remove a cabin entry with the trash icon on that row.
   - Picking a **Cruise Line** automatically updates the Ship Name and every Cabin Type dropdown to that cruise line's real options.
   - **Train** and **Bus** each have an optional **Logo URL** field — paste an image URL and it shows up next to that section in the Email Itinerary. Airline, Hotel, Cruise Line, and Car Rental sections show a logo automatically (whenever one's available for that specific provider — not every brand has one), since those pick from a fixed list; Train/Bus don't, since you just type in whatever city names you want there.

None of this is required — fill in whatever you actually have confirmed. Leave a category blank if it doesn't apply to that trip.

At the very bottom, a **Summary** section totals everything up live as you fill the form in: every points/miles redemption across every category, added up by program, and a **Total Cash Paid** figure (every Price field plus every points redemption's cash cost, all added together). Nothing to click — it just stays current as you type. If the trip has no Supplier linked, the Summary also shows the Invoice Number — once a Supplier is picked, the invoice is assumed to have gone to them instead, so it drops off this client-facing summary.

---

## Suppliers

The Suppliers page (labeled "Suppliers" in the nav, called `vendors` internally) is your directory of airlines, hotels, cruise lines, car rental companies, and referral partners. Each supplier card shows how many trips and clients are linked to it and how much revenue has flowed through it, computed automatically from your trip records — you don't update these numbers by hand.

**Automatic supplier linking**: when a client's trip request names an airline, hotel brand, cruise line, car rental company, theme park, or tour vendor that matches an existing Supplier record by name, the client gets linked onto that supplier automatically, and that supplier becomes the trip's supplier if nothing else already claimed that slot. This only works for an **exact name match** — if a supplier is named "Delta Air Lines" in your list but a request says just "Delta," it won't connect automatically. Keep supplier names matching the option text on the intake form (e.g. "Delta," "Marriott," "Royal Caribbean") for this to work reliably.

**Revenue imports create a missing Supplier for you.** When you import a revenue report (either the "Clean & Import Revenue File"/"Import Revenue CSV" buttons or the automatic Outlook sync) and a row names a supplier that isn't in your Suppliers list yet, the CRM adds it automatically — before creating the client and/or trip for that row — instead of leaving the trip with no supplier. If the exact same supplier name shows up on more than one row in the same import, only one Supplier record gets created and every row links to it. If you'd already imported a trip before its supplier existed, re-running that same import will retroactively link the supplier onto the existing trip rather than creating a duplicate.

---

## Planner

Your follow-up task list, with the linked client's phone and email shown right in the table. Most tasks get created automatically — one per new trip request and one per new contact-form lead — but you can add your own anytime with **+ Add Task**.

**A task can link to more than one client.** The task form's **Linked Client** dropdown is the primary contact; check any others under **Additional Clients** below it. The Client column then lists everyone linked, each one clickable to jump to their record, and the task shows up on every one of those clients' own task lists — not just the primary's. The Email field auto-fills with every linked client's email (comma-separated, so one click on the mail icon reaches all of them at once) — it re-fills whenever you change who's linked, and you can still type over it by hand if you need something different. Marking the task done logs a completion note on every linked client's record, not just the primary's.

Checking a task's box marks it done immediately, but the row stays put — checked, struck through — instead of vanishing right away, so you can still see what you just did and hit the trash icon on it if it was a mistake. It'll drop off the default (Open) view the next time you navigate away and back, or switch the filter to "Done" and back. The trash icon deletes a task outright, any time.

---

## Calendar

A month view with every trip painted across its travel dates. Click into a day to see (and add) trips landing on that date. A trip marked **Cancelled** never shows here — not on the month grid, not in a day's trip list — even if it has dates that would otherwise land in view.

---

## Reports

Four tabs, each exportable to **CSV** or **PDF**:
- **Activity Report** — every note logged across every client, filterable by date range, note type, and client.
- **By Invoice #** — trips grouped by booking/invoice reference, filterable by date range, supplier, and client. (This avoids double-counting revenue when a booking has multiple line items sharing the same reference.)

  The date range has a **Filter By** choice: **Travel Date** or **Invoice Date**. These can be genuinely different dates — a trip might get booked in June for August travel — so if a trip you're expecting isn't showing up for a date range, try switching which date you're filtering by before assuming something's wrong. Invoice Date only gets filled in automatically for revenue-imported trips; you can also set it by hand on any trip's Invoice Date field.

  **Trips imported before this feature existed have no Invoice Date at all** — filtering those by Invoice Date will show nothing for them until you fix that. Re-run the exact same "Clean & Import Revenue File" / "Import Revenue CSV" import on the same source file: it recognizes the trips it already created and fills in the missing Invoice Date on them (and links a supplier too, if one's since been added) instead of creating duplicates.
- **Unused Certificates** — every referral bonus certificate that hasn't been marked "Used" yet, across every client, with its certificate number, all the referrers it names, who they referred, the date it was issued, and the $100 amount. Optionally filter down to one referrer. Click a row to jump to the first referrer's client record. This is the place to check before a certificate slips through the cracks — once you mark it Used on any of its referrers' records, it drops off this list (see [Clients](#clients)).
- **Combined Points** — check off any number of clients traveling together, hit Run Report, and it lays out every airline, hotel, cruise line, car rental, and credit card program at least one of them has a balance in — one column per traveler, plus a **Combined Total** column adding them all up. This is the "do we have enough between us" report: pick the travelers on a trip, and see right away whether their combined Delta miles or Marriott points actually clear what's needed, instead of checking each person's record separately and adding it up by hand. Only programs where the combined total is above zero show up.

**Export PDF** builds a clean, printable version of whatever the report currently shows (same filters, same rows) and downloads it as a PDF — handy for emailing a report to someone or keeping an offline copy, versus **Export CSV** for pulling the data into a spreadsheet.

---

## Emailing clients

Three different tools, depending on what you need:

- **Email** (the mail-merge tool) — quick canned messages: Welcome New Client, General Follow-Up, Trip Confirmation, Thank You & Referral, or **Referral Credit Earned**. Pick a client, preview with their name/email filled in, send.
  - **Referral Credit Earned** works differently from the others: pick one or more **referrers** (the checkbox list replaces the usual single-client dropdown) and one or more **referred clients**. The email greets all the referrers together ("Hi Aaron and Alice,"), mentions all the referred people in the body, goes out to every referrer's email at once, and adds a row to each referrer's **Referral Credits** section (see [Clients](#clients)) when you click Send or Log as Note. You can't pick the same person as both a referrer and someone they referred — you'll get a warning instead of a nonsensical email.
    - Every send generates exactly **one $100 certificate**, no matter how many referrers or referred people you picked — with the Miles Man logo, all the referrers' names on the "issued to" line together (e.g. "Aaron Referrer and Alice Referrer"), a unique certificate number that only ever goes up, and the redemption terms (good for $100 off booking fees/trip cost; a trip means a unique booking record number; no value once redeemed; non-transferable but usable if you book a trip for someone else with your own miles/points/credit card). The certificate number only gets assigned once you actually click Send or Log — previewing or changing your selections doesn't burn a number.
    - Clicking **Open in Outlook** also downloads a PDF of the certificate(s) and copies the certificate itself to your clipboard. Paste it into the email body (Ctrl/Cmd+V) like usual, and **attach the downloaded PDF yourself** — Outlook (or any email app) can't auto-attach a file from a `mailto:` link, so this is the one email in the CRM where you need that one extra manual step.
- **Email Quote** — for building a real cruise pricing quote to send a client, with cabin options and pricing laid out in a styled email. Ready-made polished templates now cover **Virgin Voyages, Princess, Royal Caribbean, Ritz Carlton Yachts, Seabourn, Explora Journeys, and Windstar** (Ritz Carlton Yachts, Seabourn, and Explora Journeys are all-inclusive ultra-luxury lines, so their "what's included" lists reflect that — all-suite, dining, beverages, gratuities, WiFi; Windstar isn't all-inclusive, so it lists dining/entertainment/stateroom like Royal Caribbean instead). Every sent quote also gets a PDF copy saved automatically to a "Miles Man Quotes" folder in Google Drive, named `<client>.<cruise line>.<sailing date>.pdf`.
- **Email Itinerary** — pick a client and one of their **actual booked trips**, and it builds a nicely formatted recap email straight from whatever's on that trip record: dates, every passenger linked to the trip, flight/hotel/cruise details, car rental, tours, theme park, train, bus, confirmation info, points used, total trip value, and your trip notes. Flight, hotel, and cruise details pull from whatever you filled in under **Booked Trip Details** (each Airline Record gets its own box, listing that record's Record Number, passengers, and flights; each hotel stay and each cruise cabin gets its own line too) — it only falls back to the simpler basics-tab fields (Airline, Hotel, Cruise Line) if Booked Trip Details was never filled in for that piece at all. **Points Used** and **Total Trip Value** always come from Booked Trip Details too (every category's own Points Used entries and Price field, added up) — never from a revenue import, so what the client sees always matches what you entered by hand for that booking rather than whatever the import happened to bring in. There's no "Amount Paid" line at all. Any section the trip doesn't have data for is simply left out — it never shows an empty "Hotel Details" box for a flight-only trip. If the trip has any **Linked Trips** (see [Trips](#trips)), they show up right after the destination/dates as "Also Part of This Vacation," so a client booked on a multi-city itinerary sees every leg in one email, not just the one you happened to pick. Every sent itinerary also gets a PDF copy saved automatically to a "Miles Man Itineraries" folder in Google Drive (a separate folder from quotes), named `<client>.<destination>.<depart date>.pdf`.

All three work the same way at send time: the email gets copied to your clipboard (since a plain `mailto:` link can't carry formatting) and Outlook opens addressed to the client — paste (Ctrl/Cmd+V) into the body and send. A note gets logged on the client's record automatically.

---

## Assistant

A chat bubble in the bottom-right corner, on every page. Click it to open a small chat panel and just type what you want — it can look things up ("find clients named Sarah," "show me trips to Cancun departing next month") or make changes for you ("add a note to Sarah's record that she called about upgrading her cabin," "create a follow-up task for tomorrow to confirm final payment").

It can only do a fixed set of things: find clients, find trips, add a client note, create a Planner task, and create a new client. It can't edit your source code or do anything outside those actions. Every change it makes goes through the same **Undo** button in the sidebar as anything else you do by hand — if it gets something wrong, just hit Undo. The conversation itself isn't saved anywhere; closing the tab or refreshing starts a fresh chat.

---

## Bookmarks

A place to save links to sites you use often — airline sites, hotel booking tools, visa/documentation portals, currency or weather lookups, whatever. Bookmarks are grouped into two sections, **Travel Agent** and **Consumer**, and within each, by category (Airline, Hotel, Cruise Line, Car Rental, etc.) — so agent-portal logins and regular booking sites don't get mixed together, and everything's easy to scan by type.

**+ Add Bookmark**, give it a name and a URL (you can skip the `https://` — it's added automatically), and optionally a category, an audience (Consumer or Travel Agent — defaults to Consumer if you skip it), and a note. Click the name to open the link in a new tab; the pencil/trash icons edit or delete it.

Click **+ Load Starter Bookmarks** to add a pre-built set of consumer booking-site links and travel-advisor/agent-portal login links for common airlines, hotels, car rental companies, cruise lines, tour operators, and theme parks — each one already tagged with the right category and audience. It won't add duplicates if you click it again later. A few entries are noted as unverified where the exact portal URL couldn't be confirmed — double-check those before relying on them.

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
