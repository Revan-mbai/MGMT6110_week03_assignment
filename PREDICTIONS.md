Predictions: SG Bus Tracker
Live: https://mgmt-6110-week03-assignment.vercel.app/
Written 25 Sep 2026, before any group feedback.
#	Heuristic	What I found, and expect my group to flag	Likely flagged
1	Visibility of system status	"LIVE" labels sit on simulated data; advisory times like "4 mins ago" never change.	High
2	Match between system and real world	"Nearby" ignores my real location (Tampines Int shows as 150 m away); Map View is a drawing, not a map.	High
3	User control and freedom	Two back buttons on the stop page; advisories auto-rotate, though there is a pause button.	Low
4	Consistency and standards	The stop page shows two arrival lists that disagree (bus 106: 2 min vs 9 min); one accident is called both "Accident" and "Collision".	High
5	Error prevention	The Stop Code box accepts letters.	Medium
6	Recognition rather than recall	Live Arrivals needs a 5-digit stop code; the quick-stop buttons help.	Low
7	Flexibility and efficiency of use	Search, favourites and quick stops work well; I expect praise here.	Low
8	Aesthetic and minimalist design	Developer text shown to commuters: "/api/bus • 20s cycle", "Backend Health check: Key: Configured".	High
9	Recognize, diagnose, recover from errors	Code 99999 says "does not exist" and also "No buses running for Bus Stop 99999"; an empty Load does nothing.	Medium
10	Help and documentation	Nothing explains what is live and what is simulated, or where to find a stop code.	Medium
Top prediction: most of my group will flag #4, the two arrival lists that disagree.
