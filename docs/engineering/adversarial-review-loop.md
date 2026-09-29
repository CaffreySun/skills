# adversarial-review-loop: why it is built this way

[中文版](./adversarial-review-loop.zh.md) | English

> This one is for **humans**. [`SKILL.md`](../../skills/engineering/adversarial-review-loop/SKILL.md)
> is the instruction set for the AI. Read this if you want to know why the loop looks the
> way it does; if you want to use the skill, go straight to SKILL.md.

## One discipline, and everything else follows from it

**The context that finds a problem must never be the context that decides whether it is real.**

Every part of the loop that looks fussy — partitioning, dedupe, item-by-item adjudication,
re-reviewing the fixes — falls out of that one sentence. If you remember one thing, remember this.

Why is it so load-bearing? Because when one context does two things in a row, the second is
anchored by the first. A context that has just found "there is a problem here" is almost
incapable of honestly rejecting it when asked "does this problem hold?" — it has just spent the
effort finding it. That is not bad faith; it is what a context does.

## Three numbers fix the shape of the loop

All three come from projects that actually ran, not from reasoning. The loop looks the way it
does in order to answer them.

### Number one: 16 of 51 fixes were introduced by the fixing

> In one project, **16 of 51 fixes** were either "fixed it and introduced a new problem" or
> "changed one place and missed another".

This is the **only** reason every round of fixes has to be reviewed again. Review the original
change, fix everything the review turned up, stop — and all 16 stay in the working tree. Worse,
they look perfectly normal, because nobody has looked a second time.

So the stopping condition is not "the fixes are done". It is **a round of re-review that comes
back with no valid finding, no partially valid finding, and nothing subsumed by a larger
problem**.

That is the test for a full round. A judge-only round has no test of this kind, and does not need
one: it fixes nothing, and it does not own the next round (see "Two modes", below).

### Number two: 8 of 14 findings were overturned or downgraded

> In one 11-file specification rewrite: 5 partitioned finders → 14 findings → 14 independent
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

A **full round** is steps 1 to 6: freeze the object, partition it and hunt in parallel, dedupe,
adjudicate every finding, fix what the finding list carries, then re-review the fixes. Use it when
this process is the only thing that will act on the findings, and therefore has to close its own
loop.

A **judge-only round** is steps 1 to 4, and then it stops: freeze, partition and hunt, dedupe,
adjudicate. Nothing is fixed inside the round and nothing is re-reviewed inside it. What the round
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
valid**, **invalid**, **subsumed**.

**Subsumed** covers the case where the finding is real but is the symptom of a larger problem. The
thing the finder pointed at is genuinely wrong — a missing check, a comment that no longer matches
the code, a name that no longer matches the thing it names — but the problem worth fixing is the
one that produced it. "Valid" would send someone to fix one symptom and leave the cause in place;
"invalid" would dismiss something real. So under this verdict the adjudicator names the larger
problem and gives its location, and the larger problem, not the symptom, is what the finding list
carries.

The **partially valid** verdict also changed what it hands back. It used to hand back a boundary: a
statement of how far the finding held and where it stopped holding. It now hands back a
**re-description** — the finding rewritten so that everything left in it is fully valid.

The reason is that a boundary is a remark about a finding, while the fix has to be applied to a
sentence. Given a remark, whoever does the fixing still has to write the corrected sentence, and
there is nothing in the record to check it against. Given the corrected sentence, the fix is an
ordinary edit. So the rewrite is the finding from that point on: for a partially valid finding it
takes the place of the original text, for a subsumed finding it takes the place of the symptom.
Nothing downstream goes back to the original wording.

**An invalid verdict still has to be earned with counter-evidence.** The adjudicator has to go and
look, and has to bring back the location and the exact text that shows the finding does not hold.
That part does not change. What changed is where the counter-evidence stays: an invalid finding
never enters the finding list, so its counter-evidence has no place in the list either. Nothing is
acted on for an invalid finding, so nothing needs to be said about it there.

