# L0 Hooks — IDE 和 Git 钩子配置

**定位**：自动化工作流触发器，在特定事件发生时自动执行操作。

## 目录结构

```
.ai/L0#Execution/hooks/
├── README.md                           ← 本文件
├── standards-sync-on-complete.json     ← 规范同步检查（推荐）
├── husky/                              ← Git hooks（通过 Husky）
└── ide/                                ← 其他 IDE hooks
```

**架构说明**：
- Hook 配置文件（`.json`）直接存放在 `.ai/L0#Execution/hooks/` 目录下
- 各 IDE/平台通过符号链接映射到自己的目录，并转换格式
- 例如：`.ai/L0#Execution/hooks/standards-sync-on-complete.json` → `.kiro/hooks/standards-sync-on-complete.kiro.hook`

## 核心原则

1. **源文件在 L0** - `.ai/L0#Execution/hooks/` 是唯一可编辑位置
2. **映射到 IDE** - 通过 `gogogo.sh 8a` 映射到 `.kiro/hooks/`
3. **文件格式** - Kiro hooks 使用 `.json` 格式，映射后自动变成 `.kiro.hook`
4. **必须字段** - `enabled: true` 是必须的，否则 Kiro 不显示该 hook

## 推荐 Hooks

### 1. 规范同步检查（强烈推荐）⭐

**文件**：`standards-sync-on-complete.json`

**用途**：任务完成后自动检查是否涉及规范变更，若有则强制执行 L4→L3→L2→L1 全链路同步

**触发时机**：`agentStop`（AI 任务完成后）

**核心价值**：
- 🔍 自动检测规范变更
- 🔄 强制执行四步冲突检测
- ✅ 确保所有层级一致性
- 📝 逐步纯化历史文档

**工作流程**：
```
任务完成
    ↓
Hook 自动触发
    ↓
第一步：判断是否涉及规范变更
    ↓
第二步：冲突检测（L3→L2→L1）
    ↓
第三步：用户确认后执行同步
```

**冲突检测四步骤**：
1. **L3#完整规范 (Standards) 内部冲突检测** - 找出同层不同文件的矛盾
2. **L2#规范索引 (Index) 与 L3#完整规范 (Standards) 一致性检测** - 确保索引覆盖所有主题
3. **IDE 映射与 L2#规范索引 (Index) 一致性检测** - 确保自动载入内容没有过期
4. **L1 宪法级检测** - 判断是否需要写入零容忍规则

### 2. 提交前类型检查（可选）

**文件**：`pre-commit-typecheck.json`

**用途**：提交代码前检查 TypeScript 类型错误

**触发时机**：`userTriggered`（手动触发）

**示例配置**：
```json
{
  "version": "1.0.0",
  "enabled": true,
  "name": "提交前类型检查",
  "description": "提交代码前检查 TypeScript 类型错误",
  "when": {
    "type": "userTriggered"
  },
  "then": {
    "type": "runCommand",
    "command": "npm run type-check"
  }
}
```

## Hook 类型

| 类型 | 触发时机 | 用途 |
|------|---------|------|
| `agentStop` | AI 任务完成后 | 规范同步检查 |
| `userTriggered` | 用户手动触发 | 提交前检查 |
| `fileEdited` | 文件保存后 | 自动格式化、同步 |
| `preToolUse` | 工具使用前 | 权限检查、确认 |
| `postToolUse` | 工具使用后 | 结果验证 |

## 使用方法

### 1. 复制到项目

```bash
# 复制 ZERO 的 hook 示例到项目
cp -r ZERO/.ai/L0#Execution/hooks/ .ai/L0#Execution/hooks/
```

### 2. 根据需要调整

编辑 `.ai/L0#Execution/hooks/*.json` 文件，调整配置。

### 3. 映射到 Kiro

```bash
# 映射 L0 hooks 到 Kiro
./gogogo.sh 8a
```

### 4. 验证

```bash
# 检查符号链接是否创建成功
ls -la .kiro/hooks/
```

## 最佳实践

### 1. 规范同步 Hook 是必需的

对于使用六层架构的项目，**强烈建议启用规范同步 Hook**：
- ✅ 防止规范不一致
- ✅ 自动检测冲突
- ✅ 逐步纯化历史文档
- ✅ 确保 AI 读取正确规范

### 2. 根据项目需求选择其他 Hooks

- TypeScript 项目 → 启用类型检查 Hook
- 数据库驱动项目 → 启用同步验证 Hook
- 多人协作项目 → 启用代码规范检查 Hook

### 3. 定期审查 Hook 配置

- 检查 Hook 是否仍然适用
- 更新 Hook 的 prompt 内容
- 删除不再使用的 Hook

## 注意事项

1. **不要直接修改 `.kiro/hooks/`**
   - 所有修改都在 `.ai/L0#Execution/hooks/` 进行
   - 运行 `./gogogo.sh 8a` 自动同步

2. **`enabled: true` 是必须的**
   - 缺少此字段，Kiro 不会显示该 Hook

3. **Hook 文件名要清晰**
   - 使用描述性名称
   - 直接放在 `.ai/L0#Execution/hooks/` 目录下
   - 例如：`.ai/L0#Execution/hooks/standards-sync-on-complete.json`

4. **测试 Hook 配置**
   - 创建后先测试是否正常触发
   - 检查 prompt 内容是否正确

## 相关文档

- `ZERO/.ai/L3#Standards/standards/09.tool-04.hooks.md` - Kiro Hooks 完整规范
- `ZERO/.ai/L3#Standards/standards/10.ai-memory-01.architecture.md` - 六层架构说明

---

**最后更新**：2026-04-16
