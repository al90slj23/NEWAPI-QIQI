# ZERO 文档结构迁移指南

> **迁移日期**：2026-04-26
> **版本**：v2.0.0
> **变更**：`rules/` / 旧七层 `.ai/` → 六层 `.ai/`

---

## 目标结构

```
ZERO/
└── .ai/
    ├── L0#Execution/      # hooks、skills、specs、templates、workflows
    ├── L1#Overview/       # 项目概览与零容忍规则
    ├── L2#Index/          # 分类索引与标题大纲
    ├── L3#Standards/      # 当前唯一规范主版本
    ├── L4#Changelog/      # 操作日志与迁移记录
    └── L5#Knowledge/      # 知识图谱与知识沉淀
```

---

## 路径迁移表

| 旧路径 | 新路径 |
|--------|--------|
| `ZERO/rules/standards/` | `ZERO/.ai/L3#Standards/standards/` |
| `ZERO/rules/condensed/` | 合并进 `ZERO/.ai/L3#Standards/standards/` |
| `ZERO/rules/references/` | `ZERO/.ai/L3#Standards/references/` |
| `ZERO/rules/inspirations/` | `ZERO/.ai/L3#Standards/inspirations/` |
| `ZERO/worklogs/` | `ZERO/.ai/L4#Changelog/` |
| `ZERO/.ai/L0/` | `ZERO/.ai/L0#Execution/` |
| `ZERO/.ai/L1/` | `ZERO/.ai/L1#Overview/` |
| `ZERO/.ai/L2/` | `ZERO/.ai/L2#Index/` |
| `ZERO/.ai/L3/` + `ZERO/.ai/L4/` | `ZERO/.ai/L3#Standards/` |
| `ZERO/.ai/L5/` | `ZERO/.ai/L4#Changelog/` |
| `ZERO/.ai/L6/` | `ZERO/.ai/L5#Knowledge/` |

---

## 迁移步骤

1. 更新 ZERO 仓库：

```bash
cd ZERO
git pull --ff-only origin main
```

2. 扫描旧路径引用：

```bash
rg "rules/|\\.ai/L[0-6]/|condensed|七层"
```

3. 将规范主版本统一到 L3#完整规范 (Standards)：

```bash
mkdir -p ".ai/L3#Standards/standards"
```

4. 更新 IDE 映射：

```bash
./gogogo.sh 8f
```

5. 验证当前规范入口：

```bash
test -f ".ai/L1#Overview/guide.md"
test -f ".ai/L2#Index/toc.md"
test -d ".ai/L3#Standards/standards"
```

---

## 规则

- 当前规范只写入 L3#完整规范 (Standards)。
- L2#规范索引 (Index) 只保存索引和标题大纲。
- L4#操作日志 (Changelog) 保留历史，不作为当前规范来源。
- L5#知识图谱 (Knowledge) 可沉淀关系和经验，但不能覆盖 L3 当前规范。
- 旧七层内容迁移完成后，不再新增旧路径。

---

## 相关文档

- [AI 记忆体系架构](../standards/10.ai-memory-01.architecture.md)
- [AI 记忆体系命名规范](../standards/10.ai-memory-02.naming.md)
- [六层架构官方命名对照表](../standards/10.ai-memory-03.six-layer-naming.md)
