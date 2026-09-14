### Name: Revan Koh

Front-end criteria

FE1 - Clear purpose

Why it matters: Commuters on the move need to know where to start.

Test and pass condition: Give a first-time user 10 seconds: they must identify arrivals, advisories, and that the input needs a bus-stop code rather than a service number.

Evidence: I asked 2 first-time users to open the app without instructions. Within 10-15 seconds, they could identify the arrival and advisory functions and understand that the input required a bus-stop code.

Mark: Met

FE2 - Complete the main task

Why it matters: Users need the arrival for the correct stop and service.

Test and pass condition: Enter a valid stop code and find a service's arrival within 30 seconds. Compare with the source response; switching stops must not mislabel old results.

Evidence: I entered stop code 75419 and found the arrival estimate for service 58 in around 10 seconds, with the displayed information matching the source response. After switching stops, the arrival times of different bus services were still accurate.

Mark: Met

FE3 - Phone and laptop usability

Why it matters: Users check for bus arrivals while travelling and plan journeys from home.

Test and pass condition: Essential content must remain readable.

Evidence: I tested both tabs in phone, tablet, and computer view. The controls and information were unaffected. Keyboard navigation does not work at all, only scrolling with the mouse and clicking.

Mark: Met

FE4 - Trustworthy information

Why it matters: Misleading estimates or advisories can lead to delayed travel timings.

Test and pass condition: Compare displayed data with source responses. 

Evidence: I compared the displayed arrivals and advisories with their source responses and found that the information provided is accurate.

Mark: Met

FE5 - Recover from mistakes

Why it matters: Commuters may mistype a code or choose the wrong stop.

Test and pass condition: Try blank, invalid, and unmatched entries, then change a wrongly selected stop. Errors must explain the issue and allow correction without reloading or showing misleading old results.

Evidence: When an invalid bus code was entered, the app showed the bus stop code with no error messages, but showed no bus services at that bus stop.

Mark: Partly met
 
Back-end criteria

BE1 - Empty data and midnight

Why it matters: Late-night users must not mistake missing information for an arriving bus.

Test and pass condition: Inspect real empty responses and test-controlled cases. Empty lists need accurate messages; missing times must not become zero. An arrival at 00:03 tomorrow, checked at 23:58 Singapore time, must show about five minutes. Distinguish observed from simulated cases.

Evidence: only shows the last bus but does not state that there are no more buses running afterwards.

Mark: Not met
 
BE2 - Health and diagnosis

Why it matters: Diagnosable faults help restore arrival information sooner.

Test and pass condition: Follow the README to the health endpoint. Check normal and upstream-failure responses: application and source availability must be distinguishable, with a matching redacted failure log.

Evidence: The health-check page identified missing access details, refused access and connection problems. It distinguished an available app from an unavailable information source without revealing the private key.

BE3 - Credential protection

Why it matters: Exposed credentials could jeopardize the service commuters rely on.

Test and pass condition: Inspect browser code and traffic, health/error responses, repository files, and full Git history. No provider credential may appear. Keep evidence redacted.

Evidence: Checked browser information, project files and saved project history found no exposed private access keys. The security report recorded no leaks across the 25 files reviewed.

Mark: Met  

BE4 - Sensible request frequency

Why it matters: Users need fresh data without exhausting provider access.

Test and pass condition: Document each source's update interval or justify an uncertain interval. Ten equivalent requests within it must trigger at most one upstream call; expiry must allow refresh, and different stops must remain separate. Test advisories too.

Evidence: Ten checks of the same stop within 20 seconds made only one request to the provider. Later checks and different stops fetched fresh information. Advisory slides changed every five seconds, but their information-refresh frequency remained unverified.

Mark: Met


Q1 — Where did the agent make you faster?

The biggest time saving came from debugging. For example, when the Favourites feature created an error, the agent traced the problem to one button being placed inside another button and fixed it. It also diagnosed why desktop click-and-drag on the traffic advisory was not working and changed it so that dragging continued even when the cursor moved outside the card. Finding these bugs myself would have taken much longer because I would not have been able to find the error.

Q2 — Where did it cost you time?

The biggest loss of time came from the invalid bus-stop validation. I asked for an error message only when a code did not exist, but after the change, the message appeared for both valid and invalid codes. I had to test it, identify that the behaviour was wrong, and send another prompt. AI studio fixed the validation across six files.

Q3 — Did it ever hand you something that looked right and was not?

Yes. The first version of the invalid bus-stop feature looked correct because the agent reported that all three search areas now showed the right message when a code did not exist. I only discovered the problem by testing the app myself and seeing the same error message for valid codes. The explanation sounded convincing, but the actual behaviour was wrong.

Q4 — What did you have to know to supervise it?

I needed to understand the expected behaviour well enough to know when the code was wrong. I did not need to know exactly how the validation was written, but I knew that a valid bus-stop code should show arrivals and an invalid one should show an error. I also had to understand that a clean build does not prove that a feature works correctly. Without testing the actual user flow, I would not have caught the validation mistake.

Q5 — Which decisions did you keep?

I kept the main product decisions, such as how users should search for stops, how advisories should behave, and what error messages should appear. I let the agent handle most of the technical debugging, including the nested-button error, click-and-drag problem and validation logic. I think that was the right boundary. I should decide what the user should experience, while the agent can investigate how to fix the code. However, I still need to test the result because the validation issue showed that the agent can report success even when the behaviour is still wrong.

Q6 — What would this mean for a team of thirty?

For a team of thirty, I would let agents handle first-pass debugging and suggest technical fixes, but I would require a human to reproduce the bug before the fix and test the exact same case afterwards. A successful build would not be enough to close an issue. Every bug should have a short record of the original problem, the cause, the change made and the test that proved it was fixed. I would especially require this for validation, security and user-facing error messages, because my project showed that code can compile successfully while still behaving incorrectly.

