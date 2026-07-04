# database-table-01.overview.md - 通用数据库表格组件概述

> **版本**: 1.0.0
> **创建时间**: 2025-12-31
> **基于**: YYSYYF 项目 DatabaseTablePro 组件

---

## 1. 组件定位

通用数据库表格组件（DatabaseTable）是 ZERO 框架的核心 CRUD 组件，用于：

- 自动读取数据库表结构，生成表格列配置
- 提供完整的增删改查功能
- 支持搜索、排序、分页、导出
- 支持列设置、列宽调整、列拖拽排序
- 支持扩展表关联（主表 + 扩展表联合显示）

---

## 2. 设计理念

```
数据库表结构 → 自动生成配置 → 零配置使用
     ↓              ↓              ↓
  字段注释      列配置/表单      即插即用
```

**核心原则**：
1. **约定优于配置** - 通过数据库字段注释自动生成 UI 配置
2. **渐进式增强** - 基础功能零配置，高级功能按需配置
3. **组件化拆分** - 主组件 + 子组件，职责清晰

---

## 3. 文件结构（扁平化点分命名）

```
components/Common/
├── XXX.admin.DatabaseTable.vue                    # 主组件入口
├── XXX.admin.DatabaseTable.logic.ts               # 核心逻辑
├── XXX.admin.DatabaseTable.types.ts               # 类型定义
├── XXX.admin.DatabaseTable.style.scss             # 样式
│
│ # Composables（可组合函数）
├── XXX.admin.DatabaseTable.composables.useStructure.ts    # 表结构管理
├── XXX.admin.DatabaseTable.composables.useData.ts         # 数据管理
├── XXX.admin.DatabaseTable.composables.useColumns.ts      # 列配置管理
├── XXX.admin.DatabaseTable.composables.useForm.ts         # 表单管理
├── XXX.admin.DatabaseTable.composables.useActions.ts      # 操作管理
├── XXX.admin.DatabaseTable.composables.useState.ts        # 状态管理
│
│ # 子组件
├── XXX.admin.DatabaseTable.components.Toolbar.vue         # 工具栏
├── XXX.admin.DatabaseTable.components.Content.vue         # 表格主体
├── XXX.admin.DatabaseTable.components.Pagination.vue      # 分页器
├── XXX.admin.DatabaseTable.components.FormDialog.vue      # 表单对话框（入口）
├── XXX.admin.DatabaseTable.components.FormDialog.view.vue # 表单对话框（视图）
├── XXX.admin.DatabaseTable.components.FormDialog.logic.ts # 表单对话框（逻辑）
├── XXX.admin.DatabaseTable.components.FormDialog.style.scss # 表单对话框（样式）
├── XXX.admin.DatabaseTable.components.FormDialog.types.ts # 表单对话框（类型）
├── XXX.admin.DatabaseTable.components.DbFieldTooltip.vue  # 字段问号提示组件
├── XXX.admin.DatabaseTable.components.DeleteDialog.vue    # 删除确认对话框
├── XXX.admin.DatabaseTable.components.ColumnSettings.vue  # 列设置对话框
├── XXX.admin.DatabaseTable.components.ColumnWidthSettings.vue  # 列宽设置
└── XXX.admin.DatabaseTable.components.HistoryDialog.vue   # 操作历史对话框
```

**命名公式**：`{SystemPrefix}.{module}.{ComponentName}.{layer}.{subName}.{fileType}`

- **SystemPrefix**: 项目系统前缀（如 YYS、APP 等，由使用 ZERO 的项目决定）
- **module**: 模块标识（admin/home/space）
- **ComponentName**: 组件名称（DatabaseTable）
- **layer**: 层级标识（composables/components）
- **subName**: 子模块名称
- **fileType**: 文件类型后缀（vue/ts/scss）

⚠️ **不创建子目录**，所有文件扁平放置在 `components/Common/` 下

---

## 4. 组件层级

```
DatabaseTable (主组件)
├── Toolbar (工具栏)
│   ├── 搜索框
│   ├── 新增按钮
│   ├── 列设置按钮
│   ├── 导出按钮
│   └── 刷新按钮
│
├── Content (表格主体)
│   ├── 表头（支持排序、拖拽）
│   ├── 数据行
│   └── 操作列（编辑/复制/删除）
│
├── Pagination (分页器)
│
└── Dialogs (弹窗)
    ├── FormDialog (新增/编辑)
    ├── DeleteDialog (删除确认)
    ├── ColumnSettings (列设置)
    └── HistoryDialog (操作历史)
```

---

## 5. 数据库字段注释规范

### 5.1 注释格式

组件通过解析数据库字段注释自动生成 UI 配置：

```
序号|分类|中文名|详细说明|是否显示
```

**示例**：
```sql
-- 标准格式
`name` VARCHAR(100) COMMENT '1|基础|名称|用户的显示名称|1'
`email` VARCHAR(255) COMMENT '2|基础|邮箱|用于登录和通知|1'
`password` VARCHAR(255) COMMENT '3|安全|密码|加密存储|0'
`created_at` TIMESTAMP COMMENT '99|系统|创建时间|记录创建时间|0'
```

### 5.2 字段解析规则

| 段位 | 含义 | 用途 |
|------|------|------|
| 第1段 | 序号 | 控制列显示顺序 |
| 第2段 | 分类 | 表单分组、列设置分组 |
| 第3段 | 中文名 | 表头显示、表单标签 |
| 第4段 | 详细说明 | Tooltip 提示 |
| 第5段 | 是否显示 | 1=默认显示，0=默认隐藏 |

### 5.3 表注释格式

```sql
-- 表注释格式：中文名称|功能说明
CREATE TABLE `users` (
  ...
) COMMENT='用户表|存储系统用户基础信息';
```

---

## 6. 技术栈版本

组件提供两个版本，根据项目技术栈选择：

| 版本 | 适用场景 | 文档 |
|------|----------|------|
| **Vue 版本** | Vue 3 + TypeScript 项目 | 本系列文档 02-08 |
| **Vanilla JS 版本** | 纯 HTML/CSS/JS 项目 | [database-table-09.vanilla-js.md](database-table-09.vanilla-js.md) |

---

## 7. 相关文档

### Vue 版本文档
- [database-table-02.props-api.md](database-table-02.props-api.md) - Props 与 API
- [database-table-03.column-header.md](database-table-03.column-header.md) - 列头规范
- [database-table-04.table-interaction.md](database-table-04.table-interaction.md) - 表格交互
- [database-table-05.form-dialog.md](database-table-05.form-dialog.md) - 表单对话框
- [database-table-06.cell-edit.md](database-table-06.cell-edit.md) - 单元格编辑
- [database-table-07.field-settings.md](database-table-07.field-settings.md) - 字段设置
- [database-table-08.history.md](database-table-08.history.md) - 操作历史

### Vanilla JS 版本文档
- [database-table-09.vanilla-js.md](database-table-09.vanilla-js.md) - Vanilla JS 实现

---

**最后更新**: 2025-12-31 | **维护者**: ZERO 框架团队