So the finding list contains only what adjudication kept, and it has the same shape whether the
round was a full round or a judge-only round:

| Verdict | What the list carries |
|---|---|
| valid | the finding as the finder wrote it |
| partially valid | the re-description, not the original |
| subsumed | the larger problem, not the symptom |
| invalid | nothing |

Every line has already been cut down to the part that stands up, so fixing is a straight read of
the list: no line has to be argued again before it can be acted on.

## Why the round is handed to a single subagent by default

If the lead agent runs the whole loop itself, the output of every finder and every adjudicator
lands in the lead context and piles up round after round. That is where the complaint "this
process is too heavy" actually comes from — not from the number of subagents, but from **all
their output landing in the main context**.

Hand it over, and the lead agent pays only "one dispatch + one final set of conclusions"; everything
else stays in the orchestrator's own context.

The cost is losing your direct feel for whether a finding has been overstated. The compensation
is a hard rule: every conclusion must spell out the concrete `old→new` edit. Shown the
specific change, the lead agent can tell at a glance whether the finding was inflated,
without going back to re-gather the evidence.

## Why batching is safe (and where the boundary is)

Every subagent carries a **fixed overhead that has nothing to do with the task**: system prompt,
tool definitions, skill list — on the order of several thousand tokens. N subagents cost roughly
N × that fixed overhead, plus all the content.

So "one subagent per finding" is the most expensive shape there is. Fifteen findings dispatched
separately means fifteen fixed overheads, when only 3–5 of them usually need independent
judgement.

**Batching is what saves that overhead.** But batching has a precondition: only batch the
**mechanical checks** — verdicts like "is this line really written that way" and "does this word
still appear anywhere", which do not depend on semantic judgement.

The three-axis test (any "yes" means dispatch it on its own):

| Axis | What it asks |
|---|---|
| **Judgement** | Does the verdict depend on a semantic conflict, self-consistency, a real gap, ambiguity, or a trade-off? Or is it enough to check mechanically? |
| **Cost of getting it wrong** | Would the verdict change behaviour, a contract, an external commitment, or the meaning of a process — or be irreversible? |
| **Contested ground** | Was this item already overturned or downgraded in a previous round? |

When you cannot judge, dispatch it on its own. Paying a little more is better than letting a
contested item through.

The hard rules for batching (leave them out of the task text and batching degrades into
self-contamination):

1. Every item in the batch gets its own verdict — **"same as above" and "this whole category is
   valid" are forbidden**;
2. State explicitly that the verdict on this item must not be influenced by the verdicts on the
   others in the batch;
3. Fixed output order: **every verdict first, then the batch summary** — never the reverse;
4. The batch contains no two findings about the same place (dedupe those first);
5. Order the items by file, or shuffle them — do not put same-category, same-conclusion items
   next to each other, because adjacency invites rubber-stamping;
6. **Spot check**: if a batch comes back saying "all valid and not one narrowed", pick its
   highest-risk item and send it through adjudication again on its own.

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

- **It really does cost.** A full round dispatches a dozen-odd subagents. When the object has
  only one or two reviewable sides, or right and wrong are plain at a glance, do not run it —
  step down by the principle in section 6 of SKILL.md, not by a fixed tier.
- **On a harness with no dispatch capability it is only a partial compensation.** The "two-pass
  method" (one executor, two passes) preserves the *form* of "finder ≠ judge", but the two passes
  still share priors, so it cannot be claimed as equivalent to independent adjudication. The
  report has to say so plainly.
- **It depends on a standard for "what counts as correct", and that standard has to be settled
  before review starts.** The standard can be ready-made (a specification, a convention, a
  higher-level document) or set on the spot; but if no standard can be settled for this change at
  all, the adjudicator has nothing to gather evidence against, and the process degrades into an
  argument of opinions.
- **It cannot make the model smarter.** All it does is make "ship it without adjudication"
  mechanically harder to do.
