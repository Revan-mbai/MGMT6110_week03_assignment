### Name: Revan Koh

## Build log

### Prompt 1

 ROLE: You are a senior front-end developer building a React web app.

 GOAL: Build the front end of a bus tracking app, a web product for everyone in singapore. Their job on this product is to track bus arrival details in real time. Screens:

1. [SCREEN 1: shows all nearby bus stops and below the header should have a carousell showing the latest traffic incidents]
2. [SCREEN 2, shows the selected bus stop and the buses available at that stop with the arrival times of each bus updated in real time. if there are any buses that are delayed due to heavy traffic and/or incidents, a warning label should appear beside the bus number]

OUTPUT: A running app. Keep every invented value in ONE data file of its own, with at least 5 rows, so the screen looks real. One component per screen or section. Move between screens without reloading the page. Readable on a phone at arm's length. When you are done, list the files you created and what each one holds.

GUARDRAILS: Screens and invented data only. Do NOT call the Gemini API or any other model. Do NOT call any outside service or fetch from any URL. No database, no login, no user accounts, no analytics. No features I did not list. No real company's name, logo, or trademark. Invented names and numbers only, nothing confidential.

CONTEXT: I am not a programmer: when you make a choice I did not specify, say so in one line rather than burying it.

**What came back / what I did:** The agent created the initial screens, sample data and navigation. I kept the result and continued refining the interface.

### Prompt 2

change the bus stop to dropdown so that it shows the bus numbers only after the user has clicked on the bus stop. changen othing else

**What came back / what I did:** The agent changed the bus-stop cards into dropdowns. I kept the change.

### Prompt 3

ROLE: You are a senior full-stack developer working in this existing Vite + React project.

GOAL: Add a live bus arrival panel to the screen, fed by two new serverless functions.

1. api/bus.js—accepts a BusStopCode query parameter, defaults to 04121, calls https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival and returns a simplified list: for each service, the ServiceNo and the minutes until each of the next two buses, worked out from the EstimatedArrival timestamps.
2. api/health.js—reports whether the key is configured (keyConfigured) and whether LTA answered, including the upstream HTTP status code, for checking the service without opening the app. It must never print the key or any part of it.
3. On the screen, a panel listing each service with its next two arrivals in minutes, refreshing every 20 seconds, which matches both the cache below and how often LTA itself updates, showing "Arriving" under one minute, and showing a plain sentence when a service has no buses running.

OUTPUT: Write the two handlers TWICE, in the two shapes this toolchain needs.
(a) Standalone files at api/bus.js and api/health.js in the PROJECT ROOT, siblings of package.json and never inside src/. This is the form Vercel runs.
(b) The same two routes registered in the server entry file this project already has, server.ts at the root or api/index.ts, as app.get("/api/bus") and app.get("/api/health"), importing the shared handler rather than duplicating the logic. This is the form the AI Studio preview runs. Neither form works in the other place, so I need both.
Make sure package.json contains "type": "module", which Vercel requires for .js files in api/ outside a framework; otherwise name the two files api/bus.mjs and api/health.mjs.
Read the credential with process.env.LTA_ACCOUNT_KEY and send it as the HTTP header named exactly AccountKey. BEFORE the fetch, if that variable is missing or empty, return 503 with {"error":"LTA_ACCOUNT_KEY is not set. Add it in Vercel and redeploy."} and do not call LTA at all; never let an unset variable reach the header, because JavaScript sends the word "undefined" and LTA answers 401 exactly as it would for a wrong key.
AFTER the fetch, check response.ok before reading the body. LTA returns an empty body on 401, so calling response.json() on a failed reply throws and crashes the function. On a non-2xx reply, return the upstream status and a one-line reason in your own JSON instead.
Set Cache-Control: s-maxage=20, stale-while-revalidate=40 on the bus response, because LTA refreshes every 20 seconds. Treat an empty Services array as "no buses running", not as an error. Note also that LTA returns NextBus2 and NextBus3 as objects whose fields are all empty strings when there is no such bus: treat an empty EstimatedArrival as no bus and omit it from the list, rather than computing a time from it. Never emit NaN or null as a minute. In the footer, add this exact line, which is what the licence asks for:
"Contains information from LTA DataMall Bus Arrival, accessed [DATE], made available under the terms of the Singapore Open Data Licence version 1.0, data.gov.sg/open-data-licence." Leave my existing screens working.

