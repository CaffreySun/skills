# Orchestration Modes, and What to Do When You Cannot Dispatch Anyone

> Read this when you need to decide whether this round is "hand the whole thing to one orchestrator" or "run it yourself". The modes and the discipline
> do not change with the harness — only who dispatches and how the artifacts come back changes. First work through [`harness-probe.md`](./harness-probe.md)
> to see which capabilities you actually have.

## Mode A: hand it to one orchestrator (default when there is nesting and you can dispatch several in parallel at once, see `SKILL.md` §4)

If the lead agent runs the whole round itself, the output of every finder and every adjudicator lands in the lead agent's own context
and piles up round after round — "this process is too heavy" is really about this. Once you hand it out, the lead agent pays only the cost of
"**dispatch once + receive one set of conclusions**", and everything in between stays in the orchestrator's own context.

**Preconditions**:

- The orchestrator must "be dispatchable, and itself be able to dispatch others". Use a general-purpose role that has **every tool**; do not put a
  strong-judgement role that declares a hard allowlist in the orchestrator seat — the types it can dispatch are locked down, and it cannot send out
  partitions or adjudications at all.
- You need **at least one level of nesting**: lead agent → orchestrator → finder / adjudicator (and no further). Depth counts along **a single chain**,
  not by total headcount: the orchestrator sending two waves itself is fine, but **the people it dispatches cannot dispatch further**.
- The artifacts are retrievable afterwards, or you can require subagents to **write the artifacts to a directory the subagent can read** and return
  just a path. **By default do not go and read them**; fetch them only when you need to check a particular verdict.

### When to hand it to the orchestrator, and when to run it yourself

