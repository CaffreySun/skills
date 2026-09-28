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

So the stopping condition is not "the fixes are done". It is **a round of re-review that returns
0 valid findings and 0 partially valid findings**.

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
