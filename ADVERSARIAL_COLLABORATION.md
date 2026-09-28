Revan Koh, Group 4
predictions.md committed on 26 sept 26; first comment for this set on my board at 27 sept 26
 
Evaluators: Minh Nguyen (MN), Ong Jin (OJ), Adithi Udupa (AU). Twelve findings.
 
---
 
## The four-way table
 
### 1. Found by both
- Two lists for the same stop disagree | MN, AU | mine high, theirs 2 and 3
- Advisory frozen while labelled live | MN | mine high, theirs 3
- The stop code box accepts letters | MN | mine medium, theirs 2
- "Nearby" is not near the user | OJ | mine high, theirs 3
- You must already know the five-digit code | AU, OJ | mine low, theirs 3 and 3
- Nothing explains what each part is or takes | AU | mine medium, theirs 2
- The error state and the data on screen contradict each other | MN | mine medium, theirs 2
### 2. Found by them, missed by me
- A favourite cannot be removed | AU | theirs 3 | arbiter not taken
- "3rd Arrival — N/A" does not say whether there are no more buses or no more data | OJ | theirs 3 | arbiter not taken
- The first dashboard omits occupancy and wheelchair access, which a second below repeats | OJ | theirs 1 | arbiter not taken
### 3. Found by me, not by them
- Developer text shown to commuters | mine high
- Map View is a drawing, not a map | mine high
- Two back buttons on the stop page | mine low
- One incident called both "Accident" and "Collision" | mine high
- An empty Load value does nothing | mine medium
### 4. Found by both, rated differently
- You must already know the five-digit code | AU, OJ | mine low, theirs 3 and 3 | arbiter not taken
- Two lists for the same stop disagree | MN, AU | mine high, theirs 2 and 3 | arbiter not taken
- Heuristic 8 | OJ | mine high for developer text, theirs 1 for duplicated dashboards | not comparable — different problems under one heuristic
Two defects were filed under different heuristics from mine: I put the frozen advisory under 1 and Minh under 2; I put "Nearby is not near you" under 2 and Ong Jin under 1. Same faults, different labels.
 
---
 
## My predictions, checked
 
- **Expected finding 1, live labels on simulated data: HELD, 3 against my high.** Minh found no refresh request and the same "4 mins ago" across reloads.
- **Expected finding 2, "Nearby" ignoring my location: HELD, 3 against my high.** Ong Jin saw Orchard stops while standing in Sengkang.
- **Expected finding 3, two arrival lists that disagree: HELD, 2 and 3 against my high.** The most-confirmed finding on the board, but neither rated it as high as I did.
- **The heuristic I named as worst (4, Consistency and Standards): HELD.** Two of three flagged it, as I predicted.
- **The finding that would show my evaluation was wrong: NOT NAMED.** I set no condition under which I could be proved wrong — which is itself the result.
**The breaks matter more:**
- **Heuristic 6, predicted low: BROKE.** Two evaluators rated it 3 independently; it became the largest change in the revision.
- **Heuristic 3, predicted low: BROKE.** I noted two back buttons; Adithi found a favourite could not be removed at all, rated 3.
- **Heuristic 8, predicted high: CANNOT TELL.** Nobody mentioned the developer text.
- **Heuristic 7, where I expected praise: HELD AND BROKE.** Ong Jin praised favourites; Adithi rated the same feature 3 for being one-way.
- **Map View: CANNOT TELL.** I removed it at prompt 16, before they tested. Some of what I predicted was about a build they never opened.
---
 
## Q1. Where was confirmation bias in my own evaluation?
 
I graded my own knowledge of the product rather than a stranger's experience of it.
 
Everything I rated high was something I knew was fake — simulated data behind live labels, developer text, a drawn map. Those embarrassed me as the builder. Everything I rated low was something I use without difficulty: stop codes, favourites, the search box. For heuristic 7 I wrote "I expect praise here", which is not a prediction about users at all.
 
Heuristic 6 is the clearest case. I wrote that the quick-stop buttons help — they helped me, because I chose which stops went in them. And I named no falsifying condition, so my evaluation could only ever be confirmed.
 
## Q2. Which prediction broke, and what did it teach me?
 
Heuristic 6, predicted low, returned twice at 3.
 
