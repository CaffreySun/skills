# harness 专属能力与可直接落盘的 agent

> 按你正在用的 harness 读对应一节。含实测参数、模型分档陷阱、以及三段可以直接
> 写进 `~/.claude/agents/` 的 agent 定义。

## omp 专属能力（怎么用）

对应 [`harness-probe.md`](./harness-probe.md) 的五项能力，omp 的实现如下（实测）：

- **派工工具 `task`**：一次调用可带 `tasks[]` 批量并行；未限定的会话里省略 `agent` 字段，默认落到泛型 `task` agent。
- **内置 agent 名册**：`scout`（轻量读型，快 / 便宜）、`reviewer`（强判断）、`security-reviewer`、`task`（泛型，可作编排者）、`sonic`（低推理）。
- **嵌套**：`task.maxRecursionDepth` 默认 **2**（负值取消上限）；到达上限时子代理的 `task` 工具被移除、spawn 策略清空，所以「让下级再派」的指令无效。**编排者用泛型 `task`**；用 `reviewer` 当编排者时它声明 `spawns: scout`，派别的类型会被 preflight 拒（`Cannot spawn 'reviewer'. Allowed: scout`）。
- **产物寻址**：子代理产物是点号限定的 `<Orch>/<Orch>.<Child>.md`，可用 `agent://<Orch>.<Child>` 取全文、`history://<Orch>.<Child>` 取转写；**默认不读**，只在核对某条判决时取。注意行内摘要只给预览（约 5000 字截断），要全文得走 `agent://`。
- **追问子代理**：`hub send`（如「只按格式补这 N 条的定位与改法」）。
- **子代理可读工作区外**：子代理继承父 cwd，`/tmp`、`~/.omp/...` 都能读（实测：本轮多个子代理反复读 `/tmp/skill-merge/*` 均正常）。所以系统临时目录在 omp 下可用；但按 `SKILL.md` §5 统一落在工作区内也无副作用，且跨 harness 更省心。
- **只读约束**：写进任务正文（该 harness 不强制）；`reviewer` 自带 JSON schema，可能把细节压成 prose，别直接当结论。
- **并发**：`task.maxConcurrency` 默认 32；子代理 idle TTL 默认 7 分钟；`blocking: true` 的 agent 内联执行。

## Claude Code 专属能力（怎么用）

（v2.1.278 实测 + 官方文档）

