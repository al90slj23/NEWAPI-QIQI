# 六层架构实践总结

> **来源项目**：AiLinkDog
> **创建日期**：2026-04-17
> **文档类型**：参考实现

---

## 概述

本文档总结了 AiLinkDog 项目从七层架构迁移到六层架构的实践经验，包括设计决策、实施步骤和最佳实践。

---

## 核心变化

### 层级合并

**七层架构**：
```
L0 - 项目进度管理
L1 - 项目概览
L2 - 规范索引
L3 - 精炼规范（200-300 行）
L4 - 完整规范（详细说明）
L5 - 操作日志
L6 - 知识图谱
```

**六层架构**：
```
L0 - 工作执行
L1 - 项目概览
L2 - 规范索引
L3 - 完整规范（合并了七层的 L3+L4）
L4 - 操作日志
L5 - 知识图谱
```

**合并理由**：
1. **简化层级**：七层的 L3（精炼）和 L4（完整）职责重叠
2. **减少维护成本**：避免在两个层级维护相似内容
3. **提高效率**：AI 直接读取完整规范，无需先读精炼再读完整
4. **保持灵活性**：L3 内部可以有子目录（standards/practices/cases 等）

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

详见：[10.ai-memory-03.six-layer-naming.md](../standards/10.ai-memory-03.six-layer-naming.md)

---

## 设计亮点

### 1. 文件夹命名使用 `#` 符号

**格式**：`.ai/L0#Execution/`

**优势**：
- ✅ 跨平台兼容（Windows/macOS/Linux）
- ✅ 视觉上清晰分隔层级和名称
- ✅ 不与连字符命名冲突（如 `api-design.md`）
- ✅ 不与下划线命名冲突（如 `admin_users` 表名）
- ✅ 符号语义明确（`#` 常用于标签、标识符）

### 2. 中英文混合引用格式

**格式**：`L0#工作执行 (Execution)`

**优势**：
- ✅ 中文名便于人类理解
- ✅ 英文名便于 AI 理解
- ✅ 两者结合，最大化可读性
- ✅ 明确对应关系

### 3. L3 子目录结构

```
.ai/L3#Standards/
├── standards/      # 主规范文档（原七层的 L4/standards）
├── practices/      # 最佳实践
├── cases/          # 案例研究
├── designs/        # 设计文档
├── guides/         # 操作指南
├── adr/            # 架构决策记录
├── philosophy/     # 设计哲学
└── references/     # 参考实现
```

**优势**：
- ✅ 保留了七层架构的丰富子目录
- ✅ 规范文档集中在 standards/ 子目录
- ✅ 其他类型文档有明确的归属
- ✅ 便于扩展和维护

---

## 实施步骤

### Phase 1: 重命名文件夹

```bash
# 备份
cp -r .ai .ai.backup

# 重命名
mv .ai/L0 ".ai/L0#Execution"
mv .ai/L1 ".ai/L1#Overview"
mv .ai/L2 ".ai/L2#Index"
mv .ai/L3 ".ai/L3#Standards"
mv .ai/L5 ".ai/L4#Changelog"
mv .ai/L6 ".ai/L5#Knowledge"
```

### Phase 2: 更新文档引用

使用 sed 批量替换：

```bash
# 更新 L3 规范文档
find ".ai/L3#Standards/standards" -name "*.md" -exec sed -i '' \
  's/L0#工作执行 \([^(]\)/L0#工作执行 (Execution) \1/g' {} \;

find ".ai/L3#Standards/standards" -name "*.md" -exec sed -i '' \
  's/L1#项目概览 \([^(]\)/L1#项目概览 (Overview) \1/g' {} \;

# ... 其他层级
```

### Phase 3: 更新脚本路径

```bash
# 更新 gogogo.sh 或 sync.sh
sed -i '' 's|.ai/L2|.ai/L2#Index|g' gogogo.sh
```

### Phase 4: 重建 symlink

```bash
./gogogo.sh ai rebuild
# 或
./sync.sh rebuild
```

### Phase 5: 验证

```bash
# 检查文件夹结构
tree -L 1 .ai/

# 检查文档引用
grep -r "L0#工作执行 (Execution)" .ai/L3#Standards/

# 检查 symlink
ls -la .kiro/steering/
```

---

## 最佳实践

### 1. 历史文档保持原样

**原则**：历史操作日志（L4#Changelog）中的文档保持原样，反映当时的状态。

**示例**：
- `2026-04-16-*.md`：使用旧命名（如 `L0#工作执行`）
- `2026-04-17-*.md`：使用新命名（如 `L0#工作执行 (Execution)`）

