# The Morning Read — Corrections Log

Append-only public record of corrections to published issues. Newest entries first.

Each entry records: **date logged**, the **issue date** affected, **what** changed, and **why**.
When a published issue file is itself corrected, the commit message is prefixed
`Morning Read <issue-date>: correction — <summary>` so corrections are traceable in git history.
Corrections may be logged automatically via the `morning-read-correct` webhook, which appends here.

---

## 2026-10-14: issue 2026-10-14
**What:** removed "California electricity prices are double the national average; experts at GridLa"; item 2 text replaced; Bottom Line text replaced; Bottom Line sentence cut.
**Why:** An item on California electricity prices was removed; it should not have run. The Dominion-NextEra merger item and the Bottom Line said the merger was tracking toward denial; they now report what Utility Dive reported: most officials at the Oct. 9 hearing asked for the merger to be denied or allowed contingent on guarantees.

---

## 2026-07-14 — issue 2026-07-14
**What:** The item reporting a U.S. stop-work order on an Ørsted offshore wind project causing shares
to tumble (National & Policy) has been removed from the archived issue.
**Why:** That referenced the Revolution Wind order from August 2025, which a federal court overturned
on January 12, 2026; the affected projects were cleared to proceed by April 2026. It was not current
and should not have run.

---

## 2026-07-10 — issue 2026-07-10
**What:** Fact-check corrections (5 items): fixed company attributions — Leeward Renewable Energy
(not Google, the offtaker) on the Oklahoma solar PPA; DC Blox (not the hallucinated "Provident") on
the Indianapolis scale-back; Beale Infrastructure (not "reportedly a Meta" tenant) on the campus;
added Prince George's County and Florida PSC context; removed a duplicate Leeward card and promoted
Belltown to Signal of the Day.
**Why:** The Company field had mis-attributed offtakers/tenants and one hallucinated name (root cause:
headline-only extraction at ingestion — since fixed by grounding extraction on the article body), and
a duplicate slipped the same-story dedup.
