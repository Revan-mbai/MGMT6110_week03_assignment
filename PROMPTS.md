## Build log

### Prompt 1

> ROLE: You are a senior front-end developer building a React web app.
>
> GOAL: Build the front end of a bus tracking app, a web product for everyone in singapore. Their job on this product is to track bus arrival details in real time. Screens:
>
> 1. [SCREEN 1: shows all nearby bus stops and below the header should have a carousell showing the latest traffic incidents]
> 2. [SCREEN 2, shows the selected bus stop and the buses available at that stop with the arrival times of each bus updated in real time. if there are any buses that are delayed due to heavy traffic and/or incidents, a warning label should appear beside the bus number]
>
> OUTPUT: A running app. Keep every invented value in ONE data file of its own, with at least 5 rows, so the screen looks real. One component per screen or section. Move between screens without reloading the page. Readable on a phone at arm's length. When you are done, list the files you created and what each one holds.
>
> GUARDRAILS: Screens and invented data only. Do NOT call the Gemini API or any other model. Do NOT call any outside service or fetch from any URL. No database, no login, no user accounts, no analytics. No features I did not list. No real company's name, logo, or trademark. Invented names and numbers only, nothing confidential.
>
> CONTEXT: I am not a programmer: when you make a choice I did not specify, say so in one line rather than burying it.

**What came back / what I did:** The agent created the initial screens, sample data and navigation. I kept the result and continued refining the interface.

### Prompt 2

> change the bus stop to dropdown so that it shows the bus numbers only after the user has clicked on the bus stop. changen othing else

**What came back / what I did:** The agent changed the bus-stop cards into dropdowns. I kept the change.

### Prompt 3

> ROLE: You are a senior full-stack developer working in this existing Vite + React project.
>
> GOAL: Add a live bus arrival panel to the screen, fed by two new serverless functions.
>
> 1. api/bus.js—accepts a BusStopCode query parameter, defaults to 04121, calls https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival and returns a simplified list: for each service, the ServiceNo and the minutes until each of the next two buses, worked out from the EstimatedArrival timestamps.
> 2. api/health.js—reports whether the key is configured (keyConfigured) and whether LTA answered, including the upstream HTTP status code, for checking the service without opening the app. It must never print the key or any part of it.
> 3. On the screen, a panel listing each service with its next two arrivals in minutes, refreshing every 20 seconds, which matches both the cache below and how often LTA itself updates, showing "Arriving" under one minute, and showing a plain sentence when a service has no buses running.
>
> OUTPUT: Write the two handlers TWICE, in the two shapes this toolchain needs.
> (a) Standalone files at api/bus.js and api/health.js in the PROJECT ROOT, siblings of package.json and never inside src/. This is the form Vercel runs.
> (b) The same two routes registered in the server entry file this project already has, server.ts at the root or api/index.ts, as app.get("/api/bus") and app.get("/api/health"), importing the shared handler rather than duplicating the logic. This is the form the AI Studio preview runs. Neither form works in the other place, so I need both.
> Make sure package.json contains "type": "module", which Vercel requires for .js files in api/ outside a framework; otherwise name the two files api/bus.mjs and api/health.mjs.
> Read the credential with process.env.LTA_ACCOUNT_KEY and send it as the HTTP header named exactly AccountKey. BEFORE the fetch, if that variable is missing or empty, return 503 with {"error":"LTA_ACCOUNT_KEY is not set. Add it in Vercel and redeploy."} and do not call LTA at all; never let an unset variable reach the header, because JavaScript sends the word "undefined" and LTA answers 401 exactly as it would for a wrong key.
> AFTER the fetch, check response.ok before reading the body. LTA returns an empty body on 401, so calling response.json() on a failed reply throws and crashes the function. On a non-2xx reply, return the upstream status and a one-line reason in your own JSON instead.
> Set Cache-Control: s-maxage=20, stale-while-revalidate=40 on the bus response, because LTA refreshes every 20 seconds. Treat an empty Services array as "no buses running", not as an error. Note also that LTA returns NextBus2 and NextBus3 as objects whose fields are all empty strings when there is no such bus: treat an empty EstimatedArrival as no bus and omit it from the list, rather than computing a time from it. Never emit NaN or null as a minute. In the footer, add this exact line, which is what the licence asks for:
> "Contains information from LTA DataMall Bus Arrival, accessed [DATE], made available under the terms of the Singapore Open Data Licence version 1.0, data.gov.sg/open-data-licence." Leave my existing screens working.
>
> GUARDRAILS: Never write the key into any file, any comment, or the README. Never create a variable whose name starts with VITE_. Never call datamall2.mytransport.sg from browser code; every LTA call happens inside api/. Never print the key, or any part of it, in a response or a log. No new npm packages. No database, no login. Do not use LTA's name or logo in a way that suggests this app is official or endorsed.
>
> CONTEXT: Deployed on Vercel from GitHub. The key lives only in a Vercel environment variable named LTA_ACCOUNT_KEY. A real response from the endpoint looks like this:
> [PASTE 15–25 LINES OF THE REAL RESPONSE HERE]

