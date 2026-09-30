# adversarial-review-loop: why it is built this way

[中文版](./adversarial-review-loop.zh.md) | English

> This one is for **humans**. [`SKILL.md`](../../skills/engineering/adversarial-review-loop/SKILL.md)
> is the instruction set for the AI. Read this if you want to know why the loop looks the
> way it does; if you want to use the skill, go straight to SKILL.md.

## One discipline, and everything else follows from it

**The context that finds a problem must never be the context that decides whether it is real.**

Every part of the loop that looks fussy — dedupe, adjudicating the whole list in a context that
did not find it, re-reviewing the fixes — falls out of that one sentence. If you remember one
thing, remember this.

Why is it so load-bearing? Because when one context does two things in a row, the second is
influenced by the first. A context that has just found "there is a problem here" is almost
incapable of honestly rejecting it when asked "does this problem hold?" — it has just spent the
effort finding it. That is not bad faith; it is what a context does.

## Three numbers explain why the loop is built the way it is

All three come from projects that actually ran, not from reasoning. The loop looks the way it
does in order to answer them.

### Number one: 16 of 51 fixes were introduced by the fixing

> In one project, **16 of 51 fixes** were either "fixed it and introduced a new problem" or
> "changed one place and missed another".

This is the **only** reason every round of fixes has to be reviewed again. Review the original
change, fix everything the review turned up, stop — and all 16 stay in the working tree. Worse,
they look perfectly normal, because nobody has looked a second time.

So the stopping condition is not "the fixes are done". It is **a round of re-review that comes
back with no valid finding, no partially valid finding, and nothing that is only part of a larger
problem**.

That is the test for a full round. A judge-only round has no test of this kind, and does not need
one: it fixes nothing, and it does not own the next round (see "Two modes", below).

### Number two: 8 of 14 findings were overturned or downgraded

> In one 11-file specification rewrite: 5 finders → 14 findings → 14 independent
> adjudicators → 1 ruled invalid, 7 downgraded to "partially valid".

Roughly **1 in 5 to 1 in 3** findings ends up invalid or downgraded. This is the reason the
adjudication step cannot be skipped.

Fix everything on the list without adjudicating, and those 8 become 8 pointless edits — some of
which introduce new problems of the number-one kind. What adjudication saves is not review time;
it is **pointless edits**.

### Number three: the convergence path 8 → 3 → 3 → 2 → 0

> In one 24-file specification-plus-code change, the number of new problems each round of
> re-review found **inside the previous round's fixes**: **8 → 3 → 3 → 2 → 0**.

Two things follow:

1. **It converges.** Not an endless loop — four rounds to zero. That answers "isn't this too
   heavy?": it is heavy, and it is bounded.
2. **The most valuable findings are not the ones a checklist turns up.** The two heaviest design
   defects in one project (an existing path the edit failed to update, a terminal state that could bypass
   validation) both came from an adjudicator's **active probe** — "which existing path does this
   edit fail to cover?" rather than "is this line written correctly?".

That second point is why the loop keeps insisting on "go looking for the path that should have
changed alongside this one", rather than handing out a checklist to tick through.

## Two modes: the full round, and the round that only judges

The loop runs in one of two modes, and what separates them is who owns the fix.

A **full round** is steps 1 to 6: get the material ready, hunt for problems, dedupe, adjudicate every
finding in a context that did not find it, fix what the finding list carries, then re-review the
fixes. Use it when this process is the only thing that will act on the findings, and therefore has
to close its own loop.

A **judge-only round** is steps 1 to 4, and then it stops: get the material ready, hunt, dedupe,
adjudicate.
Nothing is fixed inside the round and nothing is re-reviewed inside it. What the round
produces is its finding list, and some other process decides what happens to that list. Use it
when the round sits inside a larger process that owns the fix and decides when to run the round
again: that process fixes the problems, then runs this round again on the new state, so
convergence is counted across those rounds rather than inside one.

The second mode exists so that the fix and the re-review are not done twice. When a larger process
is going to run the judge again after its own fix, the loop's own fix step would repeat work that
process is doing anyway, and its own re-review would judge the same edit a second time.

A judge-only round is not the cheap version. Steps 1 to 4 are where nearly all the cost sits. What
it drops is the half that the process owning the fix was going to run again regardless.

There is no count for a judge-only round to reach. The round is over once it has produced its
finding list. That is why the stopping test in number one belongs to the full round alone.

The Challenge and Verify phases of `task-spec` are built on this mode: each one judges a spec or a
finished change, hands its finding list to the phase that owns the fix, and runs again on what
comes back.

## What an adjudicator may say, and what the finding list carries

An adjudication used to end in one of three verdicts. There are now four: **valid**, **partially
valid**, **invalid**, **part of a larger problem**.

**Part of a larger problem** covers the case where the finding is real but is only one instance of
a larger problem.
The
thing the finder pointed at is genuinely wrong — a missing check, a comment that no longer matches
the code, a name that no longer matches the thing it names — but the problem worth fixing is the
one that produced it. "Valid" would send someone to fix that one place and leave the cause in place;
"invalid" would dismiss something real. So under this verdict the adjudicator names the larger
problem and gives its location, and the larger problem, not the one instance, is what the finding list
carries.

The **partially valid** verdict also changed what it hands back. It used to hand back a boundary: a
statement of how far the finding held and where it stopped holding. It now hands back a
**re-description** — the finding rewritten so that everything left in it is fully valid.

The reason is that a boundary is a remark about a finding, while the fix has to be applied to a
sentence. Given a remark, whoever does the fixing still has to write the corrected sentence, and
there is nothing in the record to check it against. Given the corrected sentence, the fix is an
ordinary edit. So the rewrite is the finding from that point on: for a partially valid finding it
takes the place of the original text, for a finding that is only part of a larger problem it takes
the place of the instance just described.
Nothing downstream goes back to the original wording.