| Situation | What to do |
|---|---|
| Many aspects to examine / more than one round expected / conclusions are all you want | **Hand it out** (the default; but with no nesting, or when you cannot dispatch in parallel, this does not hold — take mode B instead) |
| You need to confirm back and forth with a person while reviewing, or even "where the problem is" can only be located by repeated probing | The lead agent runs it itself (mode B; once it is handed out, you can no longer pick up the user's answers) |
| One or two blocks in total, or the number of dispatches for the whole round is small anyway | Do not hand it out; take the lower bound of the §6 row matching this object's uncertainty / cost of a miss |

### Three things the lead agent must do

1. **Freeze the object to be reviewed** (what the object is / acceptance criteria / intentional-omissions list, see `SKILL.md` §5) — these three **must be written into the dispatch prompt**.
2. **Dispatch the orchestrator once** (template below).
3. **Receive the conclusions → make the changes**; to review "the diff of this round's changes", **dispatch a new orchestrator** (a freshly opened
   orchestrator has a very clean context and is more reliable than letting the old one keep running).

### Orchestrator dispatch prompt template

```text
You are the review orchestrator. You run one round of adversarial review yourself, **and hand back only the conclusions**.

Object to review: <how to retrieve it, and the absolute path of that one shared material everyone looks at>
What the object is: <what this is, why it is done this way>
Acceptance criteria: <if ready-made, say which spec / upstream document it is; if decided ad hoc, write those verbatim items here>
Intentional omissions: <the list; if you do not list them, they will be reported back as defects>
This round's uncertainty / cost of a miss: <low / medium / medium-high / high> (take the §6 row matching this object's uncertainty / cost of a miss, and **do not step yourself down a row**)

Process (you dispatch the subagents and get it done yourself; no need to report the process):
1. Partition and find problems: decide how many blocks per main flow §6, dispatch the read-only finders in parallel, and keep the blocks non-overlapping.
   **Every finder's task must carry verbatim**: the <critical> read-only hard constraint, what the object is, the acceptance criteria, the intentional-omissions list, and the finding format (ID / location / verbatim excerpt / why / severity / minimal fix / confidence) plus the fixed table header (see `SKILL.md` §7).
2. Deduplicate (where the same spot is hit by several blocks, or a fix is fully covered by another finding, merge them into one).
3. Independent adjudication: dispatch the ones that need thinking separately; batch the mechanical checks together by category (≤4 per batch, and each item in a batch is judged independently); the adjudicators must be freshly dispatched (they cannot be the person who found it). They may rule invalid / partially valid / subsumed; a ruling of invalid must give a location + counter-evidence from the verbatim text, and a ruling of subsumed must name the larger problem and its location. **Spot-check**: if a batch comes back "all valid, nothing narrowed", pick its highest-risk item and dispatch it through adjudication again, on its own.
4. Summarize.

In your reply give only these (for length and item count see `SKILL.md` §10; exceeding them counts as failure):
1. A one-sentence conclusion + how many verdicts of each kind (valid / partially valid / invalid / subsumed).
2. The findings table: `# | location | verdict | one sentence stating the problem | minimal fix`.
3. Items that need the user to decide — write them per the six elements in main flow §9; if there are none, write "none".
4. How many people you dispatched in total (how many finders, how many adjudicators, plus any spot-check dispatches), confirm that no adjudicator is a finder, and record any batch that came back "all valid, nothing narrowed" together with the spot check you ran on it.
5. For every item in the finding list (ruled valid, or ruled partially valid or subsumed and re-described): the adjudication evidence (location + verbatim excerpt + **how that earlier check can be reproduced**: if it was a command, give the command; if you judged it by reading and comparing, list both locations and both verbatim excerpts) and the artifact path (so it can be read back on demand).

Not allowed: pasting back the raw output, the tables, or the report body of the finders and the adjudicators; pasting the full text of the object;
**do not modify any object without authorization**.
```

### A few discipline points for mode A

- **The reply must carry concrete fixes**: once it is handed out, the lead agent loses the direct feel for "is this finding exaggerated"; with concrete
  fixes it can judge at a glance, without going and checking it all over again.
- **The default is review-only, no edits**: to let it fix as well as review, you must explicitly grant write permission, and it must be **serial** — while
  the orchestrator holds the working tree, the lead agent must not edit the same batch of files.
- **Items that need the user to decide must come back**: the orchestrator cannot talk to the user, and such questions cannot be settled in place, so they
  must be handed back per the six elements.
- **Do not let it paste back summaries of the subagents' output** — that moves the cost you saved straight back into the lead-agent context; when you need
  it, read it by the artifact address.

## Mode B: the lead agent orchestrates itself

The lead agent itself walks §5 → §7 → §8 of `SKILL.md`: "freeze the object → partition and find problems → deduplicate → independent adjudication → fix →
review the fixes" — in a judge-only round, stop after adjudication. When to use it: the people you dispatch cannot dispatch further; or even where the problem is can only be located by repeated probing;
or you need to confirm back and forth with the user while reviewing.

Ways to save cost:

- Take the **lower bound** of main flow §6 for the block count; partition coarsely rather than let coverage be incomplete.
- **Batch the mechanical check items together by category**, ≤4 per batch — batching is exactly what saves that fixed overhead.
- Send every finder and every adjudicator of a round **all at once**; never "send one, wait for one".
- Subagent artifacts **land on disk and are not sent back**: require them to write to a directory the subagent can read (see `SKILL.md` §5), and to reply
  with conclusions + path only; the lead agent reads them when it needs to.
- Each round, record just "how many verdicts of each kind + how many places changed" as one archived line, so the context does not fill up with raw output.

## When you cannot dispatch a single one: use the two-pass method

The goal is to preserve "**the person who finds problems ≠ the person who judges problems**" at **the lowest cost**:

1. **The first pass only finds problems**: treat yourself as the finder, read the object under review end to end, and write each finding down per the
   finding format in `SKILL.md` §7 (ID / location / verbatim excerpt / why it is a problem / severity / minimal fix / confidence).
2. **You must swap context once in between**: empty out all the assumptions now in your head (start a new round of conversation / start a new session) and
   re-enter carrying only three things — the file path of that findings list, the object under review, and the acceptance criteria. **Never** keep writing
   with the first pass's conclusions still in memory.
3. **The second pass only judges the problems**: go through each finding with the adjudication actions in `SKILL.md` §8, giving evidence / re-description /
   minimal fix / counter-evidence for each; a ruling of "invalid" must give a location + counter-evidence from the verbatim text. The order is fixed:
   **judge every finding first, then write the summary**.
4. **Label it honestly**: the two-pass method can only count as **partial compensation** — the same person working in two passes still shares the same set
   of preconceptions before and after, so you cannot claim it is equivalent to independent adjudication. The report must state "this round used the
   two-pass method, with no independent-context adjudication", and must keep all counter-evidence, so a person can check it once more.
