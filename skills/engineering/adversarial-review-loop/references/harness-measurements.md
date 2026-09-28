# Harness Measurements for Reference (to Calibrate Your Own Probe Results)

> **This is not a configuration you should copy; it is measurements taken on two harnesses.**
> Its purpose is to give the five questions in [`harness-probe.md`](./harness-probe.md) a reference point: see what numbers others
> measured along these dimensions, then go back to your own tool list and ask those five questions too.
> **For your own machine, the answer is whatever you measured with your own hands**; it is normal for it to differ from this document.
>
> How to read it: first look at the descriptions in the columns and recognise which column you belong to (if you cannot tell, read both columns and go by what you measured yourself).
> The column names only mark which machine that row's data came from; they do not mean one machine is better.

## Measurement Dimensions and the Values Measured on Two Machines

Each row below gives the value measured for one dimension in `harness-probe.md` (one row each for ①/②/③/④, ⑤ split into two rows, plus one more that is not one of those five questions but is still relevant) — these are all **capability parameters you can reproduce on another machine**, but nobody can run them on your machine for you:

| Dimension | Machine A | Machine B |
|---|---|---|
| Dispatch tools and batching ability | One call carries an array for parallel batching; when not restricted, it lands on a generic executor | The same kind of tool may have been renamed, with the old name still working as an alias; omitting the type name raises an error |
| Nestable depth | Default **2** (configurable, the cap can be removed); at the cap the subagent's dispatch tool is removed | Default **3** (adjustable); in an interactive session only the top-level summary returns to the main session |
| How many you can dispatch in parallel at once | Default **32** | Default **20** (an error over the limit) |
| Whether read-only can be enforced | It can only be written into the task body as a hard constraint | Supports a tool allowlist / denylist, and `plan` mode is read-only too; note the allowlist only takes effect on certain main threads |
| Whether tiering by model is possible, and whether aliases really map to different models | Aliases can be used, but which model it lands on depends on the local configuration | **There is a pitfall here: an alias need not map to a different model at all** — see the next section |
| Whether artifacts can be read back on demand | There is an artifact address, and you can fetch the full text and the conversation record; inline summaries get truncated | Although there is a tool to fetch artifacts, it is **disabled for all subagents**; you can only require writing to disk + returning a path |
| Whether a subagent can read outside the working tree | It can (it inherits the parent process's current directory) | **It cannot**: in headless / non-interactive mode an out-of-bounds read is refused, and there is no popup to click accept — that is where the default "always land in a scratch directory inside the working tree" comes from |

## The pitfall of tiering by model (first confirm which model the "alias" actually maps to)

What you write in `model:` is only an alias, and which model it finally lands on depends on how your machine is configured: some organisations restrict you
to only a few models, and once the restriction is switched on, the aliases get remapped onto other models.
**Do not assume "the cheap tier" is necessarily cheap.** How to confirm: take a look inside your harness at which model the subagent is actually running on.

If on your machine several aliases all end up pointing at the same model, then **for tiering do not count on `model:` any more; save cost through the task
itself instead**: pin read-only down with an allowlist, compress the system prompt to the shortest, narrow a single task, and cap the step count when
necessary; control cost through the block count and batching in the main flow (that is, dispatch fewer), not through a cheap model.

## General reminders when you call on these capabilities

- An executor that is good at judgement may come with its own JSON output format, squashing the details into a "notes" field, or flattening them into plain
  prose, losing both the locations and the fixes — **do not use that kind of output as conclusions directly**; read the full text by the artifact address,
  or ask it again to "fill in the locations and fixes for these N items, following the format only".
- Require subagents to write long artifacts to **a directory the subagent can read** (see main flow §5), and to reply with conclusions + path only.
- Send all the tasks of one layer at once; run them in parallel and collect them together, rather than sending one and waiting for one.