GUARDRAILS: Never write the key into any file, any comment, or the README. Never create a variable whose name starts with VITE_. Never call datamall2.mytransport.sg from browser code; every LTA call happens inside api/. Never print the key, or any part of it, in a response or a log. No new npm packages. No database, no login. Do not use LTA's name or logo in a way that suggests this app is official or endorsed.

CONTEXT: Deployed on Vercel from GitHub. The key lives only in a Vercel environment variable named LTA_ACCOUNT_KEY. A real response from the endpoint looks like this:
[PASTE 15–25 LINES OF THE REAL RESPONSE HERE]

**What came back / what I did:** The agent added the live-arrival panel, bus endpoint and health endpoint. I kept them and used them as the basis of the live-data version of the product.

### Prompt 4

create a new tab for nearby bus stops. change nothing else

**What came back / what I did:** The agent separated Nearby Bus Stops and Live Bus Arrivals into tabs. I kept the change.

### Prompt 5

Add a floating action button on the Nearby Bus Stops screen that allows users to toggle between the current list view and a visual map view showing pin locations of bus stops. change nothing else

**What came back / what I did:** The agent created a simulated map view and toggle. I kept it initially but later replaced and eventually removed the map idea.

### Prompt 6

remove the scrollbar. change nothing else

**What came back / what I did:** The scrollbars were hidden while scrolling remained available. I kept the change.

### Prompt 7

add a'favourites' tab for users to add any bus stops. the tab should only show bus stops that have been added. change nothing else

**What came back / what I did:** The agent added favourites with saved stops and local storage. I kept the feature and later refined how users add stops.

### Prompt 8

make all tabs and the traffic advisory carousel thinner and less bulky. change nothing else

**What came back / what I did:** The agent reduced the size of the tabs and advisory carousel. I kept the visual change.

### Prompt 9 — did not complete

for the traffic advisory, allow users to click on each of the advisory to read more on the traffic. change nothing else

**What came back / what I did:** The task was cancelled before completion. I did not treat it as finished and continued with another prompt.

### Prompt 10

Fix the errors in the app

**What came back / what I did:** The agent found an HTML error caused by a button being placed inside another button and changed the structure to fix it. I kept the fix.

### Prompt 11

pls continue running to previous task

**What came back / what I did:** The agent reported that the clickable traffic-advisory details were active and the app built successfully. I continued with that version.

### Prompt 12

for the favourites tab, change the dropdown bar to allow the user to search for the bus stop code. and under the quick add popular stops, change it to nearby bus stop

**What came back / what I did:** The agent made the favourites selector searchable and renamed the quick-add section. I kept the change.

### Prompt 13

replace the searchbar in 'nearby bus stops' with google maps, showing the user and nearby bus stops. change nothing else

**What came back / what I did:** The agent installed a Google Maps package and added a map, location pin and a new Maps API-key requirement. I kept it temporarily, but later decided the added complexity was unnecessary and removed the map.

### Prompt 14

remove the bottom right 'map view option'. change nothing else

**What came back / what I did:** The floating map-view button was removed. I kept the change.

### Prompt 15

change the tab name of "live API" to something more appropriate. and show the name of the bus stop and the address of the bus stop. change nothing else

**What came back / what I did:** The tab became “Live Arrivals” and the stop name, road and code were displayed. I kept the change.

### Prompt 16

remove the map feature on the nearby page. change nothing else

**What came back / what I did:** The agent removed the Google Map and restored the list/search view. I kept this version.

### Prompt 17

remove the arrows on the traffic advisory and allow users to swipe the traffic advisory. change nothing else

**What came back / what I did:** The agent removed the arrows and said touch swipe and desktop click-and-drag were supported. I kept the swipe idea, but manual testing showed desktop click-and-drag did not actually work, so I asked again.

### Prompt 18 — debugging after manual testing

the click and drag feature is not working on my computer, fix it. change nothing else

**What came back / what I did:** The agent traced the problem to the desktop mouse handling and changed the event listeners and drag thresholds. I kept the fix.

### Prompt 19

add a sliding animation for both click and drag and swipe feature. change nothing else

**What came back / what I did:** The agent added visible sliding and snap-back animations. I kept the change.

### Prompt 21

when users search for a bus stop code that does not exist, display a text that says "bus stop code does not exist, try another code". change nothing else