- **派工工具 `Agent`**（v2.1.63 起由 `Task` 改名，旧名仍作别名）；**必须给 `subagent_type`**，除非会话里有 `general-purpose` 兜底（否则报 `subagent_type is required`）。
- **可用类型**：内置 `Explore`（只读、快，模型继承主会话但封顶 Opus；**自定义一个同名 `Explore` 并设 `model: haiku` 即可把它压到便宜模型**）、`Plan`（只读）、`General-purpose`（全工具，可作编排者）、`claude`（兜底）；自定义 agent 放 `~/.claude/agents/<name>.md`（用户级）或 `.claude/agents/`（项目级），frontmatter 支持 `name` / `description` / `tools` / `disallowedTools` / `model` / `permissionMode` / `maxTurns` / `skills` / `mcpServers` / `hooks` / `memory` / `background` / `omitClaudeMd` / `effort` / `isolation`。
- **嵌套**：**默认允许子代理再派，深度 3 层**（`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` 可调）；到上限时不再给 `Agent` 工具。交互式会话里**只有顶层摘要回到主会话**，且「派了后台子代理的子代理会等它们结束才收工」——即编排者模式是原生支持的；非交互 / Agent SDK 下编排者不等待。
- **只读与白名单可强制**：`tools: Read, Grep, Glob, Bash`（allowlist）或 `disallowedTools: Write, Edit`（denylist）；`permissionMode: plan` 也给只读。注意 `Agent(类型表)` 白名单只在「以 `claude --agent` 跑的主线程」上生效，子代理定义里括号内的类型表被忽略。
- **模型分档**：`model: sonnet|opus|haiku|fable|inherit` 或完整 model id；调用时还能传 per-invocation `model`；`CLAUDE_CODE_SUBAGENT_MODEL`（+`_FORCE=1`）可全局钉；`/tasks` 里能看到子代理实际跑在哪个模型。
- **追问 / 续跑**：`SendMessage`（按 name 或 agent ID 续跑；子代理发起的结果回报给它的发起者，不是主会话）；`maxTurns` 到顶会把输出标为 partial 并可续跑。
- **并发上限**：**同时 20 个**子代理（超了报 `Concurrent subagent limit reached`），`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` 可调；本流程的「分区数 × 2」通常远低于它，但**复核批量要分批发**。
- **产物回读**：主会话有 `TaskOutput`，但**该工具对所有子代理都被移除**（子代理拿不到别人产物）；交互式可用 `/tasks` → Enter 打开某子代理 transcript；transcript 作为独立文件持久在会话目录（保留 30 天）。**因此基线做法一律是：任务里要求子代理把长产物写到**工作区内的 scratch 目录**（见下一条）、只回 ≤20 行结论 + 产物路径。**
- **子代理的读取范围限于工作区（实测）**：无头 / 非交互（`claude -p`）下子代理读工作区外的文件（如 `/tmp/...`）被判权限拒绝，且没有弹窗可批——实测让 `review-scout` 核对 `/tmp/arh-test/*.md` 时它只回报「读不到、拒绝编造」，把同一批文件放进工作区（cwd）后立刻给出 `file:line` + 逐字原文 + 反证。**所以 `SKILL.md` §5「落盘位置」一律取工作区内的 scratch 目录**；交互式会话虽可用权限批准放行，但别把流程建立在「用户会点同意」上。
- **其它**：`isolation: worktree` 给子代理隔离仓副本；子代理定义里 `skills:` 可预载 skill 全文；所有子代理的 `description` 合计超 15000 token 会告警（description 写短）；`.claude/agents/` 目录被监听，改完几秒生效（新建目录需重启）。

### 模型分档：先核实「别名 → 实际模型」的映射，再决定靠什么分档

**(a) 通用做法（模型分档确实可用时）**：机械核对 agent 用便宜模型、需判断力的 agent 用强模型——`model:` 只是别名，最终映射取决于本机配置。

**(b) 本机现实（这台机器上分档已塌成一个模型，2026-09 实测）**：Claude Code 走第三方网关，`~/.claude/settings.json` 的 `env` 里 `ANTHROPIC_MODEL`、`ANTHROPIC_DEFAULT_HAIKU_MODEL`、`ANTHROPIC_DEFAULT_SONNET_MODEL`、`ANTHROPIC_DEFAULT_OPUS_MODEL`、`CLAUDE_CODE_SUBAGENT_MODEL` **全部 = `deepseek-v4-flash[1m]`**，并且 `availableModels: ["deepseek-v4-flash[1m]"]` + `enforceAvailableModels: true`，`CLAUDE_CODE_EFFORT_LEVEL = max`。结论：写 `model: haiku` / `sonnet` / `opus` **不会**真的分到不同模型（别名被重映射 + 白名单只允许一个模型），`CLAUDE_CODE_SUBAGENT_MODEL_FORCE` 也无意义。
→ 此情形下**改用「agent 设计」而不是模型来分档**：只读工具 allowlist（`tools: Read, Grep, Glob, Bash`）、系统提示压到最短、单次任务足够窄、必要时 `maxTurns` 限步；成本控制靠 `SKILL.md` §6 的分区数与合组（**少派几个**）而不是靠便宜模型。下文的三个 agent 定义在 (a) 情形照用，在 (b) 情形下 `model:` 行是空操作、其余部分照用。