I was good at spotting faults of honesty, where the product claimed more than it delivered, because I knew where the seams were. I was blind to faults of access, where the product works exactly as built and simply cannot be entered by someone who does not already know what I know. The first is visible from inside; the second only from outside. Heuristic 3 broke the same way — I never tried to remove a favourite, because I only ever saved ones I wanted.
 
## Q3. Which groupmate finding did I nearly dismiss, and what did the evidence say?
 
Ong Jin's, that "Nearby" showed him Orchard stops while he was in Sengkang. My first reaction was that a Singaporean knows where he is, so the list is only mislabelled.
 
The evidence said otherwise. He rated it 3 and gave the reason: a tourist cannot tell the list is anchored to a default rather than to them. And it converged with two findings I had treated separately — Adithi on name search, Ong Jin on postal codes. Three of twelve findings were one hole seen from three sides: there was no way into the product for someone who did not already know a stop code. Alone, I would have relabelled a heading.
 
## Q4. What did I revise, which heuristic does it serve, and how do I know it worked?
 
| Revision | Heuristic | How I know |
|---|---|---|
| One search box taking name, road, postal code or stop code, across all 5,210 LTA stops | 6 | "Bedok" returns 137 stops, "Siglap" 19; both returned nothing before |
| Postal codes resolved through OneMap | 2 | 545078 returns Sengkang Int at 95 m — Ong Jin's own scenario |
| One service list per stop, from LTA BusRoutes | 4 | Stop 09048 shows the same services on both screens |
| Real arrivals from BusArrivalv2 | 1 | At 00:03 the five services running at stop 84009 matched the endpoint to the minute |
| Real incidents, aged from the reported time, filtered to 2 km | 2 and 1 | "Source: LTA DataMall · Fetched at hh:mm:ss"; the age advances |
| The star saves and unsaves in one tap; saved stops start empty | 3 | Tapping a saved star removes it and the count drops |
| Words instead of "N/A" | 5 | "Only two arrivals scheduled", "No more buses tonight", "Not in service" |
| A failed search clears previous results and says so | 9 | "Previous results have been cleared" |
| One arrivals list carrying occupancy, wheelchair access and deck type | 8 | No second panel repeating it |
 
Eleven of twelve are addressed. I did not auto-detect location: naming the anchor and accepting a postal code removes the misleading part, but a permission prompt and refusal path were too much to add safely the night before the deadline. I said so in my reply rather than implying it was done.
 
I also introduced two faults and caught them by testing: replacing the stop catalogue gave all 5,210 stops the same three services, and the postal lookup entered a loop firing about fourteen requests a second. Neither showed on screen as an error.
 
## Q5. What did my users give me that I could not have found myself?
 
**Convergence.** Nielsen says one evaluator's severity cannot be trusted, and mine was the one that could not. Two evaluators arriving independently at 3 for the code requirement was evidence I could not manufacture alone, and it is why that became the largest change.
 
**A contradiction between them.** Ong Jin listed the traffic advisory among the things he would keep untouched. Minh, testing the same feature with the network panel open, found nothing refreshing it. The product's best-liked idea was its least honest one — and that exists only in the gap between two reports. The shape repeats: Ong Jin praised favourites, which Adithi rated 3 for being one-way, and praised the clear control on a field Minh rated 2 for accepting letters.
 
**Silence where I expected noise.** Nobody mentioned the developer text I rated high. What embarrasses a builder and what obstructs a user are not the same list.
 
## Q6. Did the AI help me confirm, or help me falsify?
 
It confirmed by default, and falsified only when I made it.
 
Three times the agent reported success on broken work. Told to make the stop catalogue real, it did — and silently filled the missing services with a fixed list, so every stop in Singapore claimed buses 14, 65 and 106. Told to make the advisories real, it produced "Issued: 08:14 SGT (6 mins ago)" at 22:24. Told to show a message only for codes that do not exist, it reported exactly that, and the message appeared always. Each time, its account of its own work was the confirming evidence, and it was wrong.
 
Falsification came from testing: the network panel, a real stop code, comparing screen against endpoint. The agent only helped falsify when I asked it to check rather than build — the same model that invented a service list later found, pointed at the deployed site, that 140 Bedok stops were claiming identical buses.
 
So the useful division was not between me and the AI. It was between building and checking. Whoever builds has a reason to believe it worked, and the check must come from somewhere with no stake in the answer. That is also what my groupmates were.