**What came back / what I did:** The agent reported that the message would appear only for nonexistent codes in Nearby, Favourites and Live Arrivals. I tested it myself and found that this was not true, so I asked for another fix.

### Prompt 22 — debugging after manual testing

i found an error in the app. the text " bus code does not exist, try another bus code" shows regardless whether the bus stop code exist or not. fix it

**What came back / what I did:** The agent changed the validation and shared bus-stop registry across six files so valid codes cleared the error and invalid codes produced the message. I kept the corrected version.

### Prompt 23 — revision after the Week 5 heuristic evaluation

ROLE: You are a senior front-end developer revising an existing React web app.

GOAL: Revise the front end of SG Bus Tracker for people waiting for a bus in Singapore — residents who ride the same two or three stops daily, and visitors and newcomers who do not know a single stop code. Their job on this product is "tell me when my bus is coming, and whether anything is going to make it late." Three screens:

1. FIND A STOP: one search box that accepts a stop name, a postal code, or a five-digit stop code, and shows matching stops to pick from. Below it, a list of stops near a location, with a line on screen naming which location that list is measured from and a control to change it. The user types whatever they know, or accepts the named location; they see stops they recognise and can tap one. It worked when someone who has never memorised a stop code reaches their stop without leaving the product to look anything up.
2. THIS STOP: the arrivals for one chosen stop. Every service at that stop in one list, each row carrying the next three arrival times, how full the bus is, and whether it is wheelchair accessible — all of it in this one view, with no second list further down repeating it. A line saying when the arrivals were last updated, and a refresh control. Any traffic advisory that affects the services at this stop sits alongside them. The user reads one row; they see everything they need about that bus without scrolling to a second panel.
3. SAVED STOPS: the stops this user has saved, each opening screen 2. The user saves a stop and removes a saved stop using the same control in both places. It worked when a stop saved by mistake is gone in one tap.

The revision must make all of the following true, because classmates testing the current version found each one:
a) A stop found by name, postal code or code on screen 1 is the same stop that screen 2 and screen 3 show; the same search resolves the same way wherever it is typed. Codes 50161 and 50169 currently return nothing on one screen and resolve on another.
b) The services listed for a stop are identical everywhere that stop appears. If two lists must mean different things, each says on screen what it means. Stop 09048 currently lists 14, 65, 106, 111, 174 in one place and 7, 14, 16, 65, 106, 111, 123, 175, 502 in another.
c) Each screen says in one line what it is for and what to give it, before the user has typed anything.
d) The stop code box accepts only what could be a stop code and says so as the user types, rather than accepting "ABCDE" and failing after they submit.
e) When a search fails, the results from the previous search are cleared or plainly marked as no longer current, so the error and the data on screen never contradict each other.
f) A saved stop can be unsaved from the same control that saved it, and the list returns to what it was.
g) Where a third arrival does not exist, the screen says in words why — no more buses tonight, or only two are known — instead of "N/A".
h) A traffic advisory shows the time it was issued and the time it was last checked, and refreshes while the page is open. If an advisory is example data rather than live, it is labelled as example data on the screen, and the word LIVE does not appear near it.

Keep these exactly as they are. Classmates named each one as working: the arrivals auto-refresh roughly every twenty seconds with a visible countdown and an advancing "Updated" time; the clean, uncluttered look; saved stops as a reason to come back; traffic advisories sitting beside arrivals rather than on a page of their own; the manual refresh control; the clear button in the search box; and the guidance text on the saved-stops screen.

OUTPUT: A running app. Keep every invented value in ONE data file of its own, with at least 40 rows, so the screen looks real. One component per screen or section. Move between screens without reloading the page. Readable on a phone at arm's length. When you are done, list the files you created or changed and what each one holds, and list separately every change you made for items (a) through (h) above, saying which file it is in, so I can point a classmate at it.

GUARDRAILS: Screens, invented data, and the live bus and traffic sources this product already reads. Do NOT call the Gemini API or any other model. Do NOT add any new outside service beyond the ones already in use. No database, no login, no user accounts, no analytics. Saved stops live in the browser only. No features I did not list — in particular, do not add journey planning, fares, maps, or notifications. No real company's name, logo, or trademark beyond the transport operators the live data itself names. Invented names and numbers only where data is invented, nothing confidential.