### 2. 规范文档使用完整命名

**原则**：所有规范文档（L3#Standards）必须使用完整的中英文混合格式。

**示例**：
```markdown
详见 [L2#规范索引 (Index)](../../L2#Index/toc.md)
参考 [L3#完整规范 (Standards)](../../L3#Standards/standards/)
```

### 3. 日常沟通可以简称

**原则**：人类对话和 AI 对话中可以简称，AI 会自动关联。

**示例**：
```
"请查看 L2 找到 API 设计规范"  ← AI 理解为 L2#规范索引 (Index)
"更新 L3 中的错误处理规范"      ← AI 理解为 L3#完整规范 (Standards)
```

### 4. 零容忍规则

**规则 25**：**六层架构文件夹必须使用 `L#英文名/` 格式**（如 `.ai/L0#Execution/`）

**规则 26**：**六层架构文档引用必须使用中英文混合格式**（如 `L0#工作执行 (Execution)`）

---

## 迁移检查清单

- [ ] 所有文件夹已重命名为 `L#英文名/` 格式
- [ ] L3#Standards 规范文档使用中英文混合格式
- [ ] L2#Index 索引文档使用中英文混合格式
- [ ] L1#Overview 概览文档使用中英文混合格式
- [ ] 所有路径引用已更新
- [ ] gogogo.sh/sync.sh 脚本路径已更新
- [ ] 所有 symlink 已重建
- [ ] AGENTS.md symlink 已更新
- [ ] 零容忍规则已添加
- [ ] 官方命名对照表已添加到 L1/L2

---

## 工具兼容性

### 文件夹命名兼容性

| 工具 | `#` 符号支持 | 测试结果 |
|------|-------------|---------|
| macOS Finder | ✅ | 正常显示 |
| Windows Explorer | ✅ | 正常显示 |
| Linux | ✅ | 正常显示 |
| Git | ✅ | 正常追踪 |
| VS Code | ✅ | 正常打开 |
| Kiro | ✅ | 正常加载 |
| Cursor | ✅ | 正常加载 |
| Claude Code | ✅ | 正常加载 |

### Symlink 兼容性

所有主流 AI 开发工具都支持通过 symlink 加载文档：

```bash
.kiro/steering/toc.md → .ai/L2#Index/toc.md
.claude/rules/toc.md → .ai/L2#Index/toc.md
.cursor/rules/toc.md → .ai/L2#Index/toc.md
```

---

## 收益分析

### 1. 简化层级

- ✅ 从 7 层减少到 6 层
- ✅ 减少维护成本
- ✅ 降低学习曲线

### 2. 统一命名

- ✅ 中英文对照明确
- ✅ 文件夹命名规范统一
- ✅ 文档引用格式统一

### 3. 提高效率

- ✅ AI 直接读取完整规范
- ✅ 减少层级跳转
- ✅ 提高响应速度

### 4. 跨平台兼容

- ✅ 文件夹命名跨平台兼容
- ✅ 脚本路径处理统一
- ✅ 工具加载无障碍

---

## 常见问题

### Q1: 为什么不使用 `L0-Execution` 或 `L0_Execution`？

**A**:
- `-` 和 `_` 在项目中已有其他用途（如 `api-design.md`、`admin_users` 表名）
- `#` 符号语义更明确，视觉上更清晰
- `#` 在所有平台和工具中都兼容

### Q2: 为什么文档引用要用中英文混合格式？

**A**:
- 中文名便于人类理解
- 英文名便于 AI 理解
- 两者结合，最大化可读性

### Q3: 历史文档需要更新吗？

**A**:
- 不需要。历史文档保持原样，反映当时的状态
- 只有新创建的文档使用新格式

### Q4: 七层架构的项目可以迁移到六层吗？

**A**:
- 可以。按照本文档的迁移步骤执行即可
- 建议先在测试分支验证，确认无误后再合并

---

## 参考资料

- **详细规范**：[10.ai-memory-03.six-layer-naming.md](../standards/10.ai-memory-03.six-layer-naming.md)
- **通用命名规范**：[10.ai-memory-02.naming.md](../standards/10.ai-memory-02.naming.md)
- **架构说明**：[10.ai-memory-01.architecture.md](../standards/10.ai-memory-01.architecture.md)
- **来源项目**：AiLinkDog（六层架构实践）

---

## 更新日志

| 日期 | 版本 | 变更内容 |
|------|------|---------|
| 2026-04-17 | v1.0.0 | 初始版本，总结六层架构实践经验 |

---

**最后更新**：2026-04-17
**维护者**：ZERO Framework Team