**通用提醒**：如果你的组织用 `availableModels` 限制模型，请把别名与实际模型的关系在本地核实一遍（`/tasks` 里能看到子代理实际跑的模型），**别默认 `haiku` 真便宜**。

### 建议落盘的三个 agent（可直接写入）

三段定义照 (a) 情形写 `model:`；若本机如 (b) 所述分档塌成一个模型，`model:` 行不产生任何差异——此时**分档靠定义本身**：工具 allowlist（只读三项 + `Bash`）、系统提示最短、单次任务窄、成本靠 `SKILL.md` §6 的分区数与合组（少派几个）。`tools:` 那一行在两种情形下**都必须**保留：只读在白名单里是硬约束，不是偏好。

`~/.claude/agents/review-scout.md`：

```markdown
---
name: review-scout
description: 只读机械核对发现者：判「某行是否真这样写 / 某词是否还有残留 / 某引用是否还解析得到 / 计数是否一致」。
model: haiku   # 别名分档可用时；本机实测 haiku/sonnet/opus 同值，此行是空操作（见上文「模型分档」）
tools: Read, Grep, Glob, Bash
---

你是只读的机械核对发现者，只做可机械判定的事实核对，不做语义判断、不做权衡取舍。

- 绝不修改任何文件，不跑测试 / lint / 全量命令，不做 git 写操作。
- 每条结论必须给 `file:line` + 逐字原文摘录；禁止「建议加强一致性」这类空话。
- 允许并接受「零问题」结论。
- 一次被要求核对多条时：逐条独立给结论，禁止「同上」「该类整体没问题」，不得受同组其他项影响；顺序是先逐条判决、再写组内小结。
```

`~/.claude/agents/review-judge.md`：

```markdown
---
name: review-judge
description: 只读复核者：对单条 claim 独立证伪，必须给反证或收窄边界。
model: sonnet   # 别名分档可用时；本机实测与 haiku/opus 同值（见上文「模型分档」）
tools: Read, Grep, Glob, Bash
---

你是只读复核者，任务是对**一条** claim 独立判断成立与否。

- 不要假设 claim 成立，自己读文件取证。
- 判决只有三档：有效 / 部分有效 / 无效。
- 输出固定字段：判决 / 证据（file:line + 原文）/ 边界（仅「部分有效」：成立与不成立的条件）/ 最小改法（可直接替换的 old→new + 连带影响）/ 反证（仅「无效」：file:line + 原文）。
- 若站不住就判无效并给反证，**不要附和**；说明 claim 里哪句被夸大。
- 绝不修改任何文件，不跑测试 / lint / 全量命令，不做 git 写操作。
```

（可选）`~/.claude/agents/review-orch.md`：

```markdown
---
name: review-orch
description: 审查编排者：自己派只读发现者与复核者跑完一轮对抗审查，只回结论。
model: sonnet   # 别名分档可用时；本机实测与 haiku/opus 同值（见上文「模型分档」）
tools: Agent, Read, Grep, Glob, Bash
---

你是审查编排者，自己跑完一轮对抗审查，只把结论交回。

- 按「规模与降档」定分区数（2–6），并行派只读发现者，互不重叠、只读。
- 去重后：需独立判断的项 1 项 1 子代理单派、机械核对项按类合组（≤4 条/组，组内逐条独立判决、禁「同上」）；复核者必须是全新子代理，不是发现者。
- 最终答复 ≤20 行：结论 + 判决分布 / 发现表（`# | file:line | 判决 | 一句话问题 | 最小改法(old→new)`）/ 待用户决策项（六要素）/ 派了几个子代理。
- 禁止把子代理原始输出贴回来；未授权不得修改任何文件。
```

调用时用 `subagent_type: review-scout` / `review-judge` / `review-orch`；主线程若想限制可派类型，用 `tools: Agent(review-scout, review-judge)`（**仅在 `claude --agent` 主线程生效**）。