**What came back / what I did:** The agent added the live-arrival panel, bus endpoint and health endpoint. I kept them and used them as the basis of the live-data version of the product.

### Prompt 4

> create a new tab for nearby bus stops. change nothing else

**What came back / what I did:** The agent separated Nearby Bus Stops and Live Bus Arrivals into tabs. I kept the change.

### Prompt 5

> Add a floating action button on the Nearby Bus Stops screen that allows users to toggle between the current list view and a visual map view showing pin locations of bus stops. change nothing else

**What came back / what I did:** The agent created a simulated map view and toggle. I kept it initially but later replaced and eventually removed the map idea.

### Prompt 6

> remove the scrollbar. change nothing else

**What came back / what I did:** The scrollbars were hidden while scrolling remained available. I kept the change.

### Prompt 7

> add a'favourites' tab for users to add any bus stops. the tab should only show bus stops that have been added. change nothing else

**What came back / what I did:** The agent added favourites with saved stops and local storage. I kept the feature and later refined how users add stops.

### Prompt 8

> make all tabs and the traffic advisory carousel thinner and less bulky. change nothing else

**What came back / what I did:** The agent reduced the size of the tabs and advisory carousel. I kept the visual change.

### Prompt 9 — did not complete

> for the traffic advisory, allow users to click on each of the advisory to read more on the traffic. change nothing else

**What came back / what I did:** The task was cancelled before completion. I did not treat it as finished and continued with another prompt.

### Prompt 10

> Fix the errors in the app

**What came back / what I did:** The agent found an HTML error caused by a button being placed inside another button and changed the structure to fix it. I kept the fix.

### Prompt 11

> pls continue running to previous task

**What came back / what I did:** The agent reported that the clickable traffic-advisory details were active and the app built successfully. I continued with that version.

### Prompt 12

> for the favourites tab, change the dropdown bar to allow the user to search for the bus stop code. and under the quick add popular stops, change it to nearby bus stop

**What came back / what I did:** The agent made the favourites selector searchable and renamed the quick-add section. I kept the change.

### Prompt 13

> replace the searchbar in 'nearby bus stops' with google maps, showing the user and nearby bus stops. change nothing else

**What came back / what I did:** The agent installed a Google Maps package and added a map, location pin and a new Maps API-key requirement. I kept it temporarily, but later decided the added complexity was unnecessary and removed the map.

### Prompt 14

> remove the bottom right 'map view option'. change nothing else

**What came back / what I did:** The floating map-view button was removed. I kept the change.

### Prompt 15

> change the tab name of "live API" to something more appropriate. and show the name of the bus stop and the address of the bus stop. change nothing else

**What came back / what I did:** The tab became “Live Arrivals” and the stop name, road and code were displayed. I kept the change.

### Prompt 16

> "api/bus.js—accepts a BusStopCode query parameter, defaults to 04121, calls
> https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival and returns a
> simplified list: for each service, the ServiceNo and the minutes until each of the
> next two buses, worked out from the EstimatedArrival timestamps.
> api/health.js—reports whether the key is configured (keyConfigured) and whether LTA
> answered, including the upstream HTTP status code, for checking the service without
> opening the app. It must never print the key or any part of it."
>
> create something similar to the above api but for live location of the user, name it api/location.js

**What came back / what I did:** The agent created `api/location.js` and registered it with the server. I kept the API, although I later removed the map from the Nearby page.

### Prompt 17

> remove the map feature on the nearby page. change nothing else

**What came back / what I did:** The agent removed the Google Map and restored the list/search view. I kept this version.

### Prompt 18

> remove the arrows on the traffic advisory and allow users to swipe the traffic advisory. change nothing else

**What came back / what I did:** The agent removed the arrows and said touch swipe and desktop click-and-drag were supported. I kept the swipe idea, but manual testing showed desktop click-and-drag did not actually work, so I asked again.

### Prompt 19 — debugging after manual testing

> the click and drag feature is not working on my computer, fix it. change nothing else