CONTEXT: Individual Problem Set 2, Step 5 revision, for MGMT 6110 Human-AI Collaboration at SMU. This is a revision of a product three classmates heuristically evaluated in Week 5; each item (a) to (h) answers a finding one of them left on my Disqus board, and I have to reply to each of them saying what changed and where to see it. Deployed to Vercel and opened on a phone. I am not a programmer: when you make a choice I did not specify, say so in one line rather than burying it. If any item above cannot be done without breaking something in the "keep these exactly as they are" list, stop and tell me which, rather than quietly trading one for the other.

**What came back / what I did:** The agent rebuilt the product around three screens, and the old overlap between the nearby, favourites and live arrival sections went with it. I tested all twelve findings: eight were cleanly fixed, and four survived because the data was still demonstration data, so I kept this version and wrote the next prompt to replace it.

### Prompt 24 — replacing demonstration data with live sources

ROLE: You are a senior full-stack developer working on a React app deployed on Vercel. You may add serverless functions under /api.

GOAL: Replace three pieces of SG Bus Tracker that currently run on bundled demo data with real data, without changing anything else a user can see. The users are people waiting for a bus in Singapore, including visitors who know a postal code but not a single bus stop code. Their job is "tell me when my bus is coming, and whether anything is going to make it late." The three pieces:

1. TRAFFIC ADVISORIES — real, from LTA DataMall Traffic Incidents (https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html, endpoint /ltaodataservice/TrafficIncidents, AccountKey header). Each incident comes back with a Type, a Latitude, a Longitude and a Message whose text begins with the date and time the incident was reported. Parse that reported time and show it. On screen, an advisory shows what happened, where, the real reported time, and how long ago that was, counted from the clock now — never a fixed number written into the code. Only advisories whose coordinates fall within 2 km of the stop being viewed appear on that stop; if none do, the panel says there are no incidents reported near this stop. The badge reading EXAMPLE ADVISORY DATA (DEMONSTRATION) is removed once the data is real, and the panel names LTA DataMall as the source with the time it was last fetched. It worked when the time shown beside an advisory matches the time in the incident message, and the "ago" figure advances while the page stays open.

