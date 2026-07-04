# L0 — 项目进度管理

**定位**：动态层，管理当前项目的功能规格、工作流、钩子和模板。

---

## 核心架构原则（零容忍）

**平台无关源文件 + 符号链接映射**：

1. **源文件直接放在 L0 子目录**：
   - Hook 配置：`.ai/L0#Execution/hooks/*.json`（不套 `kiro/` 等平台子目录）
   - Skill 文档：`.ai/L0#Execution/skills/{name}/SKILL.md`
   - Spec 文档：`.ai/L0#Execution/specs/{status}/{feature}/`

2. **通过符号链接映射到各 IDE**：
   - 运行 `./gogogo.sh 8a` 映射到 Kiro
   - 运行 `./gogogo.sh 8f` 映射到所有工具
   - 映射时可能转换格式（如 `.json` → `.kiro.hook`）

3. **禁止直接修改映射目标**：
   - `.kiro/hooks/`、`.kiro/skills/` 等是只读映射目标
   - 所有修改都在 `.ai/L0#Execution/` 进行

---

## 目录结构

```
.ai/L0#Execution/
├── README.md          # 本文档
├── specs/             # 功能规格（→ .kiro/specs/）
│   ├── README.md      # Specs 目录说明
│   ├── active/        # 进行中
│   ├── backlog/       # 待开发
│   └── completed/     # 已完成
├── workflows/         # CI/CD 工作流
│   ├── README.md      # Workflows 目录说明
│   ├── github/
│   ├── gitlab/
│   └── local/
├── hooks/             # 自动化钩子（平台无关源文件 → .kiro/hooks/）
│   ├── README.md      # Hooks 目录说明
│   ├── *.json         # Hook 配置文件（映射时转为 .kiro.hook）
│   ├── husky/         # Git hooks
│   └── ide/           # 其他 IDE hooks
├── skills/            # AI 技能文档（平台无关源文件 → .kiro/skills/）
│   ├── README.md      # Skills 目录说明
│   └── {skill-name}/  # 每个 skill 一个目录
│       └── SKILL.md
└── templates/         # 模板文件
    ├── README.md      # Templates 目录说明
    ├── spec-template.md
    ├── workflow-template.yml
    └── hook-template.json
```

---

## 映射关系

| L0 源目录 | 映射目标 | 格式转换 |
|-----------|---------|---------|
| `L0/specs/` | `.kiro/specs/` | 无 |
| `L0/hooks/*.json` | `.kiro/hooks/*.kiro.hook` | `.json` → `.kiro.hook` |
| `L0/skills/{name}/` | `.kiro/skills/{name}/` | 无 |

---

## 常用命令

```bash
./gogogo.sh 8a   # 映射到 Kiro（含 hooks + skills）
./gogogo.sh 8f   # 映射到所有工具
./gogogo.sh 8g   # 移除所有映射
```

---

## 注意事项

1. **永远不要直接修改映射目标**（如 `.kiro/hooks/`、`.kiro/skills/`）
2. **所有修改都在 `.ai/L0#Execution/` 进行**，符号链接自动生效
3. **新增 hook 文件后运行 `./gogogo.sh 8a`** 重新映射
4. **Skills 同理**：直接在 `.ai/L0#Execution/skills/{name}/` 创建，不套平台子目录

---

## 子目录说明

- **specs/** - 功能规格文档，详见 `specs/README.md`
- **workflows/** - CI/CD 工作流配置，详见 `workflows/README.md`
- **hooks/** - 自动化钩子配置，详见 `hooks/README.md`
- **skills/** - AI 技能文档，详见 `skills/README.md`
- **templates/** - 模板文件，详见 `templates/README.md`

---

**最后更新**：2026-04-16
