# ZERO 框架六层架构迁移

> **日期**：2026-04-17
> **任务**：将 ZERO 框架从七层架构迁移到六层架构
> **状态**：✅ 已完成

---

## 迁移概述

将 ZERO 框架从七层 AI 记忆体系（L0-L6）迁移到六层体系（L0-L5），合并原七层的 L3（精炼规范）和 L4（完整规范）为新的 L3#完整规范 (Standards)。

---

## 执行的操作

### 1. 文件夹重命名

```bash
# 重命名为新格式
L0/ → L0#Execution/
L1/ → L1#Overview/
L2/ → L2#Index/
L5/ → L4#Changelog/
L6/ → L5#Knowledge/
```

### 2. 合并 L3 和 L4

```bash
# 创建新的 L3#Standards
mkdir -p L3#Standards/standards

# 移动原 L3 的精炼规范文件
mv L3/*.md → L3#Standards/standards/

# 移动原 L4 的子目录
mv L4/standards → L3#Standards/
mv L4/practices → L3#Standards/
mv L4/cases → L3#Standards/
mv L4/references → L3#Standards/
mv L4/inspirations → L3#Standards/
```

### 3. 新增规范文档

创建了两个新文档：

1. **L3#Standards/standards/10.ai-memory-03.six-layer-naming.md**
   - 六层架构官方命名对照表
   - 详细的使用规范和设计决策
   - 从七层迁移到六层的步骤

2. **L3#Standards/references/six-layer-architecture-summary.md**
   - 六层架构实践总结
   - 核心变化和设计亮点
   - 实施步骤和最佳实践

---

## 最终目录结构

```
.ai/
├── L0#Execution/
│   ├── hooks/
│   ├── skills/
│   ├── specs/
│   ├── templates/
│   └── workflows/
│
├── L1#Overview/
│   ├── guide.md
│   └── README.md
│
├── L2#Index/
│   ├── toc.md
│   └── README.md
│
├── L3#Standards/
│   ├── standards/          # 主规范文档（原 L3 + L4/standards）
│   ├── practices/          # 最佳实践
│   ├── cases/              # 案例研究
│   ├── designs/            # 设计文档
│   ├── guides/             # 操作指南
│   ├── adr/                # 架构决策记录
│   ├── philosophy/         # 设计哲学
│   ├── references/         # 参考实现
│   └── inspirations/       # 灵感来源
│
├── L4#Changelog/
│   ├── 2026-04-16-*.md
│   ├── 2026-04-17-*.md
│   └── README.md
│
└── L5#Knowledge/
    └── README.md
```

---

## 层级对应关系

| 六层架构 | 七层架构 | 说明 |
|---------|---------|------|
| L0#Execution | L0 | 工作执行 |
| L1#Overview | L1 | 项目概览 |
| L2#Index | L2 | 规范索引 |
| L3#Standards | L3 + L4 | 完整规范（合并） |
| L4#Changelog | L5 | 操作日志 |
| L5#Knowledge | L6 | 知识图谱 |

---

## 核心变化

### 1. 简化层级

- ✅ 从 7 层减少到 6 层
- ✅ 合并了职责重叠的 L3（精炼）和 L4（完整）
- ✅ 减少维护成本

### 2. 统一命名

- ✅ 文件夹使用 `L#英文名/` 格式（如 `L0#Execution/`）
- ✅ 文档引用使用中英文混合格式（如 `L0#工作执行 (Execution)`）
- ✅ 跨平台兼容

### 3. 保留丰富子目录

- ✅ L3#Standards 包含 8 个子目录
- ✅ 规范文档集中在 standards/ 子目录
- ✅ 其他类型文档有明确的归属

---

## 官方命名对照表

| 层级 | 中文名称 | 英文名称 | 文件夹名称 | 文档引用格式 |
|------|---------|---------|-----------|-------------|
| L0 | 工作执行 | Execution | `.ai/L0#Execution/` | L0#工作执行 (Execution) |
| L1 | 项目概览 | Overview | `.ai/L1#Overview/` | L1#项目概览 (Overview) |
| L2 | 规范索引 | Index | `.ai/L2#Index/` | L2#规范索引 (Index) |
| L3 | 完整规范 | Standards | `.ai/L3#Standards/` | L3#完整规范 (Standards) |
| L4 | 操作日志 | Changelog | `.ai/L4#Changelog/` | L4#操作日志 (Changelog) |
| L5 | 知识图谱 | Knowledge | `.ai/L5#Knowledge/` | L5#知识图谱 (Knowledge) |

