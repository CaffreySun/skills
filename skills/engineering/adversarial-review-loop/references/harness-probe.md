# Appendix: Locate Your Harness First (10 Seconds Before You Start)

> Read the five-question table below only when you need to decide how to orchestrate this round.

Answer the 5 questions below against **your own tool list alone**, and you can see which tier to take.

**The process and the discipline do not change with the harness** — only "who dispatches, and how the artifacts come back" changes. For the two
orchestration modes see [`orchestration.md`](./orchestration.md); for measured values on someone else's machine (to compare against your answers to
these five questions) see [`harness-measurements.md`](./harness-measurements.md).

| Capability | How to check it yourself | What to do when you have it | Fallback when you don't have it |
|---|---|---|---|
| ① Can dispatch subagents with independent contexts | Does the tool list have a "dispatch / assign task" kind of tool — one that can hand a piece of work to **another independent context** and bring the result back | Partition the work and dispatch people per SKILL.md §7, one non-overlapping independent context per block | Switch to the two-pass method in [`orchestration.md`](./orchestration.md): the same person works in two passes, the first pass only finds problems and the second only adjudicates them, and the context must be swapped once in between |
| ② Subagents can dispatch further (nesting) | Do the subagents' own tools also include a "dispatch" kind of tool; or is there a configuration option that states the maximum nesting depth | Take [`orchestration.md`](./orchestration.md) mode A (orchestrator mode): the lead agent dispatches just 1 orchestrator and receives conclusions only | Take [`orchestration.md`](./orchestration.md) mode B (the lead agent orchestrates itself): the lead agent issues both the partitions and the adjudications itself |
| ③ Can dispatch several in parallel at once | Is the dispatch tool's input an array (one call can carry several tasks) | Send every partition task and every adjudication of a round **all at once**, not one after another | You can only send them one at a time, but still "send them all first, then collect them together" — never "send one, wait for one" |
| ④ Subagent artifacts can be read back on demand | Afterwards, is there a way to retrieve a subagent's full artifact (artifact address / conversation record / file written to disk) | By default do not read it; only when you need to check one particular verdict do you read back that one | At dispatch time require it to write long artifacts **to a directory the subagent can read** (on most harnesses a subagent can only read inside the working tree → use a temporary directory inside the working tree, see SKILL.md §5), and to reply with conclusions only (for length see SKILL.md §10) + the artifact path |
| ⑤ Can enforce read-only + tier by model | Can you give a subagent a tool allowlist / denylist; can you specify which model it runs on, **and do the aliases really map to different models** | Read-only is enforced by configuration; attach the cheap model to mechanical checks and the strong model to work that needs judgement (see SKILL.md §7) | Read-only can only be written into the task body as a hard constraint (relying on discipline, not on mechanism); for tiering, switch to "task difficulty + tool allowlist + narrowing the task" ([`harness-measurements.md`](./harness-measurements.md) gives a way to verify) |

- All five present → mode A (spends the least lead-agent context).
- Have ①②③ but lack ④ or ⑤ → still mode A; handle it per the "fallback when you don't have it" row for ④/⑤ (artifacts land in a directory the subagent can read and it returns the path; read-only rests on the task body).
- Lack ② → mode B (and if ④/⑤ are also missing, likewise follow the fallback rows).
- Have ①② but not ③ → mode B, with the block count taken from the lower bound of the corresponding tier in §6.
- Not even ① → use the two-pass method; **never** treat "asking and answering yourself inside one context" as independent adjudication (see [`orchestration.md`](./orchestration.md)).