**An invalid verdict still has to be earned with counter-evidence.** The adjudicator has to go and
look, and has to bring back the location and the exact text that shows the finding does not hold.
That part does not change. What changed is where the counter-evidence stays: an invalid finding
never enters the finding list, so its counter-evidence has no place in the list either. Nothing is
acted on for an invalid finding, so nothing needs to be said about it there.

So the finding list contains only what adjudication kept, and it has the same form whether the
round was a full round or a judge-only round:

| Verdict | What the list carries |
|---|---|
| valid | the finding as the finder wrote it |
| partially valid | the re-description, not the original |
| part of a larger problem | the larger problem, not the one instance |
| invalid | nothing |

Every line has already been reduced to the part that holds up, so fixing is a straight read of
the list: no line has to be argued again before it can be acted on.

## Why the round is handed to a single subagent by default

If the lead agent runs the whole loop itself, the output of every finder and every adjudicator
lands in the lead context and accumulates round after round. That is where the complaint "this
process is too heavy" actually comes from — not from the number of subagents, but from **all
their output landing in the main context**.

Hand it over, and the lead agent pays only "one dispatch + one final set of conclusions"; everything
else stays in the orchestrator's own context. The subagent taking it on has to be one that can
hand out tasks of its own.

That is the first of four branches, and the one to reach for when it is available (§4 of SKILL.md):

1. **Your subagents can dispatch** → hand the whole round to one of them, as above.
2. **You can dispatch, but your subagents cannot dispatch further** → orchestrate the round
   yourself, but still hand out as much of the work as you can. What you must not do is read every
   part of the object yourself.
3. **You cannot dispatch, but you can open a new session that has dispatch tools of its own**
   (non-interactive is fine) → that session is the orchestrator, and the separation comes out the
   same.
4. **Neither** → do it yourself in two passes, and say so plainly in the report: the two passes
   share priors, so this is a partial compensation, not a substitute (see the limits below).

How much to split, how many to dispatch, which executor to use — those are the orchestrator's own
decisions, bounded by §6 and §7 of SKILL.md, and made from its own capability and the object.

The cost is losing your own direct judgement of whether a finding has been overstated. The compensation
is a hard rule: every conclusion must spell out the concrete `old→new` edit. Shown the
specific change, the lead agent can tell at a glance whether the finding was overstated,
without going back to re-gather the evidence.

## Why one adjudicator judges the whole list

The expensive case is not "one adjudicator, many findings"; it is **one adjudicator per finding**.
Every subagent carries a **fixed overhead that has nothing to do with the task**: system prompt,
tool definitions, skill list — on the order of several thousand tokens. Fifteen findings
dispatched separately means paying that overhead fifteen times, when only a few of them usually
need independent judgement.

So the default is **one adjudicator judging the whole list**. Split the list only when it is
genuinely too large for one context to hold — the same bound that governs splitting a hunt
(§6 of SKILL.md).

The risk is real, and known: **a context that judges several findings in a row is influenced by the
one before it.** Read the first, decide it, and the second is read already leaning toward that
decision. Left alone, the list settles on one repeated answer — the exact error independent adjudication
exists to prevent. The answer is to keep each finding separate from the others inside the task, not to cut the list
into one dispatch per finding:

1. **Every finding gets its own verdict**, with its own evidence, re-description, minimal fix and
   counter-evidence — **"same as above" and "this whole category looks fine" are forbidden**;
2. Say explicitly that **the verdicts on the other findings must not influence this one**;
3. Fixed output order: **every verdict first, then the summary** — never the reverse;
4. **No two findings about the same place side by side** (dedupe those first), and order or
   shuffle the list so that same-category, same-conclusion items are not adjacent, because
   adjacency invites one answer being copied down the list;
5. **Being one of many never lowers the bar.** Every finding carries exactly the same evidentiary
   requirements it would carry if it were judged on its own.

## Why you have to prove "only a human can settle this" before asking one

Asking the user costs something: their attention, and an interruption to the flow. So the default
is **work it out and act on the basis you found** — not ask.

Something can go to the user only when all four of these hold at once: the evidence-gathering is
genuinely exhausted / there genuinely is no ruling to cite in the specifications and precedents
(you listed them one by one and none applies, not that you did not go looking) / the options lead
to materially different outcomes (wording preferences do not count) / the outcome is irreversible
or reaches beyond this change.

Satisfying only the first two is "undecided, but can proceed on convention". All four is "the
user has to decide".

And you cannot just drop the question on them: each item has to carry "what I checked + the
consequences of each of the 2–3 options + my recommendation + the default + something they can
answer in one sentence".

## Limits (the honest version)

- **It really does cost.** A full round is two subagents by default — one finder and one
  adjudicator. It only grows when the object is genuinely too big for one context to hold, and
  then you split as little as you can. When the object has only one or two reviewable sides, or
  right and wrong are plain at a glance, do not run it — step down by the principle in section 6
  of SKILL.md, not by a fixed tier.
- **On a harness with no dispatch capability it is only a partial compensation.** The "two-pass
  method" (one executor, two passes) preserves the *form* of "finder ≠ judge", but the two passes
  still share priors, so it cannot be claimed as equivalent to independent adjudication. The
  report has to say so plainly.
- **It depends on a standard for "what counts as correct", and that standard has to be settled
  before review starts.** The standard can be ready-made (a specification, a convention, a
  higher-level document) or written down just before the review starts; but if no standard can be
  settled for this change at all, the adjudicator has nothing to gather evidence against, and the
  process degrades into an argument of opinions.
- **It cannot make the model smarter.** All it does is make "ship it without adjudication"
  mechanically harder to do.
