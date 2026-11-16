# skills

[English](./README.md) | 中文版

两个互补技能，分别支持有判断力的规划和基于证据的审查。两者都按任务分配精力，
而不是对每项改动强制执行同一套流程。

| Skill | 适用场景 | 提供的帮助 |
|---|---|---|
| [`task-spec`](./skills/engineering/task-spec/SKILL.md) | 有不确定性、重要后果、协作需求，或明确要求规划的任务 | 按风险选择规划深度，保留用户约束，根据证据调整实现并验证预期结果。 |
| [`adversarial-review-loop`](./skills/engineering/adversarial-review-loop/SKILL.md) | 改动、提案等对象的实质性审查 | 发现有依据的问题，按需独立检查重要不确定性，并按风险选择验证方式；只审查模式把修复留给调用方。 |

## 为什么是这两个

规划和验证回答不同问题：方案是否合适，结果是否达到预期。`task-spec` 组织规划、执行和
结果验证；`adversarial-review-loop` 提供按风险分配精力的实质审查，在独立检查有价值时
使用它。流程不能代替判断，两者都需要从实际工作中取得证据。

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

**规划到足以行动，根据证据调整。** 用户要求和明确审批关卡始终有效；模型自己选择的实现
计划可以随新证据调整。常规可逆工作不必创建规格文件或经过独立挑战。

重要决策、实质依赖或交接需要可检查的计划。调查真实取舍，不凑配额。局部错误就地修复，
方案假设失效才重新选择方案。独立审查聚焦重要问题，不再充当两道必经关卡。对照原始请求
验证实际结果；只要求方案时，以交付方案结束。

[读这个技能 →](./skills/engineering/task-spec/SKILL.md)
· [为什么这样设计 →](./docs/engineering/task-spec.zh.md)

### adversarial-review-loop

**审查 → 处理有依据的问题 → 适当验证。** 主代理直接协调，常规发现不额外派裁决者。
独立检查聚焦重要分歧、高影响但证据不足的主张和关键假设。

**只审查／judge-only** 返回发现而不修改对象。**审查并修复／full round** 完成已授权
修复并验证实际修改。追加审查需要具体未决风险，不要求不断循环到零发现。复用有效证据，
报告重要未知，不把预算用完当成通过。

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
```

## 发版

`main` 就是发布态。只有合并能进，`check` 必须先通过，而且 CI 会给每一个落地的提交打
tag——所以 `main` 上不存在没有版本的提交。已发布的 tag 不能移动也不能删。

这条必须成立，因为 `npx skills add CaffreySun/skills` 取的是 `main` 的尖端、根本不看
版本号：那里有什么，未固定的人拿到的就是什么。版本号怎么选、流程怎么走，见
[`RELEASING.md`](./RELEASING.md)。

## 开源协议

MIT
