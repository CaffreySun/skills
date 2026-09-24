<!--
Format reference for the task-spec skill.
You MUST follow the constraints in SKILL.md when filling this in.
Execute phase is NOT written here — track it with todo_write.
Four phases are recorded: Explore, Spec, Challenge, Verify.
-->
# spec: <slug>

## Cycle 1

### Explore
<problem understanding, directions considered, directions eliminated and why>

### Spec
<spec body: What / How / Verify criteria / reasoning>

### Challenge
- Edge cases: <at least 2>
- Wrong assumptions: <at least 1>
- Overengineering: <at least 1>
- Risk: <destructive? blast radius? rollback?>
- Traversal: <solution space thoroughly covered? eliminations defensible?>
- Verdict: PASS or FAIL (if FAIL → defect classification + routing target)

### Verify
- <criterion 1>: PASS / FAIL (with evidence — e.g. "curl returned … matching expected")
- <criterion 2>: PASS / FAIL (with evidence)
- …
- Verdict: all passed / triggers Cycle N+1 (state reason)

## Cycle 2 (triggered by <specific reason>)
…
