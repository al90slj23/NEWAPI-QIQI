# database-table-02.props-api.md - Props 配置与后端 API

> **版本**: 1.0.0
> **创建时间**: 2025-12-31

---

## 1. Props 配置

### 1.1 基础配置

```typescript
interface DatabaseTableProps {
  /** 数据库表名（必填） */
  table: string;

  /** 表格标签名称（可选，默认从表注释获取） */
  tableLabel?: string;

  /** 是否显示搜索栏（默认 true） */
  showSearch?: boolean;

  /** 是否显示新增按钮（默认 true） */
  showAddButton?: boolean;

  /** 是否显示分页器（默认 true） */
  showPagination?: boolean;

  /** 是否显示操作列（默认 true） */
  showOperations?: boolean;

  /** 是否显示列设置按钮（默认 true） */
  showColumnSettings?: boolean;

  /** 是否显示列宽设置按钮（默认 true） */
  showColumnWidthSettings?: boolean;

  /** 是否显示导出按钮（默认 true） */
  showExport?: boolean;

  /** 是否显示历史按钮（默认 true） */
  showHistory?: boolean;

  /** 是否显示刷新按钮（默认 true） */
  showRefresh?: boolean;

  /** 隐藏的列名数组 */
  hiddenColumns?: string[];

  /** 额外的列配置 */
  extraColumns?: any[];

  /** 默认查询参数 */
  defaultParams?: Record<string, any>;

  /** 默认每页条数（默认 20） */
  defaultPageSize?: number;

  /** 自定义操作按钮 */
  customActions?: CustomAction[];
}
```

### 1.2 扩展表配置（可选）

```typescript
interface ExtensionTableConfig {
  /** 扩展表名 */
  name: string;

  /** 扩展表显示名称（可选，从数据库表注释自动获取） */
  label?: string;

  /** 外键字段名（关联主表的字段） */
  foreignKey: string;
}

// 使用示例
const extensionTables = [
  { name: 'user_profiles', foreignKey: 'user_id' },
  { name: 'user_settings', foreignKey: 'user_id' },
];
```

---

## 2. 使用示例

### 2.1 基础用法（零配置）

```vue
<template>
  <DatabaseTable table="users" />
</template>

<script setup lang="ts">
import DatabaseTable from '@/components/Common/DatabaseTable.vue';
</script>
```

### 2.2 自定义配置

```vue
<template>
  <DatabaseTable
    table="users"
    table-label="用户管理"
    :show-export="false"
    :hidden-columns="['password', 'remember_token']"
    :default-page-size="50"
    @row-click="handleRowClick"
    @refresh="handleRefresh"
  >
    <!-- 工具栏前置插槽 -->
    <template #toolbar-prepend>
      <t-button @click="handleBatchImport">批量导入</t-button>
    </template>

    <!-- 工具栏后置插槽 -->
    <template #toolbar-append>
      <t-button @click="handleExportAll">导出全部</t-button>
    </template>
  </DatabaseTable>
</template>
```

### 2.3 带扩展表

```vue
<template>
  <DatabaseTable
    table="users"
    :extension-tables="extensionTables"
  />
</template>

<script setup lang="ts">
const extensionTables = [
  { name: 'user_profiles', foreignKey: 'user_id', label: '用户档案' },
  { name: 'user_wallets', foreignKey: 'user_id', label: '用户钱包' },
];
</script>
```

---

## 3. 后端 API 规范

### 3.1 API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/admin/DatabaseTable:structure` | 获取表结构 |
| GET | `/api/v1/admin/DatabaseTable:list` | 获取数据列表 |
| POST | `/api/v1/admin/DatabaseTable:create` | 创建记录 |
| PUT | `/api/v1/admin/DatabaseTable:update` | 更新记录 |
| DELETE | `/api/v1/admin/DatabaseTable:delete` | 删除记录 |
| GET | `/api/v1/admin/DatabaseTable:export` | 导出数据 |

### 3.2 表结构 API

**请求**：
```
GET /api/v1/admin/DatabaseTable:structure?table=users
```

**响应**：
```json
{
  "success": true,
  "data": {
    "table": "users",
    "comment": "用户表|存储系统用户基础信息",
    "columns": [
      {
        "name": "id",
        "type": "bigint unsigned",
        "nullable": false,
        "primary": true,
        "autoIncrement": true,
        "comment": "",
        "extra": {
          "displayOrder": 0,
          "displayName": "ID",
          "helpText": "",
          "defaultVisible": true
        }
      },
      {
        "name": "name",
        "type": "varchar(100)",
        "nullable": false,
        "primary": false,
        "comment": "1|基础|名称|用户的显示名称|1",
        "extra": {
          "displayOrder": 1,
          "displayName": "名称",
          "helpText": "用户的显示名称",
          "defaultVisible": true
        }
      }
    ]
  }
}
```

### 3.3 数据列表 API

**请求**：
```
GET /api/v1/admin/DatabaseTable:list?table=users&page=1&pageSize=20&sort=id&order=desc
```

**响应**：
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "张三", "email": "zhangsan@example.com" }
  ],
  "pagination": {
    "current": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 3.4 创建/更新 API

**创建请求**：
```
POST /api/v1/admin/DatabaseTable:create
Content-Type: application/json

{
  "table": "users",
  "data": {
    "name": "李四",
    "email": "lisi@example.com"
  }
}
```

**更新请求**：
```
PUT /api/v1/admin/DatabaseTable:update
Content-Type: application/json

{
  "table": "users",
  "id": 1,
  "data": {
    "name": "李四（已修改）"
  }
}
```

---

## 4. 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| row-click | row | 行点击 |
| cell-click | { row, col, rowIndex } | 单元格点击 |
| cell-dblclick | { row, col, rowIndex } | 单元格双击 |
| edit | row | 编辑按钮点击 |
| delete | row | 删除按钮点击 |
| refresh | - | 数据刷新完成 |
| selection-change | selectedRows | 选择变化 |
| cell-edit-confirm | { row, col, oldValue, newValue } | 单元格编辑确认 |

---

## 5. 插槽

| 插槽名 | 说明 |
|--------|------|
| toolbar-prepend | 工具栏前置内容 |
| toolbar-append | 工具栏后置内容 |

---

**最后更新**: 2025-12-31 | **维护者**: ZERO 框架团队
