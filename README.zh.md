# skills

[English](./README.md) | 中文版

我的 agent skills。两个，合起来覆盖同一个失效点：**AI 从不检查自己的工作。**

它们是同一个质量闭环的两半——一半跑在 AI **动手之前**，一半跑在**动手之后**。

| Skill | 跑在什么时候 | 它强制的事 |
|---|---|---|
| [`task-spec`](./skills/engineering/task-spec/SKILL.md) | 动手之前 | 先探索方案空间，写出一份可检查的 spec，再让这份 spec 被对抗性挑战一轮——在碰任何一个文件之前。 |
| [`adversarial-review-loop`](./skills/engineering/adversarial-review-loop/SKILL.md) | 动手之后 | 把「发现问题」和「判断问题是否成立」拆给不同角色，只修扛住复核的部分，然后连修复本身再审一轮，直到某轮零发现。 |

## 为什么是这两个

LLM 逐个 token 生成文本，每次挑统计上最可能的那个。一个正确答案和一个看起来合理的错
答案，在统计形状上是同一个东西——模型从里面分辨不出来。这个问题破在两处，需要两种
不同的修法：

**动手之前——第一个念头直接胜出。** 概率最高的续写就是第一个「想法」，然后模型就照着
跑。没有替代方案，没有「这是不是真正的问题」。你没法靠提示词让模型**想**把事情做
好，你只能用结构逼它走完那些步骤。这是 `task-spec`。

**动手之后——「做完了」等于「做好了」。** 模型不会自己发现矛盾和漏项。但「产出是否符
合规格」是个客观问题，可以从外部强制。这是 `adversarial-review-loop`——它的核心纪律
是：发现问题的角色和判断问题是否成立的角色，**绝不能是同一个上下文**。

## 安装

两条路，两种哲学。选一条——两条都装会得到双份技能。

### Claude Code 插件（托管式，自动更新）

```bash
/plugin marketplace add CaffreySun/skills
/plugin install caffreysun-skills
```

拿到的是只读副本，我发新版时它自动跟上。订阅，别 fork。

### `skills` CLI（可编辑，归你）

```bash
# 看看有什么
npx skills add CaffreySun/skills --list

# 全装
npx skills add CaffreySun/skills

# 或者挑一个
npx skills add CaffreySun/skills --skill task-spec
npx skills add CaffreySun/skills --skill adversarial-review-loop
```

这条把普通文件写进你的仓库，归你所有、可以改。想拉我的更新时跑 `npx skills update`。

适用于[所有支持 skills 的 agent](https://github.com/vercel-labs/skills#supported-agents)：
Claude Code、Codex、Cursor、OpenCode 等 70+ 个。

## 两个技能

### task-spec

> spec 不是一份要填的模板。它是一套质量控制流程的产出。流程没转起来，质量就没发生。

五个阶段，两层循环：

**探索 → 定规 → 挑战 → 执行 → 审查**

内循环（探索 → 定规 → 挑战）在动手前打磨方案。外循环（执行 → 审查 → 探索）在动手后
验证产出。

spec 是**不可偏离的契约**：执行只能照它做，审查只能拿它判。没有一份 spec 能跳过对抗
性挑战直接进执行。

[读这个技能 →](./skills/engineering/task-spec/SKILL.md)
· [为什么这样设计 →](./docs/engineering/task-spec.md)

### adversarial-review-loop

来自实测数字，不是推理。三个来自真实项目的数字：

- **51 处修复里有 16 处是修复自己引入的**（这个数字决定了必须「修后再审」，直到某轮
  零发现才停）。
- **14 条发现里有 8 条被降级或推翻**（1 条判无效、7 条降为部分有效——这就是为什
  么发现问题的角色不能同时是判定它是否成立的角色）。
- 某 24 文件规范 + 代码改动的收敛轨迹：**8 → 3 → 3 → 2 → 0**（每轮修后审查在上一
  轮修复里又找出的新问题数）。

[读这个技能 →](./skills/engineering/adversarial-review-loop/SKILL.md)
· [为什么这样设计 →](./docs/engineering/adversarial-review-loop.md)

## 仓库结构

```
skills/<分类>/<名字>/SKILL.md    # 指令，agent 每次触发都要读
skills/<分类>/<名字>/*.md        # 配套文件，按需加载
docs/<分类>/<名字>.md            # 长文 rationale，写给人看
.claude-plugin/                  # Claude Code 插件清单
scripts/                         # 维护脚本
```

每个技能都把 `SKILL.md` 压得很紧：只留「按什么顺序做什么」。凡是「为什么」、或者只有
某条分支才用得上的内容，都拆到同级文件里、在需要的地方用链接指向。AI 只在真的点进
去时才付那部分成本。

加一个新技能要改**两处**：放进目录，再把路径加到 `.claude-plugin/plugin.json`。忘了
第二处的话 `npm run check` 会失败。

## 维护脚本

```bash
npm run list     # 列出所有 SKILL.md
npm run check    # 断言 plugin.json 与磁盘一致（CI 里用）
./scripts/link-skills.sh   # 把技能软链到 ~/.claude/skills 和 ~/.agents/skills
```

已经占着位置的东西一律保留、绝不删除：实体目录会被移到 `.bak-<名字>-<时间戳>/`；
软链则会把它指向的**实际内容**（而不是链接本身）复制到同一个位置。重复运行不会重复
产生备份。

## 开源协议

MIT
