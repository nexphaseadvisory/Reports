# The Morning Read — Corrections Log

Append-only public record of corrections to published issues. Newest entries first.

Each entry records: **date logged**, the **issue date** affected, **what** changed, and **why**.
When a published issue file is itself corrected, the commit message is prefixed
`Morning Read <issue-date>: correction — <summary>` so corrections are traceable in git history.
Corrections may be logged automatically via the `morning-read-correct` webhook, which appends here.

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