2. NEAREST STOPS FROM A POSTAL CODE — real, using OneMap to turn a Singapore 6-digit postal code into coordinates (https://www.onemap.gov.sg/api/common/elastic/search with searchVal set to the postal code and returnGeom=Y), then ranking bus stops by true distance from those coordinates. The user types a postal code anywhere in Singapore; they see the stops actually closest to it, each with its real distance in metres, nearest first. Nothing beyond 1.5 km is listed. If fewer than five stops fall inside that radius, the screen shows however many there are and says so, rather than padding the list with stops kilometres away. The eight hard-coded areas in the current Change Location control are replaced by this, with a small number of them kept only as one-tap shortcuts. It worked when a postal code in Sengkang returns Sengkang stops, and no stop in the list is a two-hour walk away.

3. STOP NAME SEARCH ACROSS EVERY STOP — real, from LTA DataMall Bus Stops (/ltaodataservice/BusStops), which returns every bus stop in Singapore with its code, road name, description and coordinates, 500 records per request, paged with $skip. Fetch the full set once, hold it, and search it. Typing part of a stop's name or road returns every stop whose description or road name contains it, ordered by distance from the location currently in use. "Bedok", "Siglap" and "Siglap Community Centre" must each return stops. It worked when a name that exists anywhere in Singapore is found, and the heading over the search box is true about what can be searched.

Everything else stays exactly as it is now. Do not redesign, rename or move anything. Specifically keep: the three tabs Find a Stop, This Stop and Saved Stops; the one-line banner on each tab; live arrivals auto-refreshing about every twenty seconds with a visible countdown and an advancing "Updated" time; the manual Refresh button; three arrivals per service in one list with colour-coded occupancy, wheelchair symbol and deck type; the sentences "Only two arrivals scheduled" and "No more buses tonight (last bus in service)" where a third arrival does not exist; the star that saves and unsaves a stop in one tap; the guidance line on Saved Stops; the inline recognition messages while typing a code or postal code; the clearing of previous results when a search finds nothing; and the LTA DataMall attribution in the footer.

Two bugs to fix while you are in there:
- The location chosen in Change Location is lost when the user switches tabs and comes back. It should persist.
- Saved Stops arrives with stops already in it on a browser that has never opened the site. It should start empty.

OUTPUT: A running app plus the serverless functions it needs. Both LTA DataMall and OneMap refuse browser requests, so every call to them goes through a function under /api that the page calls instead, and the DataMall AccountKey is read from an environment variable on the server and never reaches the browser or the repository. The full bus stop list is fetched once and cached rather than refetched on each keystroke; say in one line where you cached it and how long it lives.

A lookup that costs a network call fires when the input is complete — six digits for a postal code, five for a stop code — not on every keystroke and not on a timer. Searching stop names never calls the network, because the stop list is already held. Whenever a call is in flight, the screen says so where the results will appear, and a call is abandoned if the user changes the input before it returns, so an older answer can never overwrite a newer one.

Keep any remaining invented values in ONE data file of its own. One component per screen or section. Move between screens without reloading the page. Readable on a phone at arm's length. When you are done, list the files you created or changed and what each holds; list the environment variables I must set in Vercel; and say what each of the three screens shows if its upstream source is unreachable.

GUARDRAILS: Only these sources — LTA DataMall (Traffic Incidents, Bus Stops, and the bus arrival endpoint already in use) and OneMap search. Do NOT call the Gemini API or any other model. Do NOT add any further outside service. No database, no login, no user accounts, no analytics. Saved stops stay in the browser only. No new features: no journey planning, no fares, no map rendering, no notifications. Do not write any API key, token or account number into the code or into any file in the repository. Do not invent, round or prettify any value that comes from a real source — if a field is missing, say it is missing rather than substituting a plausible number, and never write a relative time into the code. Keep the LTA DataMall attribution the licence requires.

CONTEXT: Individual Problem Set 2, Step 5 revision, for MGMT 6110 Human-AI Collaboration at SMU. The current build answered most of a heuristic evaluation by three classmates, but three of their findings survive because the data is demonstration data: the advisories carry invented "6 mins ago" labels against issue times fourteen hours old, stop-name search covers only about eight areas so "Bedok" and "Siglap" return nothing, and the nearest-stop list has offered a stop 10.7 km away described as a 143-minute walk. Replacing the data is the repair. I am not a programmer: when you make a choice I did not specify, say so in one line rather than burying it. If any endpoint above needs a token or registration step I have not given you, or returns something different from what I described, stop and tell me which one rather than writing code around a guess.

**What came back / what I did:** The agent added serverless functions for the stop catalogue, the incidents and the postal lookup, and the app began loading 5,210 real stops with real, correctly timestamped advisories. Testing showed it had also given every one of those stops the same fallback service list — "bedok" returned 140 stops all claiming buses 14, 65 and 106 — and was still making no arrival request at all, so I did not treat this as finished.

### Prompt 25 — debugging after manual testing

ROLE: You are a senior full-stack developer fixing a live React app on Vercel. You may add or change serverless functions under /api.

GOAL: SG Bus Tracker now loads 5,210 real bus stops from LTA DataMall, and the traffic advisories are real and correctly timestamped. Both of those are working and must not be touched. But the app is showing invented bus data on every one of those stops, and I have to hand this to classmates who will check it. Fix these four things and nothing else.

1) EVERY STOP CLAIMS THE SAME THREE BUSES. Searching "Bedok" returns 140 stops and every single one shows SERVICES: 14, 65, 106. Searching "Jurong" returns 221 stops and every one shows SERVICES: 14, 65, 106. Those are the services at Orchard Boulevard. The cause is that /api/bus-stops returns the LTA BusStops catalogue, which carries only code, name, road, latitude and longitude — it has no services in it — and something in the app is filling the gap with a fixed list. Get the real services for a stop from LTA DataMall BusRoutes (/ltaodataservice/BusRoutes), which gives a ServiceNo against each BusStopCode, paged 500 at a time with $skip exactly like BusStops; build the stop-to-services mapping from it once and hold it beside the stop catalogue. It worked when Bedok Int (84009) lists the services that actually call there and no two unrelated stops in different towns show an identical list.

2) NEVER SHOW A FALLBACK SERVICE LIST. If the services for a stop are not known, the card says they are not known. Do not substitute, do not guess, do not reuse another stop's list. A blank is honest; 14, 65, 106 everywhere is not.

