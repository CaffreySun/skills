# skills

[English](./README.md) | 中文版

我的 agent skills。两个，合起来覆盖同一个问题：**AI 从不检查自己的工作。**

它们是同一个质量控制流程的两部分——一个跑在 AI **动手之前**，一个跑在有了可核对的东西之后（多数时候是动手之后，但也包括提案、契约这类从未「动手」的对象）。

| Skill | 跑在什么时候 | 它强制的事 |
|---|---|---|
| [`task-spec`](./skills/engineering/task-spec/SKILL.md) | 动手之前 | 先探索方案空间，写出一份可检查的 spec，再让这份 spec 被对抗性挑战一轮——在碰任何一个文件之前。 |
| [`adversarial-review-loop`](./skills/engineering/adversarial-review-loop/SKILL.md) | 正确性无法自证、漏检代价高于误报代价的任意对象 | 把「发现问题」和「判断问题是否成立」拆给不同角色，每条发现都由没产出它的上下文裁决；完整回合修掉活下来的，再连修复本身复审，直到某轮什么都不剩，判断回合则停在清单交接。对象是 diff、提案、迁移方案、契约都行，具体形态由应用时决定。 |

## 为什么是这两个

LLM 逐个 token 生成文本，每次挑统计上最可能的那个。一个正确答案和一个看起来合理的错
答案，在统计上是同一种东西——模型从里面分辨不出来。这一个问题出现在两处，需要两种
不同的修法。

**验证**是容易的那一半：「这个东西符不符合它该符合的标准」是个客观问题，可以从外部
强制——一份契约、一张清单、一组证据。**思考**是难的那一半。「方向对不对」需要的，是
模型没有的东西：一套判断「什么算更好」的标准，而模型只能按「哪个更可能出现」来选。
它不是懒才草率收场，是它分辨不出哪个方向更深。人类的对应物是**态度**，而你没法靠提示
词让模型*想*把事情做好。

**动手之前——第一个念头直接胜出。** 概率最高的续写就是第一个「想法」，然后模型就照着
跑。没有替代方案，没有「这是不是真正的问题」。所以这一半只能靠流程来约束：带着模型走一遍
一个真的在乎事情做得好的人自然会走的那几步。这是 `task-spec`。

**有了可核对的东西之后——「做完了」等于「做好了」。** 模型不会自己发现矛盾和漏项。所以
这一半才是能从外部强制的那一半——这对一份提案、一份契约和一批已完成的改动同样成立。
这是 `adversarial-review-loop`——它的核心纪律是：发现问题的角色和判断问题是否成立的
角色，**绝不能是同一个上下文**。

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

默认取的是默认分支的尖端。要固定到某个发布版本，加上 `#<ref>`——tag、分支名、提交 SHA 都行：

```bash
npx skills add CaffreySun/skills#v1.0.0 --skill task-spec
```

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

挑战和审查这两个阶段，各自按 `adversarial-review-loop` 的**判断回合**跑。方法和步骤由
那个技能提供——准备好材料、找问题、每条发现都由没写过它的上下文裁决。路由仍归
task-spec，「审查阶段不动手修」这条规矩也仍归 task-spec：修发生在定规或探索阶段，修完
这个阶段再跑一遍。

[读这个技能 →](./skills/engineering/task-spec/SKILL.md)
· [为什么这样设计 →](./docs/engineering/task-spec.zh.md)

### adversarial-review-loop

两种回合。**完整回合**修掉活下来的发现，再把修复送回去复审，直到某一轮什么都不剩。
**判断回合**在裁决之后停下，把问题清单交出去，用在「修和再进入由别的流程负责」的场合
——`task-spec` 的挑战和审查两个阶段就是这么用它的。

来自实测数字，不是推理。三个来自真实项目的数字：

- **51 处修复里有 16 处是修复自己引入的**（这个数字决定了必须「修后再审」，直到某轮
  零发现才停）。
- **14 条发现里有 8 条被降级或推翻**（1 条判无效、7 条降为部分有效——这就是为什
  么发现问题的角色不能同时是判定它是否成立的角色）。
- 某 24 文件规范 + 代码改动的收敛过程：**8 → 3 → 3 → 2 → 0**（每轮修后审查在上一
  轮修复里又找出的新问题数）。

[读这个技能 →](./skills/engineering/adversarial-review-loop/SKILL.md)
· [为什么这样设计 →](./docs/engineering/adversarial-review-loop.zh.md)

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
npm run check    # 清单 + 版本号 + changelog 三者一致（CI 门禁用这个）
npm run check:release   # 同上，再跟这个分支将要落地的提交比一次
./scripts/link-skills.sh   # 把技能软链到 ~/.claude/skills 和 ~/.agents/skills
```

已经占着位置的东西一律保留、绝不删除：实体目录会被移到 `.bak-<名字>-<时间戳>/`；
软链则会把它指向的**实际内容**（而不是链接本身）复制到同一个位置。重复运行不会重复
产生备份。

## 发版

`main` 就是发布态。只有合并能进，`check` 必须先通过，而且 CI 会给每一个落地的提交打
tag——所以 `main` 上不存在没有版本的提交。已发布的 tag 不能移动也不能删。

这条必须成立，因为 `npx skills add CaffreySun/skills` 取的是 `main` 的尖端、根本不看
版本号：那里有什么，未固定的人拿到的就是什么。版本号怎么选、流程怎么走，见
[`RELEASING.md`](./RELEASING.md)。

## 开源协议

MIT