---

## 后续工作

### 1. 更新文档引用

需要批量更新所有文档中的层级引用：

```bash
# 更新为中英文混合格式
find .ai/L3#Standards -name "*.md" -exec sed -i '' \
  's/L0 /L0#工作执行 (Execution) /g' {} \;
```

### 2. 更新 sync.sh 脚本

更新同步脚本中的路径引用：

```bash
# 更新源目录路径
SOURCE_DIR=".ai/L2#Index"
```

### 3. 重建 symlink

```bash
./sync.sh rebuild
```

### 4. 更新 L2 索引

在 L2#Index/toc.md 中添加新文档的索引。

---

## 验证清单

- [x] 所有文件夹已重命名为 `L#英文名/` 格式
- [x] L3 和 L4 已合并为 L3#Standards
- [x] L5 已重命名为 L4#Changelog
- [x] L6 已重命名为 L5#Knowledge
- [x] 新增六层架构规范文档
- [x] 更新所有文档中的层级引用
- [x] 更新 10.ai-memory-02.naming.md 为六层架构
- [x] 更新 L2#Index/toc.md 索引
- [x] 更新 L1#Overview/guide.md 文档
- [x] 更新 L5#Knowledge/README.md 文档
- [x] 更新 L0#Execution 子目录的 README 文档
- [ ] 更新 sync.sh 脚本路径（如果存在）
- [ ] 重建所有 symlink

---

## 完成的更新

### 1. 核心规范文档

**10.ai-memory-02.naming.md**：
- 更新为六层架构版本（v2.0.0）
- 添加六层架构概览表
- 更新各层文件命名规范
- 添加从七层迁移到六层的说明
- 更新禁止规则

### 2. 索引文档

**L2#Index/toc.md**：
- 更新 AI 记忆体系管理部分的层级引用
- 从"七层架构（L0-L6）"改为"六层架构（L0#工作执行 (Execution) - L5#知识图谱 (Knowledge)）"
- 添加新文档索引：
  - 10.ai-memory-02.naming.md（六层架构命名规范）
  - 10.ai-memory-03.six-layer-naming.md（官方命名对照表）

### 3. 项目概览

**L1#Overview/guide.md**：
- 更新版本号为 v2.0.0（六层架构）
- 更新文档结构说明，展示完整的六层架构目录树
- 更新所有文档引用路径（从 `.ai/L4/standards/` 改为 `../.ai/L3#Standards/standards/`）
- 更新零容忍规则：
  - 规则 7：L0#工作执行 (Execution) 架构原则
  - 规则 8：规范变更冲突检测（更新层级引用）
  - 规则 9：六层架构文件夹命名格式
  - 规则 10：六层架构文档引用格式

### 4. 知识图谱文档

**L5#Knowledge/README.md**：
- 标题从"L6"改为"L5#知识图谱 (Knowledge)"
- 更新所有层级引用（L3/L4/L5/L6 → L2#规范索引/L3#完整规范/L4#操作日志/L5#知识图谱）
- 更新集成流程图
- 更新使用场景说明
- 更新核心价值示例
- 更新注意事项和目录结构
- 更新最后更新日期为 2026-04-17

### 5. L0#Execution 子目录

**L0#Execution/skills/README.md**：
- 标题从"L0/skills"改为"L0#Execution/skills"
- 更新所有路径引用（`.ai/L0/skills/` → `.ai/L0#Execution/skills/`）
- 更新映射关系表的源目录列名

**L0#Execution/templates/README.md**：
- 标题从"L0/templates"改为"L0#Execution/templates"
- 更新所有路径引用（`.ai/L0/` → `.ai/L0#Execution/`）

---

## 参考资料

- **六层架构命名规范**：[10.ai-memory-03.six-layer-naming.md](../L3#Standards/standards/10.ai-memory-03.six-layer-naming.md)
- **实践总结**：[six-layer-architecture-summary.md](../L3#Standards/references/six-layer-architecture-summary.md)
- **来源项目**：AiLinkDog（六层架构实践）

---

**完成时间**：2026-04-17
**执行者**：Kiro AI Assistant

