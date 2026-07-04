# L0/specs - 功能规格文档

**定位**：管理项目功能规格（Specs），按状态分类存储。

---

## 目录结构

```
.ai/L0#Execution/specs/
├── README.md          # 本文档
├── active/            # 进行中的功能
│   └── {feature}/     # 功能目录
│       ├── 00.spec-01.requirements.md
│       ├── 00.spec-02.design.md
│       ├── 00.spec-03.tasks.md
│       └── 00.spec-04.decisions.md
├── backlog/           # 待开发的功能
│   └── {feature}/
└── completed/         # 已完成的功能
    └── {feature}/
```

---

## Spec 文件命名规范

每个功能目录包含 4 个标准文件：

| 文件名 | 用途 | Kiro 映射名 |
|--------|------|------------|
| `00.spec-01.requirements.md` | 需求文档 | `requirements.md` |
| `00.spec-02.design.md` | 设计文档 | `design.md` |
| `00.spec-03.tasks.md` | 任务列表 | `tasks.md` |
| `00.spec-04.decisions.md` | 决策记录 | `decisions.md` |

**注意**：
- 源文件保持统一编号命名（`00.spec-{序号}.{名称}.md`）
- Kiro 要求固定文件名，通过 symlink 解决
- 统一规范 > 工具特殊需求

---

## 状态管理

### active/ - 进行中
- 当前正在开发的功能
- 任务状态：`in_progress`
- 映射到 `.kiro/specs/`

### backlog/ - 待开发
- 已规划但未开始的功能
- 任务状态：`pending`
- 不映射到 IDE（避免干扰）

### completed/ - 已完成
- 已完成的功能
- 任务状态：`completed`
- 归档保存，不映射到 IDE

---

## 创建新 Spec

```bash
# 1. 创建功能目录
mkdir -p .ai/L0#Execution/specs/backlog/my-feature

# 2. 复制模板（如果有）
cp .ai/L0#Execution/templates/spec-template.md .ai/L0#Execution/specs/backlog/my-feature/00.spec-01.requirements.md

# 3. 编写需求
vim .ai/L0#Execution/specs/backlog/my-feature/00.spec-01.requirements.md

# 4. 移动到 active（开始开发时）
mv .ai/L0#Execution/specs/backlog/my-feature .ai/L0#Execution/specs/active/

# 5. 映射到 Kiro
./gogogo.sh 8a
```

---

## Spec 生命周期

```
backlog/          → 规划阶段
    ↓ 开始开发
active/           → 开发阶段（映射到 .kiro/specs/）
    ↓ 完成开发
completed/        → 归档阶段
```

---

## 注意事项

1. **功能目录命名**：使用小写字母和连字符（如 `user-auth`）
2. **保持 4 个标准文件**：即使某些文件暂时为空
3. **及时更新状态**：完成后移动到 `completed/`
4. **不要直接修改 `.kiro/specs/`**：所有修改在 `.ai/L0#Execution/specs/` 进行

---

**最后更新**：2026-04-16
