# NEWAPI-QIQI - ZERO AI Memory

> **定位**：基于官方 new-api 的 NEWAPI-QIQI 项目记忆体系  
> **基线**：官方 new-api，全新修改从本项目规则开始  
> **架构**：ZERO v2.0.0 六层架构  
> **更新日期**：2026-07-04

---

## 项目零容忍规则

1. **Docker 镜像必须默认在 GitHub 构建，禁止默认在业务服务器上构建。**
2. 生产服务器只负责拉取镜像、重启容器、健康检查和回滚。
3. 所有修改必须保持官方 new-api 基线清晰，不混入历史遗留修改。
4. 线上不可达时先恢复服务，再继续发布。

项目级详细规范见：

- [00.project-01.development-rules.md](../L3#Standards/standards/00.project-01.development-rules.md)

---

## ZERO 核心理念

### 路径为王（Path is King）

**文件夹路径是唯一主体**，数据库表、API路由、后端类、权限点全部从路径自动推导：

```
文件夹路径（唯一主体）
pages/admin/users/config/levels/
        ↓ 自动映射
数据库表：admin_users_config_levels
API路径：/api/admin/users/config/levels
后端类名：AdminUsersConfigLevels
权限标识：admin.users.config.levels
```

### 设计哲学

1. **Evidence > assumptions** - 证据胜过假设
2. **Code > documentation** - 代码胜过文档
3. **Simple binary > complex hierarchy** - 简单二元规则胜过复杂多级优先级

### 命名哲学（AI 开发友好）

1. **完整描述 > 缩写简写** - `authentication.api.php` 而非 `auth.cmd.php`
2. **AI 友好 > 人类打字方便** - 命名可以长，但必须精准
3. **行业通用 > 项目特定** - 使用行业公认术语，避免自创缩写
4. **精准语义 > 模糊简称** - `processUserRegistration()` 而非 `process()`
5. **长度不是成本** - 40-60 字符的完整命名是默认，绝不为简短而损失语义
6. **结构靠命名而非目录** - 同领域文件默认平铺，通过 `FeatureName.layer.ext` 区分，不用子目录替代命名

详见：
- [04.quality-00.naming-philosophy.md](../L3#Standards/standards/04.quality-00.naming-philosophy.md)
- [04.quality-02.ai-friendly-naming.md](../L3#Standards/standards/04.quality-02.ai-friendly-naming.md)

---

## 📁 文档结构（六层架构）

```
.ai/
├── L0#Execution/                       # 工作执行
│   ├── hooks/                          # IDE 和 Git 钩子
│   ├── skills/                         # AI 技能文档
│   ├── specs/                          # 功能规格
│   ├── templates/                      # 模板文件
│   └── workflows/                      # 工作流配置
│
├── L1#Overview/                        # 项目概览
│   ├── guide.md                        # 本文件（项目指南）
│   └── README.md                       # L1 说明
│
├── L2#Index/                           # 规范索引
│   ├── toc.md                          # 目录索引
│   └── README.md                       # L2 说明
│
├── L3#Standards/                       # 完整规范
│   ├── standards/                      # 主规范文档
│   │   ├── 00.meta-01.core.md         # 元规范
│   │   ├── 01.arch-01.core.md         # 核心架构原则
│   │   ├── 01.arch-02.structure.md    # 路径映射规范
│   │   ├── 02.backend-01.api.md       # API设计规范
│   │   ├── 02.backend-02.db-tables.md # 数据库表命名规范
│   │   ├── 02.backend-03.db-fields.md # 数据库字段规范
│   │   ├── 02.backend-04.db-manifest.md # 页面清单表规范
│   │   ├── 03.frontend-01.structure.md # 文件命名规范
│   │   ├── 04.quality-00.naming-philosophy.md # 命名哲学（AI友好）
│   │   ├── 04.quality-01.naming.md    # 命名规范
│   │   ├── 05.biz-01.menu.md          # 侧边栏菜单规范
│   │   ├── 06.quality-01.size.md      # 文件大小与拆分规范
│   │   ├── 06.quality-02.git.md       # Git提交规范
│   │   ├── 06.quality-03.error.md     # 错误处理规范
│   │   ├── 06.quality-04.header.md    # 文件头注释规范
│   │   ├── 09.tool-01.gogogo-sh.md    # gogogo.sh 脚本规范
│   │   ├── 09.tool-02.deployignore.md # 部署排除规则规范
│   │   ├── 09.tool-03.ai-gogogo.md    # AI 管理入口规范
│   │   ├── 10.ai-memory-01.architecture.md # AI 记忆体系架构（六层）
│   │   ├── 10.ai-memory-02.naming.md  # AI 记忆体系命名与格式
│   │   └── 10.ai-memory-03.six-layer-naming.md # 六层架构官方命名对照表
│   │
│   ├── practices/                      # 最佳实践
│   ├── cases/                          # 案例研究
│   ├── designs/                        # 设计文档
│   ├── guides/                         # 操作指南
│   ├── adr/                            # 架构决策记录
│   ├── philosophy/                     # 设计哲学
│   ├── references/                     # 参考实现
│   │   ├── README.md                  # 参考文档索引
│   │   ├── admin-layout.md            # 管理后台 ABCD 布局
│   │   ├── vanilla-spa.md             # 原生 SPA 实现参考
│   │   ├── database-table-*.md        # 通用表格组件（8个文件）
│   │   ├── manifest-admin.md          # Manifest 管理页面
│   │   └── six-layer-architecture-summary.md # 六层架构实践总结
│   │
│   └── inspirations/                   # 灵感来源库
│       ├── README.md                  # 灵感来源库说明
│       └── ECC/                       # Everything Claude Code 参考
│
├── L4#Changelog/                       # 操作日志
│   ├── 2026-04-*.md                   # 操作日志
│   └── README.md                       # 工作日志说明
│
└── L5#Knowledge/                       # 知识图谱（可选）
    └── README.md                       # 知识图谱说明

Zero/
├── README.md                           # 导航版
├── ZERO-ITERATION.md                   # ZERO 框架迭代流程
├── gogogo.sh                           # 统一入口脚本
├── gogogo.lib.sh                       # 通用库
├── gogogo.0.sh                         # 选项 0: 本地开发
├── gogogo.1.sh                         # 选项 1: 部署（默认）
├── gogogo.2.sh                         # 选项 2: 检查状态
├── gogogo.3.sh                         # 选项 3: 清缓存
└── gogogo.ai.sh                        # 选项 ai: AI 记忆体系管理
```

---

## 🔄 路径映射规则

| 源 | 目标 | 转换方法 | 举例 |
|---|------|---------|------|
| 文件夹路径 | 数据库表 | 下划线连接 | `admin_users_config_levels` |
| 文件夹路径 | API路径 | 加 `/api/` 前缀 | `/api/admin/users/config/levels` |
| 文件夹路径 | 类名 | 大驼峰连接 | `AdminUsersConfigLevels` |
| 文件夹路径 | 权限标识 | 点号连接 | `admin.users.config.levels` |

---

## 🗄️ 数据库规范

### 页面清单表（核心表）⭐

**表名**：`{系统前缀}_manifest_list`

**架构地位**：
- **ZERO 框架的核心表**：所有应用 ZERO 的项目都应该有这张表
- **单一数据源（Single Source of Truth）**：路由、菜单、权限的唯一配置来源
- **不仅限于 admin**：适用于所有需要路径管理的场景
- **坚固的路径基地**：为整个应用提供一致的路径映射和配置管理

这是"路径为王"架构的核心表，存储所有页面/功能模块的配置信息：

| 核心字段 | 说明 |
|---------|------|
| `path` | 文件夹路径（唯一主体） |
| `parent_path` | 父级路径（构建树形菜单） |
| `name` | 完整名称 |
| `short_name` | 菜单显示名称 |
| `icon` | 图标 |
| `component` | Vue 组件路径 |
| `sort_order` | 排序 |
| `is_visible` | 菜单可见性 |
| `is_menu` | 是否作为菜单项 |
| `view_settings` | JSON 格式的页面配置 |

**三大核心功能**：
1. **菜单系统数据源** - 左侧导航菜单的完整树形结构
2. **路由配置中心** - 前端动态路由的生成依据
3. **页面元数据管理** - 页面标题、描述、权限等配置

**同步机制（零容忍）**：
```bash
php artisan view:sync       # 文件变化后立即同步
php artisan view:validate   # 提交前验证一致性
php artisan view:fix        # 自动修复不一致
```

**Fallback 策略**：无配置时使用简单二元规则快速暴露问题
- `short_name` → `name`（不要多级降级）
- `icon` → `help-circle`（问号图标）
- `sort_order` → `999`（排最后）

**实践案例**：YYSYYF 项目 `yys_manifest_list` 表
- 150+ 条记录覆盖 8 个业务模块
- 树形菜单通过 `parent_path` 构建
- Redis 缓存 + 1 小时 TTL
- 自动同步命令保持文件系统与数据库一致

详见：[02.backend-04.db-manifest.md](../L3#Standards/standards/02.backend-04.db-manifest.md)

### 侧边栏菜单

**文件系统优先**：目录存在即显示，数据库配置是增强不是必需。

```
文件系统扫描 → manifest_list 匹配 → 警告标记 → 缓存 → 渲染
```

| 状态 | 显示效果 |
|------|---------|
| 无数据库记录 | 显示目录名 + 红色警告 |
| 字段不完整 | 显示已有值 + 黄色警告（提示缺少哪些字段） |
| 配置完整 | 正常显示 |

**无硬编码默认值**：没有就是 null，前端根据 null 显示警告状态。

详见：[05.biz-01.menu.md](../L3#Standards/standards/05.biz-01.menu.md)

### 表命名

```
{路径下划线连接}_{通用语义后缀}
```

| 后缀 | 含义 | 举例 |
|------|------|------|
| `list` | 主表 | `admin_users_list` |
| `config` | 配置表 | `admin_users_config_roles` |
| `log` | 日志表 | `admin_users_log_login` |

**规则**：通用语义后缀用**单数**，业务词汇用**复数**

### 表注释格式

```sql
'中文名称|功能说明'
-- 举例：'用户主表|存储用户基础信息'
```

### 字段注释格式

```sql
'序号|中文字段分类|中文字段名|详细说明[|是否显示]'
-- 举例：'1|核心|用户名|用于登录的唯一标识|1'
```

### 字段命名（三段式）

```
{表级前缀}_{语义分类}_{字段名}
```

举例：`base_profile_nickname`、`base_status_active`

---

## 📡 API规范（冒号语法）

**斜杠 `/` 仅用于真实目录，虚拟参数用冒号 `:`**

```bash
GET    /api/admin/users/list              # 列表
POST   /api/admin/users/list              # 创建
PUT    /api/admin/users/list:123          # 更新ID=123 ✅
DELETE /api/admin/users/list:456          # 删除ID=456 ✅
GET    /api/admin/users/list:export       # 导出 ✅

# ❌ 禁用（与文件路径混淆）
PUT    /api/admin/users/list/123
```

---

## 📋 命名规范速查

| 场景 | 风格 | 举例 |
|------|------|------|
| **目录路径** | **全小写（强制）** | `pages/admin/users/` |
| 文件名 | 点分命名 | `UsersList.view.html` |
| 变量/函数 | camelCase | `userName` |
| 类名 | PascalCase | `UserManager` |
| 常量 | UPPER_SNAKE | `MAX_COUNT` |
| CSS类 | kebab-case | `user-profile` |
| 数据库表 | 下划线 | `admin_users_config_levels` |
| 数据库字段 | 三段式 | `base_profile_nickname` |
| API路由 | 冒号语法 | `/list:export` |

### 文件点分命名

```
FeatureName.FileType.ext
```

| 类型 | 举例 |
|------|------|
| 视图 | `UsersList.view.html` |
| 逻辑 | `UsersList.logic.js` |
| 样式 | `UsersList.style.css` |
| API | `UsersList.api.php` |

**FeatureName 规则**：路径最后两级大驼峰组合
- `/admin/users/list/` → `UsersList`

---

## 📏 文件大小规范

| 级别 | 行数 |
|------|------|
| 推荐 | 300-500 |
| 上限 | 700 |
| 强制重构 | >800 |

**函数/方法**：推荐 10-40 行，上限 80 行

详见：[06.quality-01.size.md](../L3#Standards/standards/06.quality-01.size.md)

---

## 📝 Git 提交规范

### Commit 格式

```
<type>(<scope>): <subject>
```

### 提交类型

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 Bug |
| `docs` | 文档变更 |
| `refactor` | 重构 |
| `perf` | 性能优化 |

### 分支命名

| 类型 | 格式 |
|------|------|
| 功能 | `feature/<功能名>` |
| 修复 | `fix/<问题描述>` |
| 发布 | `release/<版本号>` |

详见：[06.quality-02.git.md](../L3#Standards/standards/06.quality-02.git.md)

---

## ⚠️ 错误处理规范

### HTTP 状态码

| 状态码 | 含义 | 处理 |
|--------|------|------|
| 400 | 参数错误 | 显示错误信息 |
| 401 | 未认证 | 跳转登录 |
| 403 | 无权限 | 显示提示 |
| 422 | 验证失败 | 显示字段错误 |
| 500 | 服务器错误 | 显示通用错误 |

### 用户提示原则

- 用户能理解，避免技术术语
- 提供解决方案
- 不暴露敏感信息

详见：[06.quality-03.error.md](../L3#Standards/standards/06.quality-03.error.md)

---

## 📄 文件头注释规范

**文件自包含文档化**：在文件开头用注释完整记录逻辑、思路、结构。

### 必需字段

| 字段 | 说明 |
|------|------|
| 【文件职责】 | 核心职责 |
| 【核心架构】 | 架构要点 |
| 【主要函数】 | 函数列表 |
| 【依赖关系】 | 依赖说明 |

### 同步规则

- 修改代码 → 更新注释
- 新增函数 → 更新【主要函数】

详见：[06.quality-04.header.md](../L3#Standards/standards/06.quality-04.header.md)

---

## 🚀 gogogo.sh 统一入口脚本

**统一入口**：一个命令搞定所有常用操作。

### 使用方式

```bash
./gogogo.sh        # 交互式菜单
./gogogo.sh 1      # 直接执行选项 1
```

### 选项编号

| 编号 | 用途 |
|------|------|
| 0 | 本地开发 |
| 1 | 部署（默认，GitHub + 服务器） |
| 2 | 检查状态 |
| 3 | 清缓存 |
| 4+ | 按需扩展 |

### 文件结构

```
gogogo.sh          # 主入口
gogogo.lib.sh      # 通用库
gogogo.0.sh        # 选项 0: 本地开发
gogogo.1.sh        # 选项 1: 部署（默认）
gogogo.2.sh        # 选项 2: 检查状态
...
```

详见：[09.tool-01.gogogo-sh.md](../L3#Standards/standards/09.tool-01.gogogo-sh.md)

---

## 🚨 零容忍规则

1. **目录路径必须全小写**
2. **API虚拟参数禁用斜杠**，必须用冒号
3. **文件超800行必须拆分**
4. **数据库通用语义后缀用单数**
5. **修改代码必须同步更新文件头注释**
6. **Commit 必须符合格式规范**
7. **命名长度不是成本**：完整描述 > 缩写，AI 友好 > 人类打字方便，详见 [04.quality-02.ai-friendly-naming.md](../L3#Standards/standards/04.quality-02.ai-friendly-naming.md)
8. **结构靠命名而非目录**：同领域文件默认平铺，用 `FeatureName.layer.ext` 区分，不用子目录替代命名
9. **L0#工作执行 (Execution) 架构原则**（平台无关源文件 + 符号链接映射）
   - **源文件直接放在 L0#工作执行 (Execution) 子目录**：`.ai/L0#Execution/hooks/*.json`、`.ai/L0#Execution/skills/{name}/`（不套 `kiro/` 等平台子目录）
   - **通过符号链接映射到各 IDE**：运行 `./gogogo.sh 8a` 或 `./gogogo.sh 8f`
   - **禁止直接修改映射目标**：`.kiro/hooks/`、`.kiro/skills/` 等是只读映射目标
   - 详见：[.ai/L0#Execution/README.md](../L0#Execution/README.md)
10. **规范变更必须执行冲突检测**（开发方法论级）
    - 有 hook 能力的 IDE（Kiro、Claude Code）→ 自动触发
    - 无 hook 能力的环境（Cursor、CLI）→ 手动执行
    - 四步检测：L3#完整规范 (Standards) 内部冲突 → L2#规范索引 (Index)-L3#完整规范 (Standards) 一致性 → L2#规范索引 (Index) 索引 → L1#项目概览 (Overview) 宪法级
    - 逐步纯化历史文档，确保规范长期一致性
    - 详见：[09.tool-04.hooks.md](../L3#Standards/standards/09.tool-04.hooks.md)
11. **六层架构文件夹必须使用 `L#英文名/` 格式**（如 `.ai/L0#Execution/`）
12. **六层架构文档引用必须使用中英文混合格式**（如 `L0#工作执行 (Execution)`）

---

## 🎯 简单二元规则

```javascript
// ❌ 多级降级掩盖问题
const name = config?.shortName || config?.name || config?.title || folderName

// ✅ 简单二元，快速暴露问题
const name = config?.shortName || folderName
```

---

**最后更新**：2026-04-26