3) THE ARRIVALS ARE INVENTED. The app currently makes only two network calls in its whole life, /api/bus-stops and /api/incidents. Every arrival time, occupancy level and deck type on the This Stop screen is generated in the browser. Bedok Int shows one service, "14 to Loop / Terminal", with arrivals of 4, 11 and 19 minutes that came from nowhere. Fetch real arrivals from LTA DataMall BusArrivalv2 (/ltaodataservice/v3/BusArrival?BusStopCode=<code>) through a function under /api, and show what it returns: the services actually arriving, their estimated arrival times, the Load value for how full the bus is, the Feature value for wheelchair access and the Type value for deck type. Where the endpoint returns nothing for a service, keep the existing sentences "Only two arrivals scheduled" and "No more buses tonight (last bus in service)" rather than inventing a time. If the endpoint cannot be reached at all, the screen says the arrivals are unavailable and when it last succeeded — it does not fall back to made-up times. It worked when the services listed on This Stop are the same services listed on the search card for that stop, and when a stop with twenty services shows twenty.

4) NAME SEARCH RANKS BY THE WRONG THING. Typing "Bedok" puts "Blk 646, Bedok Reservoir Rd" first and "Bedok Int" thirty-seventh, because results are ordered by distance from whatever location the Change Location control happens to hold. Order name and road searches by how well they match what was typed — a stop whose name begins with the text before one that merely contains it, a name match before a road-name match — and use distance only to separate results that match equally well. On a name search, do not label rows with a walking time; "~159 min walk" is noise when someone is searching for a place across the island. Keep distance and walking time on the nearby list, where they mean something.

Change nothing else. Keep exactly as they are: the three tabs and their one-line banners; the real traffic advisories with their real issue times, the 2 km filter, the "No traffic incidents reported near this stop" message and the "Source: LTA DataMall · Fetched at …" line; the 1.5 km nearby list with its real distances and its count; the postal code and stop code recognition messages while typing; the clearing of previous results when a search finds nothing; the auto-refresh countdown, the Updated time and the Refresh button; the star that saves and unsaves in one tap; the guidance line on Saved Stops; and the LTA DataMall attribution in the footer.

OUTPUT: A running app. Every call to LTA DataMall goes through a function under /api, and the AccountKey stays in a Vercel environment variable, never in the browser or the repository. BusRoutes is large, so fetch and cache it the same way BusStops is already fetched and cached, and say in one line where you put it and how long it lives. Arrivals are per stop and must not be cached beyond the refresh interval already on screen. When you are done: list the files you created or changed and what each holds; name any new environment variable; and for each of the four items above, say in one line what it does now and which file to look in. Then tell me what stop 84009 shows, what stop 09048 shows, and what a search for "Bedok" returns as its first three results, so I can check without reading code.

GUARDRAILS: Only LTA DataMall (BusStops, BusRoutes, BusArrivalv2, TrafficIncidents) and the OneMap search already in use. Do NOT call the Gemini API or any other model. Do NOT add any further outside service. No database, no login, no user accounts, no analytics. Saved stops stay in the browser only. No new features and no redesign — this is a data-correctness fix, not a revision. Do not write any API key or token into the code or into any file in the repository. Above all: do not invent, substitute, round or prettify any value that is meant to come from a real source. If a field is missing or a call fails, say so on screen. There must be no hard-coded service number, arrival time, occupancy level or deck type left anywhere in the app when you are finished.

CONTEXT: Individual Problem Set 2, Step 5 revision, MGMT 6110 Human-AI Collaboration at SMU. Three classmates heuristically evaluated this product and one of their findings was that the same stop showed different bus services in two places; another was that data presented as live was not live. Both have come back in a worse form now that the stop catalogue is real and the bus data is not. Whoever grades this can type "Bedok" and see 140 stops all claiming buses 14, 65 and 106. I am not a programmer: when you make a choice I did not specify, say so in one line rather than burying it. If BusRoutes or BusArrivalv2 needs a permission my AccountKey does not have, or returns something different from what I described, stop and tell me which one rather than writing code around a guess.

**What came back / what I did:** The agent added the bus routes mapping, a real arrivals endpoint and match-based search ordering. Testing confirmed all four — stop 84009 went from one service to thirty-eight, the five services running at 00:03 matched the endpoint to the minute, and postal code 545078 resolved to Compass One with Sengkang Int at 95 m — so I kept it, noting two new faults for the next prompt: the postal lookup was calling itself in a loop, and the postal code on a stop card no longer matched the stop named on it.

