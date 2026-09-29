<!--
Format reference for the task-spec skill.
You MUST follow the constraints in SKILL.md when filling this in.
Execute phase is NOT written here — track it with todo_write.
Four phases are recorded: Explore, Spec, Challenge, Verify.
-->
# spec: <slug>

## Cycle 1

**Frozen copy**: this file is the frozen object for the round. Record its digest
before the round starts and check it again before the next round
(`shasum -a 256 .task_spec/<slug>.md`).

### Explore
<problem understanding, directions considered, directions eliminated and why>

### Spec
<spec body: What / How / Verify criteria / reasoning>

**Intentional omissions** — what this change deliberately does not do; alternatives
considered and rejected; details deliberately left unwritten. Write "none" if there
is nothing on it. Every finder in Challenge and Verify gets this list verbatim.

- <item>
- <item>

### Challenge

<judge-only round of the `adversarial-review-loop` skill. Object = the Spec body.
Standard = the task request plus the Explore output.>

- Edge cases: <at least 2>
- Wrong assumptions: <at least 1>
- Overengineering: <at least 1>
- Risk: <destructive? blast radius? rollback?>
- Traversal: <solution space thoroughly covered? eliminations defensible?>

**Surviving findings** (the adjudicated list — write "none" if the round produced
nothing; anything "partially valid" or "subsumed" appears as its rewrite):

| # | Location | Severity | Problem | Minimal fix | Confidence |
|---|---|---|---|---|---|

Verdict spread: <n valid / n partially valid / n subsumed / n invalid-discarded>
Routing: minor → Spec · major → Explore · none → Execute

### Verify

<judge-only round of the `adversarial-review-loop` skill. Object = what was produced
plus the change that produced it. Standard = the acceptance criteria above.>

- <criterion 1>: PASS / FAIL — <evidence>
- <criterion 2>: PASS / FAIL — <evidence>
- Walk over the change (the cross-cutting block): <what should have moved with it
  and didn't, and what moved that shouldn't have>

**Surviving findings**:

| # | Location | Severity | Problem | Minimal fix | Confidence |
|---|---|---|---|---|---|

Verdict spread: <n valid / n partially valid / n subsumed / n invalid-discarded>
Routing: none → task complete · anything → Explore for a new cycle

## Cycle 2 (triggered by <specific reason>)
…
