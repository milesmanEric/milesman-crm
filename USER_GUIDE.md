# Miles Man CRM — User Guide

A plain-English walkthrough of how to actually use the CRM day to day. For technical/architecture details (data model, integrations, code structure), see [DOCUMENTATION.md](DOCUMENTATION.md) instead — this guide is written for the person using the tool, not the person maintaining the code.

---

## What this tool does

The CRM tracks everything about your clients, their trips, your suppliers, and your follow-up tasks — clients booking trips (flights, hotels, cruises, car rentals, tours, theme parks, trains, buses), often paid for partly or fully with miles/points.

Two things feed it automatically, with no action needed from you:
- **Book a Trip form** submissions (from the website) become client + trip records.
- **Contact Form** submissions (from the website) become client + lead records.

Both are checked automatically every 5 minutes as long as the CRM tab is open and Outlook is connected (see [Connecting Outlook](#connecting-outlook) below).

**Picking a client or trip from a dropdown**: anywhere you pick a client or trip by name (adding/editing a trip, Email Quote, Email Itinerary, a task's Linked Client/Linked Trip, the Reports filters), just start typing — the list filters as you go instead of making you scroll through everyone. Click a match, or press Enter to pick the top one. Names are stored "Last, First," but you can type either order (e.g. "John Curabba" or "Curabba, John") and it'll still find them — the search checks that every word you typed appears somewhere in the name, not that it matches word-for-word in order.

---

## Signing in

The first time you open the CRM on a new device/browser, you'll be asked to set a password for that device — it's stored only in that browser, never sent anywhere, and can't be recovered if you forget it (use **Forgot password?** on the login screen to reset it, which only resets the login itself, never your client data). After that, you'll stay signed in on that device until you click **Lock** or **Close** (sidebar, near the bottom) or clear your browser data.

**Close** does everything **Lock** does (ends the session, asks for your password again next time), plus explicitly saves everything first — your local data, and a quiet backup to Google Drive if it's connected — before locking. Use it when you're wrapping up for the day and want to be sure everything's saved; use **Lock** for a quick "step away from the desk" that doesn't need the extra save.

Worth knowing: this password screen keeps a casual visitor who stumbles on the CRM's web address from seeing your data at a glance, but it isn't real security — anyone who deliberately went looking could get around it. **Secure Sync** (see [Backing up your data](#backing-up-your-data)) is the one feature with actual server-verified access control.

**Change Password** (sidebar) lets you set a new one (asks for the current password first).

---

## The stat numbers at the top of every page are clickable

Every number in the row of boxes at the top of Dashboard, Clients, Trips, Suppliers, Vendors, and Planner can be clicked. It opens a list of exactly which records add up to that number — click any row in that list to jump straight to that client, trip, supplier, vendor, or task. This is the fastest way to answer "which trips make up this revenue number" or "who are these upcoming clients."

On the Dashboard specifically, the **Upcoming** tile's list only shows trips that are actually upcoming, matching the number exactly. **Total Revenue**'s list shows every trip that has a dollar value, regardless of status — Planning and Cancelled trips included — so the list always adds up to exactly the number shown, same as every other clickable stat. **Points deployed** totals only the actual miles/points redemptions recorded in trips' Booked Trip Details (the per-program amounts under every section's Points Used block — Airline, Cruise, Car Rental, Tours, Theme Park, Train, Bus, and each individual Hotel entry's own Points Used block) — not the simple Points Used field on the basic trip form.

The Dashboard also has a **Revenue by Section** card that splits the headline Total Revenue figure into Trips, Credit Card Consulting, and Referrals and Promo — click any of the three to jump to that page.

**Mailchimp** shows the same six numbers as the Analytics tab's Mailchimp card, right on the Dashboard — Subscribers, Subscribers Added Yesterday, Unsubscribed Yesterday, Campaigns Sent, and the Open/Click Rate of your most recently sent email. Click any tile to see the details; **View all** jumps to the Analytics tab.

**Most Recent Email** shows how your latest Mailchimp campaign is doing right on the Dashboard — subject, send date, emails sent, opens, and clicks, no clicking around needed (once Mailchimp is connected — see [Analytics](#analytics)). Click the line to see exactly who opened or clicked it; **View all** jumps to the Analytics tab with the full campaign history expanded.

**Blog Followers** shows your WordPress.com follower count right on the Dashboard (once WordPress is connected — see [Analytics](#analytics)) — click it to jump straight to the Analytics tab with the full follower list already expanded and scrolled into view.

**Instagram Followers** does the same for your Instagram follower count (once Facebook is connected — Instagram rides on that same connection, see [Analytics](#analytics)) — click it to jump to the Instagram section of the Analytics tab.

**X Followers** shows your X (Twitter) follower count, with the change since the last time it checked shown underneath (e.g. "+23 since Aug 21"). Unlike the other tiles, this one only checks X **once a day** — X charges per lookup, so the CRM deliberately reuses the day's saved number instead of asking again every time you open a page. Click it to jump to the X card on the Analytics tab.

**TikTok Followers** shows your TikTok follower count, updated every time you open the page (TikTok's API is free, unlike X, so there's no reason to hold it back). Click it to jump to the TikTok card on the Analytics tab.

At the very top of the Dashboard, **Quick Search** lets you jump straight to a Client, Supplier, or Vendor by typing part of their name (or a client's email) — results show up live as you type, each labeled and color-coded by type (blue Client, green Supplier, amber Vendor), and clicking one opens that record right away.

The Dashboard also has a **Planner tasks — today & overdue** card: your 10 most pressing open tasks (whatever's due today or already past due, most-overdue first), each showing its linked client(s) and due date. Click a task to open it, click a client name to open their record instead (a task linked to more than one client lists each of them separately), or hit **View all** to jump to the full Planner list filtered the same way.

**Upcoming & In Progress Trips** (the table card next to Top Clients) only ever shows trips that are actually happening right now or still coming up — nothing in Planning, nothing already Completed, nothing Cancelled, and no Credit Card Consulting/Referral income rows, regardless of when they were added to the CRM. Trips already underway are listed first, then upcoming trips soonest-first, so the very next thing on your plate is always at the top. **View all** still goes to the full, unfiltered Trips page.

(On a Supplier's or Invoice's own detail screen, the numbers there instead scroll you down to the transaction table that's already shown below — no extra click needed to see the detail, it's already on the same screen.)

---

## Clicking outside a popup window won't lose your changes

Any popup window (Edit Client, Edit Task, Add Trip, etc.) stays open if you click the dimmed area outside it — that used to close the window immediately, discarding anything you'd typed. Close it on purpose instead, with its **X** button or **Cancel**.

---

## Clients

**Adding a client**: Clients page → **+ Add Client**. Only Name is required — email and everything else (phone, address, birthdate, citizenship/birth country, how they were referred, preferred airline/hotel/cruise line, mileage/points balances for every airline, hotel, cruise line, car rental, and credit card program, and which airline- and hotel-branded credit cards they hold) is optional and can be filled in over time. This matters in practice for a client created automatically by a revenue import (see [Suppliers](#suppliers)) with no email on file — you can still open that record, fix their name, and save it without being forced to make up an email address first.

**The Trips column matches what you'd see on the Trips page, not a raw record count.** If a client has a multi-city vacation joined together with Linked Trips (see [Trips](#trips)), it counts as one trip here too, not one per leg — and a booking split across several line-item records by a revenue import still only counts once. Click the number to jump straight to that client's trips.

**If an existing client submits the Book a Trip form again** (website submission, imported via CSV or the automatic Outlook sync), any field they filled in on that new submission replaces what's already on their record — a mileage/points balance or loyalty status they filled in is trusted over whatever was there before, since that's newer, self-reported information. But **a field they left blank on that particular submission never overwrites or clears out an existing value** — this applies down to individual fields, not just whole sections: e.g. if they update their Delta balance but leave the Delta status dropdown untouched, their existing status is kept exactly as it was, not blanked out just because that one field wasn't repeated on this submission.

Each mileage/points section (Mileage Balances, Hotel Point Balances, Cruise Line Loyalty, Car Rental Loyalty, Credit Card Point Balances) can be collapsed — click the section name (the little arrow flips to show open/closed) to hide or show its list of programs. Every section starts collapsed, even one that already has a balance saved in it, so the form isn't an overwhelming wall of fields the moment you open it. Same behavior on the trip form's copy of these sections, and on the trip form's own **Booked Trip Details** categories (Airline, Hotel, Cruise, Car Rental, Tours, Theme Park, Train, Bus) — each collapses independently, so you only see the fields for the parts of the trip you're actually working on. This is all about the internal trip record you edit here in the CRM — it's unrelated to the public Book a Trip form clients fill out on the website, which isn't changed.

**Airline/Hotel Credit Cards**: two checklists on the client record — check off any co-branded cards the client actually holds (e.g. United Explorer Card, Delta SkyMiles Reserve, Marriott Bonvoy Boundless, Hilton Honors Aspire), grouped by airline/hotel. This is separate from the Credit Card Point Balances section above it — that one's for general travel rewards cards (Chase Sapphire, Amex Platinum, etc.) with a points balance; this is just a plain "do they have this specific airline/hotel card, yes or no." The same two checklists also show up on the trip form, alongside the client's other loyalty balances, so you can check them without leaving the trip you're working on.

**Discounts**: a checklist on both the client record and each individual trip record — Military, AAA, First Responder, Educator, and Other (with a box to type in what it is, e.g. "Senior" or "AARP"). Check as many as apply. The client-level list is for discount eligibility that's generally true of them; the trip-level list is separate on purpose, so a discount that only applies to one particular booking doesn't have to be (or automatically isn't) implied for every other trip they've booked. Also on the public Book a Trip form, so a client can flag these themselves when submitting a request.

**Interests**: the same kind of checklist, also on the client record, each trip record, and the public form — Beach, Skiing, Boating, Fishing, Snorkeling, Horseback Riding, Adventure, and Other (with a box to type in anything not listed, e.g. "Golf" or "Wine Tasting"). Useful for tailoring recommendations — check off what a client's actually into so it's on file the next time you're planning with them.

**Notes**: every client has a running note timeline. Add a note and tag it with a type (Email Sent, Email Received, Initial Call, Follow-up, Post-Trip Follow-up, General, Text Message Sent/Received, **Lead**, Mailchimp Email Sent, Facebook Message) so the Activity Report can filter on it later.

**Tasks**: a client's own Planner tasks show right on their record — title, due date, and Open/Done status — with **+ Add Task** to add a new one linked to them. This includes tasks where the client is only one of several linked (see [Planner](#planner)), not just tasks where they're the primary contact. Clicking a task opens the full task editor (same one Planner uses), so you can change its due date, description, or anything else without leaving the client record.

**Paying Client / Subscriber**: two checkboxes on the client record, useful for filtering your list down to real clients vs. newsletter-only contacts. Checking **Subscriber** — whether at creation or later — automatically pushes that client into Mailchimp and (once set up, see [Mailchimp](#mailchimp) below) into your Jetpack subscriber list too. **Unchecking it now really does unsubscribe them from Mailchimp** — a real removal, not just a CRM change. Jetpack is different: there's no way for this CRM (or any outside tool) to remove a Jetpack subscriber automatically, so unchecking a client who's on Jetpack instead adds them to a "Needs Manual Removal in WordPress" list on the Analytics tab, for you to remove by hand in a couple of clicks. See [Keeping subscriber counts in sync](#keeping-subscriber-counts-in-sync) below for the full picture, including how to catch changes made directly in Mailchimp or WordPress rather than in the CRM.

**Attachments**: paste Google Drive links directly, or use "Browse Google Drive" to pick a file without leaving the CRM.

**Credit Card Authorization Form**: two ways clients can send you a completed, signed authorization PDF, both landing in the same secure spot — it's never emailed, never passes through this app, and never sits in the client's browser, and they don't need any account or password to use either one.

- **Personalized link**: on any existing client's record, right below Attachments, click **🔒 Copy Upload Link** — this copies a link to your clipboard that you send that specific client by email or text. It greets them by name and needs no further info from them.
- **General link for your website**: `https://milesmaneric.github.io/milesman-crm/cc-auth-upload.html` — this bare link (no personalization) can be posted anywhere on your website (a "Send us your authorization form" button/page, for example) for anyone to use. Since there's no client record tied to it, it asks the person uploading for their name and email first, so you can still match the file to the right person afterward.

Once uploaded either way, you'll find the file in your Drive under **Miles Man → Credit Card Authorization Forms** (or via "Browse Google Drive" on the matching client's record) — attach it to their record the normal way once you've reviewed it. The personalized link's **Copy Upload Link** button only appears once the client's been saved at least once — a brand-new, not-yet-saved record has no client ID yet for the link to carry.

**If the very first upload creates a second "Miles Man" folder** (Google shows it as "Miles Man (1)") instead of using your existing one — this is a one-time Google Drive quirk, not something broken. It happens because the upload feature can't automatically see a folder you created by hand. The fix is a one-time manual move: open "Miles Man (1)" → drag the **Credit Card Authorization Forms** folder inside it into your real **Miles Man** folder → delete the now-empty "Miles Man (1)". Every upload after that lands in the right place automatically — you only ever have to do this once.

**Referral Credits**: a section on the client record listing who they've referred, when, the $ amount, whether it's been used yet (checkbox), and — if it came from an actual sent certificate — a small `#000123` certificate number badge. Rows get added automatically when you send the "Referral Credit Earned" email (see [Emailing clients](#emailing-clients)), or add one yourself with **+ Add Referral Credit** for anything not sent through that flow (a manually-added row has no certificate number, since no certificate was actually issued for it). If a certificate went to more than one referrer at once, checking (or unchecking) "Used" on any one of their rows automatically checks/unchecks it on every other referrer's matching row too, since they all share the one physical certificate.

**Every trip in the client's own Trips list has a trash-icon delete button right on it** — spot a bad or duplicate record while reviewing a client's booking history and you can remove it right there, no need to close out and go find it on the separate Trips page.

---

## Trips

**Adding a trip**: Trips page → **+ Add Trip**, or open a client and add a trip from there. Client and Destination are the only required fields.

**Every trip on the Trips page starts collapsed** as a one-line summary (client, destination, dates, and its total revenue if it has any on file) — click it to expand and see the full row (flight, status, points, value, product, supplier, invoice #, edit/delete). Click it again to collapse it back. The ▾/▸ arrow on the left shows which state it's in. The **Trips** stat above the table counts these summary lines, not raw trip records — so it won't go up just because one trip happens to have several linked legs. For a multi-leg trip (see **Linked Trips** below), the collapsed line shows the combined revenue across every leg, not just one of them — and this same collapsed-line format (with revenue) shows up on the Dashboard's upcoming-trips list too.

By default the summary lines are sorted **soonest-upcoming trip first** (click any column header to sort by that instead), and each one is color-coded so you can scan the page at a glance: **yellow** = upcoming, **green** = happening right now, **orange** = already happened, **red** = cancelled, **blue** = still in Planning status regardless of its dates.

**Click the Status column header to sort by that color** — trips happening right now first, then upcoming trips, then Planning, then completed/past trips, then Cancelled last. Click it again to flip the order (Cancelled first, in-progress last).

**Status filter** now lets you check off any combination of statuses instead of picking just one — click the status button to open the checklist. It defaults to everything except **Cancelled**, so cancelled trips stay out of view until you specifically ask to see them.

**Linked Trips**: if a trip is really one leg of a bigger multi-city vacation booked as separate trip records (say, a NYC leg and a Paris leg), check the other leg(s) off in the **Linked Trips** list — type in the search box above it to find one quickly if the list is long. Linking works both ways automatically — check "Paris Leg" from the NYC trip's form, and the Paris trip's own Linked Trips list picks up the NYC trip too, no need to set it from both sides. Unchecking removes the link from both as well.

Once linked, the Trips page shows those legs grouped together under one summary line (client name, **Trip Name** if you've set one on any of the legs, every leg's destination in order, the status, the overall date range, and a trip count) instead of scattered among all your other unrelated trips — expanding it reveals each leg as its own indented row rather than just the one trip's own row. Search, status filter, and column sorting all still work as usual — a group just moves as a unit to wherever its first leg lands under the current sort.

Every summary line's status text always matches the color it's shown in — Upcoming (yellow), In Progress (green), Completed (orange), Planning (blue), Cancelled (red) — whether that color came from the trip's own explicit status or was worked out automatically from its dates.

**Set a Trip Name on any one leg and it copies to every other leg in the group automatically** — you only need to type it once. Renaming it later on any leg updates the whole group the same way; clearing it back to blank on one leg doesn't erase the name already showing on the others.

**Credit card consulting fees, non-cash bonuses, and referral/promo income never show up here** — they're automatically kept off the Trips page and shown on their own **Credit Card Consulting** and **Referrals and Promo** pages instead (see below), based on what's typed in the record's **Product** field.

The trip form has two parts:

1. **The basics** — origin/destination, dates, status (Planning/Confirmed/Upcoming/In Progress/Completed/Cancelled), trip type, airline, hotel, cruise line, points used, cash paid, total value, Invoice Number, and a free-text Notes box. This is what shows up in the Trips list and on the Calendar. Picking **Upcoming** always colors the trip yellow on the Trips page regardless of its actual dates — handy if a trip's dates aren't final yet, or just aren't accurate, but you still want it to read as "coming up." Picking **In Progress** works the same way for the green "currently traveling" color — handy if the automatic date-based coloring isn't quite right for some reason and you want to say so directly.

**Status now updates itself as the trip's dates arrive and pass** — a Confirmed (or Upcoming, or In Progress) trip automatically flips to **In Progress** once today falls within its depart/return dates, and to **Completed** once those dates have passed. This runs quietly in the background every few minutes, same as the other automatic imports — you don't have to remember to update it by hand. **Planning** and **Cancelled** are the only two statuses this never touches, since those are things you set on purpose and want to stay put regardless of dates.

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

## Groups

A Group is one layer up from a trip's own **Linked Trips**: instead of linking individual legs of one vacation together, it links whole trips (or already-linked vacation clusters) to each other under one name — useful for something like a big multi-family reunion booked as several separate, unrelated trip records that still belong together in spirit.

**+ Add Group**, give it a name, and check off which trips belong in it from the list (there's a search box above the list if it's long). Each group shows up on the Groups page as its own collapsed summary line, same style as the Trips page — name, status/color, date range, trip count, and its combined total revenue across every trip in it — click to expand and see each member trip listed underneath (and each of those still expands/collapses on its own the normal way if it's itself a multi-leg trip).

**Groups sort the same way the Trips page does by default** — whatever's happening now or coming up soonest floats to the top, then Planning, then completed trips, then Cancelled last — rather than alphabetically by name.

**Editing a group**: click the ✏️ icon on its summary line to rename it, change which trips belong to it, or add a note. A note added here logs onto every client and trip linked to the group automatically, the same way a note added on the Trips or Clients page does. The 🗑️ icon deletes the group itself — the member trips and clients are untouched, only the grouping goes away.

---

## Credit Card Consulting

A separate page for income that isn't really a travel booking — credit card consulting fees and non-cash bonuses. These are still added and edited through the exact same trip form as everything else (**+ Add Record** here opens it), the only thing that matters is what you type in the **Product** field: if it contains "credit card consulting" or "non-cash bonus" anywhere in it (any capitalization, any surrounding words), it automatically shows up on this page instead of the Trips page — nothing else to set. (If the text also happens to contain "referral," it goes to the Referrals page instead — see below.) Search, and the Records/Total Value stats at the top, work the same as everywhere else. There's no linking or collapsing here since these aren't itineraries with legs to group.

---

## Referrals and Promo

A separate page for referral and promo income, right next to Credit Card Consulting in the nav. Works exactly the same way — added/edited through the same trip form, shows up here automatically whenever the **Product** field contains "referral" or "promo" anywhere in it (any capitalization, any surrounding words — "Referral Commission," "Bonus Referral," "Summer Promo," etc. all count) — with its own search box and Records/Total Value stats, independent of Credit Card Consulting's.

---

## Suppliers

The Suppliers page (labeled "Suppliers" in the nav, called `vendors` internally) is your directory of airlines, hotels, cruise lines, car rental companies, and referral partners. Each supplier card shows how many trips and clients are linked to it and how much revenue has flowed through it, computed automatically from your trip records — you don't update these numbers by hand.

If you've filled in a **Website** on a Supplier, it now shows on the card as a clickable link that opens in a new tab.

**Automatic supplier linking**: when a client's trip request names an airline, hotel brand, cruise line, car rental company, theme park, or tour vendor that matches an existing Supplier record by name, the client gets linked onto that supplier automatically, and that supplier becomes the trip's supplier if nothing else already claimed that slot. This only works for an **exact name match** — if a supplier is named "Delta Air Lines" in your list but a request says just "Delta," it won't connect automatically. Keep supplier names matching the option text on the intake form (e.g. "Delta," "Marriott," "Royal Caribbean") for this to work reliably.

**Revenue imports create a missing Supplier for you.** When you import a revenue report (either the "Clean & Import Revenue File"/"Import Revenue CSV" buttons or the automatic Outlook sync) and a row names a supplier that isn't in your Suppliers list yet, the CRM adds it automatically — before creating the client and/or trip for that row — instead of leaving the trip with no supplier. If the exact same supplier name shows up on more than one row in the same import, only one Supplier record gets created and every row links to it. If you'd already imported a trip before its supplier existed, re-running that same import will retroactively link the supplier onto the existing trip rather than creating a duplicate.

**Client matching in a revenue import now handles a name that got cut off in the source report.** QuickBooks' own PDF export sometimes truncates a client's name in its Class column to fit the printed column width (e.g. "Bakhash" printed as "Bak..."). This used to mean the row could never match that client — even an existing one — and would either sit unmatched or, worse, create a second duplicate client. Matching now recognizes a cut-off name as a partial match against your existing client list, and if it's a genuinely new client with no name to go on, the record it creates is named honestly (kept partial rather than presented as if it were the full, correct name) so you can spot and fix it. The import's closing toast tells you if any new client names came out incomplete, so you don't have to go hunting for them.

**The "Linked Clients" checklist on a Supplier's own edit form is always available now** — it used to only show up when a Supplier's Type was set to "Referral Partner," which meant there was no way to review or clear it for a regular travel Supplier. If a client's name is stuck showing on a Supplier's card after you've deleted every trip that linked them (this can happen on records edited before this fix), open that Supplier, scroll to **Linked Clients**, and uncheck them there.

**Contacts** — each Supplier can hold any number of people you deal with there (an account rep, a group desk contact, whoever), each with their own Name, Title, Email, and Phone. Open a Supplier and scroll to the **Contacts** section: **+ Add Contact** (or clicking an existing one) opens that contact's own record, which works just like a client's — a Notes Log you can filter by type and add entries to, and a Tasks list with its own **+ Add Task** for follow-ups tied specifically to that person. Delete a contact with the trash icon on its row in the Supplier form (no need to open it first).

**Balance Due Email** — click the 💵 icon on a Supplier's card to draft an email about an outstanding balance. Pick who it goes to (the Supplier's own email, or one of its Contacts), optionally check off which bookings the balance covers — a running "Selected total" shows underneath as you check boxes, just as a reference — then type in the actual **Outstanding Balance ($)** yourself (the CRM doesn't track what's actually been paid to a supplier, so this figure is always yours to enter). The message pre-fills with a list of whatever bookings you checked and the amount you typed; edit it however you like before sending. **Open in Outlook** hands it off the same way every other email in this app does, and logs a note on the supplier's record noting what was sent.

---

## Vendors

A separate directory from Suppliers, for the non-travel businesses you deal with — a printer, a web host, an accountant, whoever isn't actually a travel booking partner. Each Vendor has a Name, a Category (Printing, Web/Hosting, Accounting, Legal, Marketing, Insurance, Office/Supplies, Software, Other), a Phone number, a Website, and Notes — no trip or revenue tracking, since these aren't bookings.

**Contacts work exactly like Supplier Contacts** — open a Vendor and scroll to its own **Contacts** section: **+ Add Contact** opens that person's own record with a filterable Notes Log and a Tasks list with **+ Add Task**, same as everywhere else. Delete a contact with the trash icon on its row, no need to open it first. Every contact is also clickable right on the plain Vendors list page itself — no need to open the vendor record first — each one listed under its vendor's card, along with its own **+ Add Contact** button.

**Set a Website on a Vendor and it shows up in Bookmarks automatically** — no need to add it twice. It lands in the Bookmarks page's **Vendors** section, filed under the same category you picked for the vendor. Update the website (or the vendor's name/category) and the bookmark updates to match; clear the website out and the bookmark disappears.

---

## Planner

Your follow-up task list, with the linked client's phone and email shown right in the table. Most tasks get created automatically — one per new trip request and one per new contact-form lead — but you can add your own anytime with **+ Add Task**.

**A task can link to more than one client.** The task form's **Linked Client** dropdown is the primary contact; check any others under **Additional Clients** below it. The Client column then lists everyone linked, each one clickable to jump to their record, and the task shows up on every one of those clients' own task lists — not just the primary's. The Email field auto-fills with every linked client's email (comma-separated, so one click on the mail icon reaches all of them at once) — it re-fills whenever you change who's linked, and you can still type over it by hand if you need something different. Marking the task done logs a completion note on every linked client's record, not just the primary's.

Right inside the task form itself, next to the **Linked Client** dropdown, a **View Client →** link appears the moment a client is picked (or immediately if you're reopening a task that already has one linked) — click it to jump straight to that client's record without closing out and searching for them. The same **View Trip →** / **View Contact →** links show up next to **Linked Trip**, **Supplier Contact**, and **Vendor Contact** too, each jumping straight to that trip, supplier contact, or vendor contact.

**A task can also link to a Supplier Contact or a Vendor Contact** instead of (or alongside) a client — two separate dropdowns on the task form, each searchable by name, listing every contact across every Supplier or every Vendor respectively. Picking a Supplier Contact also automatically fills in **Linked Supplier** with that contact's own supplier; picking either one fills the Email field with their email.

**The Planner table now has a color-coded Type column** — green **Supplier**, amber **Vendor**, blue **Client** — showing which kind of contact a task is really about, and the Client/Phone/Email columns follow the same priority: a linked Supplier Contact wins first, then a Vendor Contact, then a linked client. So a task about, say, a cruise line's group desk contact or your printer's sales rep shows *their* name/phone/email front and center, not a client's that happens to also be tagged on it.

Checking a task's box marks it done immediately, but the row stays put — checked, struck through — instead of vanishing right away, so you can still see what you just did and hit the trash icon on it if it was a mistake. It'll drop off the default (Open) view the next time you navigate away and back, or switch the filter to "Done" and back. The trash icon deletes a task outright, any time.

---

## Calendar

A month view with every trip painted across its travel dates. Click into a day to see (and add) trips landing on that date. A trip marked **Cancelled** never shows here — not on the month grid, not in a day's trip list — even if it has dates that would otherwise land in view.

---

## Reports

Five tabs (the first four exportable to **CSV** or **PDF**; AI Report exports to CSV):
- **Activity Report** — every note logged across every client, filterable by date range, note type, and client.
- **By Invoice #** — trips grouped by booking/invoice reference, filterable by date range, supplier, and client. (This avoids double-counting revenue when a booking has multiple line items sharing the same reference.)

  The date range has a **Filter By** choice: **Travel Date** or **Invoice Date**. These can be genuinely different dates — a trip might get booked in June for August travel — so if a trip you're expecting isn't showing up for a date range, try switching which date you're filtering by before assuming something's wrong. Invoice Date only gets filled in automatically for revenue-imported trips; you can also set it by hand on any trip's Invoice Date field.

  **Trips imported before this feature existed have no Invoice Date at all** — filtering those by Invoice Date will show nothing for them until you fix that. Re-run the exact same "Clean & Import Revenue File" / "Import Revenue CSV" import on the same source file: it recognizes the trips it already created and fills in the missing Invoice Date on them (and links a supplier too, if one's since been added) instead of creating duplicates.
- **Unused Certificates** — every referral bonus certificate that hasn't been marked "Used" yet, across every client, with its certificate number, all the referrers it names, who they referred, the date it was issued, and the $100 amount. Optionally filter down to one referrer. Click a row to jump to the first referrer's client record. This is the place to check before a certificate slips through the cracks — once you mark it Used on any of its referrers' records, it drops off this list (see [Clients](#clients)).
- **Combined Points** — check off any number of clients traveling together, hit Run Report, and it lays out every airline, hotel, cruise line, car rental, and credit card program at least one of them has a balance in — one column per traveler, plus a **Combined Total** column adding them all up. This is the "do we have enough between us" report: pick the travelers on a trip, and see right away whether their combined Delta miles or Marriott points actually clear what's needed, instead of checking each person's record separately and adding it up by hand. Only programs where the combined total is above zero show up.
- **AI Report** — type exactly what you want in plain English (e.g. "Trips over $3,000 booked with Delta in the last year, sorted by value") and click **Generate Report**. The AI only decides what to filter/sort/show — the actual numbers always come straight from your real trip records, never from the AI itself, so you can trust the figures the same as any other report here. Click a row to open that trip. Happy with a report? Click **Save This Report** and give it a name — it shows up under **Saved Report Styles** below, where **▶️ Run** re-generates it instantly against your current data (no need to describe it again or wait on the AI) and 🗑️ removes it. *Requires the Anthropic API key to be configured on the server side — if you see an error saying the AI request failed, that key still needs to be added.*

**Export PDF** builds a clean, printable version of whatever the report currently shows (same filters, same rows) and downloads it as a PDF — handy for emailing a report to someone or keeping an offline copy, versus **Export CSV** for pulling the data into a spreadsheet.

---

## Emailing clients

Three different tools, depending on what you need:

- **Email** (the mail-merge tool) — quick canned messages: Welcome New Client, General Follow-Up, Trip Confirmation, Thank You & Referral, **Birthday Trip Planning**, or **Referral Credit Earned**. Check off one or more clients from the list (there's a **Select All**/**Select None** shortcut above it, and **Paying clients only**/**Subscribers only** checkboxes to narrow it down first), preview with their name(s)/email(s) filled in, send. Checking more than one sends a single email addressed to everyone you checked, with the greeting joining their names together ("Hi Alice and Bob,", "Hi Alice, Bob, and Carol," for three or more) — the same way the Referral Credit Earned template below already greeted multiple referrers at once.
  - **Birthday Trip Planning happens automatically too, sort of** — as long as a client has a Birthdate on file, once their birthday is exactly 90 days away the CRM adds a follow-up task to your Planner for you, with the suggested email (subject and body already filled in with their name) sitting right there in the task's description ready to copy over. Nothing gets sent on its own — this app never sends email without you clicking Send yourself — it just makes sure you don't have to remember birthdays or write the email from scratch. This check runs automatically every few minutes as long as the CRM tab is open, same as the trip-request/contact-form auto-imports, and only creates the reminder once per client per year.
  - **Referral Credit Earned** works differently from the others: pick one or more **referrers** (its own checkbox list, replacing the usual client list for just this template) and one or more **referred clients**. The email greets all the referrers together ("Hi Aaron and Alice,"), mentions all the referred people in the body, goes out to every referrer's email at once, and adds a row to each referrer's **Referral Credits** section (see [Clients](#clients)) when you click Send or Log as Note. You can't pick the same person as both a referrer and someone they referred — you'll get a warning instead of a nonsensical email.
    - Every send generates exactly **one $100 certificate**, no matter how many referrers or referred people you picked — with the Miles Man logo, all the referrers' names on the "issued to" line together (e.g. "Aaron Referrer and Alice Referrer"), a unique certificate number that only ever goes up, and the redemption terms (good for $100 off booking fees/trip cost; a trip means a unique booking record number; no value once redeemed; non-transferable but usable if you book a trip for someone else with your own miles/points/credit card). The certificate number only gets assigned once you actually click Send or Log — previewing or changing your selections doesn't burn a number.
    - Clicking **Open in Outlook** also downloads a PDF of the certificate(s) and copies the certificate itself to your clipboard. Paste it into the email body (Ctrl/Cmd+V) like usual, and **attach the downloaded PDF yourself** — Outlook (or any email app) can't auto-attach a file from a `mailto:` link, so this is the one email in the CRM where you need that one extra manual step.
- **Email Quote** — for building a real cruise pricing quote to send a client, with cabin options and pricing laid out in a styled email. Ready-made polished templates now cover **Virgin Voyages, Princess, Royal Caribbean, Ritz Carlton Yachts, Seabourn, Explora Journeys, and Windstar** (Ritz Carlton Yachts, Seabourn, and Explora Journeys are all-inclusive ultra-luxury lines, so their "what's included" lists reflect that — all-suite, dining, beverages, gratuities, WiFi; Windstar isn't all-inclusive, so it lists dining/entertainment/stateroom like Royal Caribbean instead). A **Gratuities** and **Voyage Protection** field sit right below the pricing table — both optional, both a single dollar amount for the whole quote (not per cabin) — and whichever ones you fill in show up as their own line in the email, right after "What's included." This works the same for every cruise line, including the ones without a styled template. (Virgin Voyages' pricing table also has its own per-cabin Gratuities/Voyage Protection columns for when those genuinely differ by fare type — that's separate from, and unaffected by, these two fields.) Every sent quote also gets a PDF copy saved automatically to a "Miles Man Quotes" folder in Google Drive, named `<client>.<cruise line>.<sailing date>.pdf`.
  - **Comparing more than one date in the same email**: fill in a Sailing Date and pricing as usual, then click **+ Add Another Date to This Quote** — it saves that date as one option and clears just the date and pricing fields so you can enter the next one (everything else, like ship or notes, carries over as a starting point in case it's the same, but you're free to change any of it before adding the next date). A running list above the button shows what's been added, each with a **Remove** button. Fill in as many dates as you want to compare, then hit Preview or Email Quote as usual — the client gets one email with each date option as its own clearly labeled card ("Option 1," "Option 2," etc.), one PDF saved to Drive, and one note logged on their record. You're not locked into one cruise line either — if you want to compare, say, a Royal Caribbean sailing against a Carnival one, that works too. Skip "+ Add Another Date" entirely and everything works exactly as a single quote always has.
- **Email Itinerary** — pick a client and one of their **actual booked trips**, and it builds a nicely formatted recap email straight from whatever's on that trip record: dates, every passenger linked to the trip, flight/hotel/cruise details, car rental, tours, theme park, train, bus, confirmation info, points used, total trip value, and your trip notes. Flight, hotel, and cruise details pull from whatever you filled in under **Booked Trip Details** (each Airline Record gets its own box, listing that record's Record Number, passengers, and flights; each hotel stay and each cruise cabin gets its own line too) — it only falls back to the simpler basics-tab fields (Airline, Hotel, Cruise Line) if Booked Trip Details was never filled in for that piece at all. **Points Used** and **Total Trip Value** always come from Booked Trip Details too (every category's own Points Used entries and Price field, added up) — never from a revenue import, so what the client sees always matches what you entered by hand for that booking rather than whatever the import happened to bring in. There's no "Amount Paid" line at all. Any section the trip doesn't have data for is simply left out — it never shows an empty "Hotel Details" box for a flight-only trip. If the trip has any **Linked Trips** (see [Trips](#trips)), they show up right after the destination/dates as "Also Part of This Vacation," so a client booked on a multi-city itinerary sees every leg in one email, not just the one you happened to pick. Every sent itinerary also gets a PDF copy saved automatically to a "Miles Man Itineraries" folder in Google Drive (a separate folder from quotes), named `<client>.<destination>.<depart date>.pdf`.

All three work the same way at send time: the email gets copied to your clipboard (since a plain `mailto:` link can't carry formatting) and Outlook opens addressed to the client(s) — paste (Ctrl/Cmd+V) into the body and send. A note gets logged on every recipient's record automatically.

---

## Assistant

A chat bubble in the bottom-right corner, on every page. Click it to open a small chat panel and just type what you want — it can look things up ("find clients named Sarah," "show me trips to Cancun departing next month") or make changes for you ("add a note to Sarah's record that she called about upgrading her cabin," "create a follow-up task for tomorrow to confirm final payment").

It can only do a fixed set of things: find clients, find trips, add a client note, create a Planner task, and create a new client. It can't edit your source code or do anything outside those actions. Every change it makes goes through the same **Undo** button in the sidebar as anything else you do by hand — if it gets something wrong, just hit Undo. The conversation itself isn't saved anywhere; closing the tab or refreshing starts a fresh chat.

---

## Bookmarks

A place to save links to sites you use often — airline sites, hotel booking tools, visa/documentation portals, currency or weather lookups, whatever. Bookmarks are grouped into three sections, **Travel Agent**, **Consumer**, and **Vendors**, and within each, by category — Travel Agent/Consumer use the travel categories (Airline, Hotel, Cruise Line, Car Rental, etc.), while Vendors uses the same categories as the [Vendors](#vendors) page (Printing, Web/Hosting, Accounting, etc.) — so a printer's ordering portal or your web host's login doesn't get mixed in with airline/hotel links. Each category starts collapsed (showing just its name and a count) — click it to expand.

**+ Add Bookmark**, give it a name and a URL (you can skip the `https://` — it's added automatically), and optionally a category, an audience (Consumer, Travel Agent, or Vendors — defaults to Consumer if you skip it), and a note. Switching the audience to Vendors swaps the category list to match. Click the name to open the link in a new tab; the pencil/trash icons edit or delete it.

Click **+ Load Starter Bookmarks** to add a pre-built set of consumer booking-site links and travel-advisor/agent-portal login links for common airlines, hotels, car rental companies, cruise lines, tour operators, and theme parks — each one already tagged with the right category and audience. It won't add duplicates if you click it again later. A few entries are noted as unverified where the exact portal URL couldn't be confirmed — double-check those before relying on them.

**Travel Agent → Award Tools** now includes a handful of award-booking tools — Seats.aero, ExpertFlyer, Point.me, and AwardWallet — for searching award availability and tracking client mileage balances across programs. These come in through the same "+ Load Starter Bookmarks" button as everything else above.

Right below Bookmarks in the sidebar, seven more quick links — **Miles Man Site**, **WordPress Admin**, **Google Drive Folder**, **Mailchimp**, **Canva**, **Vercel**, and **GitHub** — open each in a new tab, without leaving the CRM.

---

## Marketing

Facebook Ads campaign management for the agency's ad account.

Click **Connect Facebook Ads** the first time. Once connected, you'll see every campaign — name, status, objective, daily/lifetime budget, and the last 30 days' spend/impressions/clicks/cost-per-click — with a **Pause**/**Activate** button on each row (Activate asks you to confirm first, since it starts real spend immediately). **+ Create Campaign** walks you through a 4-step wizard: Campaign (name/objective), Ad Set (budget/dates/targeting), Creative (Facebook Page/ad copy/image/link/call-to-action), then Review & Launch. Everything the wizard creates starts out **paused** — nothing spends a dollar until you explicitly hit Activate on it afterward, same button used on the campaign list.

If the page shows an error like **"API Access Blocked"** instead of your campaigns, that's Facebook itself refusing the request, not something wrong in the CRM — it almost always means the Facebook App needs to go through Meta's App Review for ad permissions, or the Business Manager that owns the ad account hasn't finished Business Verification. Open the Debug Panel (sidebar, near the bottom) right after seeing the error — it now logs Facebook's full error code, which pins down exactly which of those it is.

---

## Analytics

Several cards, in this order: your **WordPress.com/Jetpack** blog stats, your **Google Analytics (GA4)** website traffic, your **Facebook** (Ads, Page, and Instagram) performance, your **X** account, your **TikTok** account, your **Mailchimp** audience, and an **SEO (Yoast)** audit of your site's posts and pages.

**Daily Summary and Yesterday's Analytics** sit at the very top, above all those cards, and also show up on the Dashboard — whichever page you open first generates them, and the other just shows what was already generated, so you're never waiting twice or paying for two AI calls in one day. **Yesterday's Analytics** is a plain compiled scoreboard, pulling one day's numbers from every source you've connected. **Daily Summary** takes those same numbers and has Claude write a short, plain-English summary with a couple of notable observations and a couple of concrete suggestions — aimed at a quick read, not a deep-dive report. Both are cached for the day; hit **Regenerate** if you want a fresh pull (and a fresh AI summary) instead of what's cached.

Not every connected source has a real "this is what happened yesterday" number to offer. WordPress, GA4, Facebook, and Instagram all do. Mailchimp shows Subscribers Added Yesterday and Unsubscribed Yesterday (both real day-specific counts), plus the Open Rate and Click Rate of your most recently sent campaign — not a lifetime average. X reuses its existing once-a-day check (see below), so its "Change" line shows the real gain or loss since the last time it checked, not a guess. TikTok and SEO don't have a "yesterday" number at all — TikTok's API and the SEO audit only ever report where things stand right now — so those two are clearly labeled as current totals rather than something that happened yesterday, both in the scoreboard and in what gets sent to Claude, so the AI summary won't mistakenly describe your current TikTok following as something you "gained yesterday."

**WordPress.com / Jetpack Stats** — click **Connect WordPress.com** the first time; after that it shows visitors and views (today, yesterday, and all-time), your blog's follower count, your single best day ever, and a "Most recent" line always showing the latest day's numbers. The full day-by-day table for the last 30 days sits behind its own collapsed-by-default toggle right below that, so the card stays compact — click it (▸) to see every day. **Disconnect** clears the connection if you ever need to reset it. Click the **Blog Followers** number itself and it jumps you straight down to the full follower list below.

**Google Analytics (GA4)** — no separate login needed here; it rides along on the same Google sign-in you already use for Drive backup. If you haven't connected Drive yet, or connected it before this feature existed, you'll see a **Connect**/**Reconnect Google Drive** button — click it once and you're set going forward. Once connected, it shows active users, page views, and sessions over the last 30 days, a "Most recent" line for the latest day, and the same kind of collapsed-by-default daily breakdown table as WordPress above.

**SEO (Yoast)** — no connecting needed at all; this loads automatically since it's reading publicly-available data straight from your website. Four summary numbers up top (Posts & Pages / Missing Description / Noindexed / Missing OG Image), then two collapsible sections, **Posts** and **Pages** — expand either to see every post or page with its SEO title, meta description, whether it's set to be hidden from search engines ("Noindex"), and whether it has a social-share image, each flagged if it's missing or runs long. This checks the same Yoast SEO plugin data your website already has — it isn't the green/yellow/red score you'd see inside WordPress itself (that score only shows up in the WordPress admin, this app has no way to read it), just a plain checklist of the same kind of things that score looks at.

**Facebook** — click **Connect Facebook** the first time (this same connection also powers Facebook Ads campaign management on the [Marketing](#marketing) page — one login covers both). Once connected, three sections: **Ads Performance** (spend/impressions/clicks/reach over the last 30 days), **Page Performance** (Page Likes, Page Views, Impressions, Reach, Post Engagements — the organic, non-ad-spend side of your Facebook Page), and **Instagram** (Followers, Posts, Reach, Views, Profile Views). Instagram doesn't need its own separate login — Meta requires an Instagram Business/Creator account to be linked to a Facebook Page, so as long as your Page has one linked in Meta Business Suite, it shows up automatically once Facebook is connected. If it says no Instagram account is linked, that's a Meta Business Suite setting to fix, not something to reconnect here.

**X** — Followers (with the change since it last checked), Following, Posts, and Listed, plus a **Follower History** table building a day-by-day trend over time.

**Read this before connecting X — it's the one part of the CRM that costs money to use.** X got rid of its free API access in February 2026. Every lookup now bills your X developer account roughly a penny, so you need an X developer app with a payment method on file before it will return anything. To keep that bill tiny, the CRM checks X **once per calendar day** and reuses that saved number everywhere else — opening the Dashboard and this page fifty times in a day still only costs that one check, which works out to roughly **30¢ a month**. The **Refresh now** button forces a fresh check on purpose (and costs one more), so use it when you actually want an up-to-the-minute number, not out of habit.

The Follower History table costs nothing at all — it's built from the daily numbers already saved on your computer, not from new lookups. It needs a couple of days of the CRM being opened before there's a trend to show. **Disconnecting X keeps that history** — you won't lose the trend you've paid to build up if you reconnect later.

Setting X up is a one-time job for whoever maintains the CRM: it needs an app created in X's Developer Portal and two small files added to the Vercel helper project (both are already written and waiting in the `vercel-endpoints` folder of the CRM's code repository). Until that's done, the Connect X button will tell you it isn't configured yet rather than sending you to a broken login page.

**TikTok** — Followers, Following, Likes, and Videos, refreshed every time you open the page. Unlike X, TikTok's API doesn't charge per lookup, so there's no need to save yesterday's number — it always shows the current count.

**Setting up TikTok is a one-time job for whoever maintains the CRM**, and it needs one extra step beyond X's setup: after creating the app in TikTok's Developer Portal and deploying the two proxy files (already written and waiting in the `vercel-endpoints` folder, same as X's), the app also has to go through **TikTok's own review process** before it will return your real account's numbers — a fresh app only works with test accounts you've specifically approved for testing, not your actual account, until TikTok signs off (typically some days to a few weeks). Until that review is done, connecting may fail or only show test data, not something wrong with the CRM.

**Mailchimp** — Subscribers, **Subscribers Added Yesterday**, **Unsubscribed Yesterday**, Campaigns Sent, Open Rate, Click Rate. Both "Yesterday" tiles are real day-specific counts (checking each member's own join/unsubscribe date), not a running total — click either one to see the full subscriber/unsubscribed list. **Open Rate and Click Rate are for your most recently sent campaign specifically**, not an average across every campaign you've ever sent — click either tile to see exactly who opened or clicked that email.

**Drill down further**: under each card, click any collapsed section header (▸) to expand it and load the detail — nothing loads until you actually open a section, so the page stays quick even though there's a lot available:
- **WordPress**: Daily Views & Visitors (30 Days), Top Posts & Pages, Referrers, Views by Country, Search Terms, Blog Followers.
- **GA4**: Daily Users, Views & Sessions (30 Days), Top Pages, Traffic Sources, Device Category, Top Countries.
- **Mailchimp — Recent Campaigns**: unlike the others, this one never shows nothing — collapsed, it always shows a quick summary of your most recently sent campaign (subject, date, emails sent, opens, clicks); expand it for a full table of your last 10 campaigns. Click any campaign (collapsed summary or expanded row) to see exactly who opened and clicked it, sorted with the most engaged recipients first.

(The two daily-table sections are a slightly different kind of collapsed — their data's already been fetched along with the rest of the card, so expanding them is instant, not a fresh load like the others.)

All the detail sections show nicely formatted tables — linked titles/sources/names open in a new tab, countries show their flag, and followers show their avatar. Search Terms shows a table too where terms are actually visible — most search engines hide the exact query for privacy, so this section is often just a note saying how many were hidden rather than a list. Blog Followers shows every follower across all pages, not just the first.

**Blog followers automatically become clients**: every time you open Analytics with WordPress connected, the app quietly checks your email subscriber list against your Clients list. If a subscriber's email matches an existing client, their **Subscriber** checkbox gets turned on automatically if it wasn't already. If a subscriber doesn't match anyone, a new client record is created for them (with the Subscriber box checked) so nobody who follows your blog falls through the cracks. You'll see a toast confirming what changed the moment it happens; if everything's already in sync, nothing happens and no toast appears.

---

## Connecting Outlook

Email menu → **Sync Outlook Emails**. This is a one-time login (until you sign out or the token expires) that unlocks:
- Logging sent/received emails to each client's notes automatically.
- Logging sent/received emails to each Supplier Contact's and Vendor Contact's own notes automatically too, the same way — as long as that contact has an email address on file.
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

**Any client marked "Subscriber"** (at creation or later) gets pushed into your Mailchimp audience automatically — no extra step needed, as long as you've used Sync/Log Mailchimp Activity at least once so the CRM knows which audience to use. **Unchecking Subscriber unsubscribes them for real** — the CRM tells Mailchimp to mark them unsubscribed, the same as if they'd clicked the unsubscribe link at the bottom of one of your emails.

---

## Auto-subscribing to Jetpack too

Jetpack (your website's blog-follower/newsletter system) doesn't offer any way for an outside tool to add a subscriber automatically — Jetpack itself only supports a manual CSV upload. To get the same "automatic" behavior as Mailchimp, this CRM talks to a small helper endpoint installed directly on the website, one time, by whoever manages the WordPress site:

1. They install the snippet in `wordpress-snippets/jetpack-subscribe-endpoint.php` (in this repo) — full instructions are in that file's comments; it's a few minutes with the free "Code Snippets" plugin.
2. They create a WordPress **Application Password** (a special login just for this, separate from your real password) and give you the username + Application Password.
3. In the CRM: **Analytics** tab → **WordPress.com / Jetpack Stats** card → **Set Up Auto-Subscribe**, enter those two values once.

After that, any client marked "Subscriber" is registered with Jetpack automatically too. One thing that never changes: **Jetpack always sends its own confirmation email** to the person before they're an active subscriber — that's built into Jetpack itself, not something this integration can skip, so a new subscriber still needs to click that link.

If it's never set up, nothing breaks — the CRM just quietly skips the Jetpack push and keeps doing the Mailchimp one.

**Removing a subscriber from Jetpack can't be automated** — Jetpack simply doesn't offer any way, for this CRM or any other outside tool, to remove a subscriber by email. The only way to remove someone is by hand: WP Admin → Jetpack → Subscribers → find them → the **⋯** menu → **Remove**. So when you uncheck Subscriber for someone who's on Jetpack, the CRM adds them to a **"Needs Manual Removal in WordPress"** list on the Analytics tab instead of pretending it removed them — do the removal yourself in WP Admin, then click **Done** on that row to clear it.

---

## Keeping subscriber counts in sync

The Subscriber checkbox, your Mailchimp audience, and your Jetpack follower list are three separate lists, and normally they stay in sync automatically: checking or unchecking Subscriber on a client pushes that change out to Mailchimp (a real subscribe/unsubscribe) and to Jetpack (subscribe automatically; unsubscribe gets queued for the manual step above).

What that automatic push **can't** catch is a change made on the *other* end — someone clicking "unsubscribe" at the bottom of a Mailchimp email, or being added/removed as a Jetpack follower some other way. For that, use **Sync Subscribers**, the button on the Clients page toolbar:

1. Click it. It checks your current Mailchimp and Jetpack subscriber lists against every client's Sub checkbox (you need at least one of Mailchimp or WordPress connected for this to have anything to compare against).
2. If everything already matches, it just tells you so — nothing to do.
3. If anything's out of sync, it opens a review list: one row per client who doesn't match, showing where they stand in the CRM, Mailchimp, and Jetpack, with a suggested action already picked for each row (leaning toward keeping someone subscribed rather than accidentally dropping them, since that's the safer default). **Nothing changes until you click Apply** — review each row, change any action you disagree with (Mark Subscribed / Mark Unsubscribed / Skip), then apply.
4. Applying pushes the real changes the same way the checkbox does — including queuing any Jetpack removals for the manual step, if that's what a row needs.

The Clients page also shows a small red count on the Sync Subscribers button whenever there are pending manual Jetpack removals waiting, so it's hard to miss that step.

---

## When something goes wrong

Every import/sync feature writes to a hidden **Debug Log** as it runs — request counts, warnings, per-client match results, errors. This is the first place to check when a sync "did nothing" or an import skipped something you expected to see. Ask whoever maintains the CRM's code how to open it if you can't find it.