### Prompt 26 — debugging after manual testing

ROLE: You are a senior full-stack developer fixing a live React app on Vercel.

GOAL: Two faults in the Find a Stop search box. Fix only these. Change nothing else on any screen.

1) A POSTAL CODE SEARCH FLASHES A FALSE FAILURE WHILE IT IS BEING TYPED. To type the six-digit postal code 545078, the user must pass through 54507, five digits. At five digits the app decides the input is a stop code, and shows a red line reading "Stop code 54507 does not exist in registry. Try another 5-digit code or enter a stop name." together with a full yellow panel reading "No matching bus stops found for '54507' — Previous results have been cleared…". The sixth keystroke clears both and the postal code resolves correctly to COMPASS ONE (SENGKANG SQUARE) with 147 stops. So the app already handles a finished postal code properly; the fault is that it announces failure on an input that is still an unfinished one.
The rule to apply: while the input is nothing but digits and is shorter than six, it could still become either a stop code or a postal code, so the app does not call it a failure. It says nothing, or it says it is waiting for more digits. A five-digit input that matches no stop is only reported as not found once it cannot become a postal code — because the user typed a non-digit, left the field, pressed Enter, or typed a sixth digit that does not resolve either.
It worked when a person typing 545078 at ordinary speed never sees the words "No matching bus stops found" or "does not exist in registry", and the results below the box do not jump as a panel appears and disappears.
Keep the messages that are right: the green "5-digit stop code recognised: …" and "6-digit postal code verified: …" lines, the "Resolving postal code … with OneMap…" waiting line, and the genuine not-found panel when a search really has failed.

2) THE POSTAL LOOKUP IS CALLING ITSELF IN A LOOP. After one postal code is typed, /api/postal?postalCode=545078 keeps firing about fourteen times a second and does not stop. In a few minutes of ordinary use it made roughly nine thousand requests for that one search. Nothing on screen shows it; the results look correct.
This is almost certainly an effect whose dependencies are rebuilt on every render, so each response triggers another request. Find it and stop it. One completed postal code means exactly one lookup. The result is held until the input changes. If the user edits the input while a lookup is in flight, that lookup is abandoned so that an older answer can never replace a newer one.
It worked when typing one postal code, waiting two minutes, and watching the browser's Network panel shows one request to /api/postal and no more.

Change nothing else. Keep exactly as they are: the three tabs and their banners; the real services from BusRoutes; the real arrivals from BusArrivalv2 with their occupancy, wheelchair and deck markings; the real traffic advisories with their 2 km filter and fetched-at line; the 1.5 km nearby list with its real distances; the match-based ordering of name searches; the star that saves and unsaves; and the LTA DataMall attribution.

OUTPUT: A running app. Tell me which files you changed, and for each of the two items say in one line what the code does now. Then tell me, for an input typed one character at a time as 5, 54, 545, 5450, 54507, 545078, exactly what appears under the search box at each of those six moments, so I can check it by typing rather than by reading code. Say how many requests to /api/postal a single completed postal code now causes.

GUARDRAILS: No redesign, no new features, no new outside service — this is a defect fix. Do NOT call the Gemini API or any other model. Do not write any API key or token into the code or into any file in the repository. Do not silence the loop by adding a delay, a throttle or a request cache in front of it; find what is re-triggering it and stop that, so the fix holds when someone types quickly. Do not invent or substitute any value that comes from a real source.

CONTEXT: Individual Problem Set 2, Step 5 revision, MGMT 6110 Human-AI Collaboration at SMU. Three classmates heuristically evaluated this product; two of their findings were about the screen contradicting itself — an error message shown while the data on screen said otherwise, and a message that did not say what had actually gone wrong. A false "no matching bus stops found" on every postal code search is the same fault returning, and postal code search is the feature I added because one of them asked for it. The request loop is not something they can see, but it will exhaust the OneMap endpoint or my Vercel function quota while they are testing. I am not a programmer: when you make a choice I did not specify, say so in one line rather than burying it.

**What came back / what I did:** The agent changed how the search box decides an input has failed, and removed whatever was re-triggering the postal lookup. I tested both: typing 54507 now shows a neutral "5 digits needed… 5 digits typed" line instead of a red error and a "no matching bus stops found" panel, and a completed postal code makes exactly one request to the postal endpoint and stays at one, so I kept this version.