**What came back / what I did:** The agent traced the problem to the desktop mouse handling and changed the event listeners and drag thresholds. I kept the fix.

### Prompt 20

> add a sliding animation for both click and drag and swipe feature. change nothing else

**What came back / what I did:** The agent added visible sliding and snap-back animations. I kept the change.

### Prompt 21

> when users search for a bus stop code that does not exist, display a text that says "bus stop code does not exist, try another code". change nothing else

**What came back / what I did:** The agent reported that the message would appear only for nonexistent codes in Nearby, Favourites and Live Arrivals. I tested it myself and found that this was not true, so I asked for another fix.

### Prompt 22 — debugging after manual testing

> i found an error in the app. the text " bus code does not exist, try another bus code" shows regardless whether the bus stop code exist or not. fix it

**What came back / what I did:** The agent changed the validation and shared bus-stop registry across six files so valid codes cleared the error and invalid codes produced the message. I kept the corrected version.

### Prompt 23 — back-end testing

> Back-end criteria
>
> BE1 — Empty data and midnight cases
>
> Evidence: I inspected [real source response or state that none was inspected] and observed [result]. In controlled tests, empty service/advisory lists and missing arrival times produced [results]. With the simulated time set to 23:58 and an arrival at 00:03 the following day, the app displayed [waiting time]. Supporting evidence: [responses and test output].
>
> BE2 — Service health and diagnosis
>
> Evidence: The health endpoint at [path] returned [normal response]. During a simulated upstream failure, it returned [failure response], which [did/did not] distinguish application availability from source availability. I traced the failed request to [redacted log reference], which showed [useful diagnostic details].
>
> BE3 — Credential protection
>
> Evidence: I inspected browser-delivered code, network requests, and health/error responses and found [result]. Checks of current repository files found [result], while a full Git-history scan found [result]. The scope and findings are recorded in [redacted scan report]. No credential values are included in this assessment.
>
> BE4 — Appropriate request frequency
>
> Evidence: The documented or justified refresh intervals were [arrival interval] and [advisory interval], supported by [reference]. Ten equivalent requests within each interval produced [arrival count] and [advisory count] actual upstream calls. Cache-expiry and different-stop tests showed [results]. Supporting evidence: [server logs and configuration].
>
> BE5 — Understandable failures and recovery
>
> Evidence: In controlled tests, loading displayed “[message],” refusal displayed “[message],” and an unreachable source displayed “[message].” Failures appeared after [seconds], and retained data [was/was not] labelled stale. After restoring the source, retrying [result], with the selected stop [retained/lost]. Supporting evidence: [recording or test log].
>
> For any point you have not tested, write: “I have not yet tested [specific requirement], so this part remains unverified.”
>
> do all this back end tests and fill in the blanks

**What came back / what I did:** The agent ran the back-end checks and produced evidence for all five criteria. It also edited `api/bus.js` even though my request was for testing and evidence, so this is a case where the agent changed production code during a task I had framed as testing. I used the test results, but the log does not show me reviewing or reverting that code change.

## Point where I stopped prompting and did something by hand

The log does not show me manually editing the source code. It does show two clear points where I stopped relying on the agent's report and tested the product myself.

First, after the agent said desktop click-and-drag was supported, I tested it on my own computer and found that it did not work. I then returned with the prompt, “the click and drag feature is not working on my computer, fix it. change nothing else.”

Second, after the agent said invalid bus-stop codes were handled correctly, I manually tried the feature and found that the error appeared whether the code existed or not. I then reported the exact failure and asked it to fix the validation.

These were important because I was no longer checking whether the code built successfully; I was checking whether the product actually behaved correctly for a user.

## Things the agent told me that turned out to be wrong

**1. Desktop click-and-drag**

The agent said that its traffic-advisory change “supports touch gestures on mobile devices ... as well as click-and-drag swiping on desktop.” I tested it on my computer and found that click-and-drag did not work. I discovered the mistake through normal use rather than from an error message or failed build.

**2. Bus-stop validation**

After my invalid-code prompt, the agent said that entering a nonexistent stop would display the error message while implying valid stops would continue normally. I tested the feature and found that the message appeared regardless of whether the stop existed. I only discovered this because I tested both a valid and invalid case myself.

**3. Traffic-advisory refresh evidence**

During the back-end testing, the agent described the traffic-advisory interval as five seconds and used the carousel's five-second slide rotation as support. A slide changing every five seconds only proves that the display rotates every five seconds; it does not prove that new traffic information is fetched every five seconds. I noticed this when reviewing the evidence for the assessment, so I treated the advisory-data refresh frequency as unverified instead.
