# database-table-09.vanilla-js - Vanilla JS 表格组件

> **版本**: 1.0.0
> **创建时间**: 2025-12-31
> **基于**: M.SRL 项目 DbTable 组件

---

## 1. 组件定位

当项目技术栈为 **Pure HTML + CSS + Vanilla JS**（无 Vue/React）时，使用此 Vanilla JS 版本的数据库表格组件。

**适用场景**：
- 项目不使用前端框架
- 不使用构建工具（webpack/vite）
- 需要轻量级的 CRUD 表格功能

**与 Vue 版本的区别**：

| 特性 | Vue 版本 | Vanilla JS 版本 |
|------|----------|-----------------|
| 响应式 | Vue 响应式系统 | 手动 DOM 操作 |
| 组件化 | .vue 单文件组件 | 单个 JS 文件 |
| 状态管理 | Pinia/Vuex | 实例属性 |
| 构建工具 | 需要 | 不需要 |
| 文件大小 | 较大（含框架） | 较小（~15KB） |

---

## 2. 文件结构

```
admin/
├── dbtable.css          # 表格样式
├── dbtable.js           # 表格组件
│
└── Users/
    ├── content.html     # 页面内容
    ├── users.css        # 页面样式
    └── users.js         # 页面逻辑（使用 DbTable）
```

**命名规范**：
- 组件文件：`dbtable.css`、`dbtable.js`（扁平放置，不创建子目录）
- 页面文件：`{模块名}.css`、`{模块名}.js`

---

## 3. 基础用法

### 3.1 HTML 结构

```html
<!-- content.html -->
<div class="panel active">
    <div class="panel-header">
        <h2>用户管理</h2>
    </div>
    <div class="panel-body">
        <!-- 表格容器 -->
        <div id="userTable"></div>
    </div>
</div>

<!-- 引入组件 -->
<link rel="stylesheet" href="/admin/dbtable.css?v=1">
<script src="/admin/dbtable.js?v=1"></script>
<script src="/admin/Users/users.js?v=1"></script>
```

### 3.2 JavaScript 初始化

```javascript
// users.js
function getToken() {
    return localStorage.getItem('admin_token') || '';
}

function initUsers() {
    var table = new DbTable({
        container: '#userTable',
        table: 'users',
        apiUrl: '/api/users.cmd.php',
        token: getToken(),
        columns: [
            { field: 'id', label: 'ID', type: 'id', sortable: true },
            { field: 'name', label: '姓名', sortable: true },
            { field: 'email', label: '邮箱', type: 'path' },
            { field: 'status', label: '状态', type: 'status', sortable: true },
            { field: 'created_at', label: '创建时间', type: 'datetime', sortable: true }
        ],
        pageSize: 20,
        defaultSort: { field: 'id', order: 'desc' }
    });
}

// 页面加载后初始化
if (typeof initUsers === 'function') {
    initUsers();
}
```

---

## 4. 配置项

### 4.1 基础配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `container` | string | - | 容器选择器（必填） |
| `table` | string | - | 数据库表名 |
| `apiUrl` | string | - | API 地址（必填） |
| `token` | string | '' | 认证 token |
| `columns` | array | [] | 列配置 |
| `pageSize` | number | 20 | 每页条数 |
| `pageSizes` | array | [10,20,50,100] | 可选每页条数 |
| `primaryKey` | string | 'id' | 主键字段名 |
| `defaultSort` | object | {field:'id',order:'desc'} | 默认排序 |

### 4.2 功能开关

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `showSearch` | boolean | true | 显示搜索框 |
| `showAdd` | boolean | true | 显示新增按钮 |
| `showRefresh` | boolean | true | 显示刷新按钮 |
| `showPagination` | boolean | true | 显示分页器 |

### 4.3 文本配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `searchPlaceholder` | string | '搜索...' | 搜索框占位符 |
| `emptyText` | string | '暂无数据' | 空数据提示 |

---

## 5. 列配置

### 5.1 基础属性

```javascript
{
    field: 'name',           // 字段名（必填）
    label: '姓名',           // 列标题（从数据库注释第3段获取）
    type: 'text',            // 显示类型
    sortable: true,          // 是否可排序
    hidden: false,           // 是否隐藏（通用表格组件始终为 false）
    editable: true,          // 是否可编辑
    required: false,         // 是否必填
    default: '',             // 默认值
    hint: '输入提示',        // 表单输入提示（从数据库注释第4段获取）
    // Tooltip 四段信息（自动从数据库获取）
    tableName: 'users',      // 所属表名
    tableComment: '用户表',  // 所属表的注释
    fieldComment: '1|核心|姓名|用户的真实姓名|1'  // 字段的完整注释
}
```

**Tooltip 显示内容**：
鼠标悬停表头问号图标时，显示四段信息：
1. **表名**: 所属数据库表名
2. **表注释**: 表的中文说明
3. **字段名**: 数据库字段名
4. **字段注释**: 字段的完整注释（格式：序号|分类|名称|说明|显示）

**⚠️ 重要说明**：
- 数据库字段注释格式为 `序号|分类|名称|说明|显示`
- 注释中的第5段"显示"（0或1）用于**其他场景**（如前端表单显示控制），**不是**通用表格组件的列隐藏控制
- **通用表格组件显示所有列**，`hidden` 属性始终为 `false`
- 如需在特定页面隐藏某列，应在前端代码中手动配置 `columns`

### 5.2 显示类型 (type)

| 类型 | 说明 | 渲染效果 |
|------|------|----------|
| `id` | ID 字段 | 灰色小字 |
| `text` | 普通文本 | 原样显示 |
| `status` | 状态字段 | 彩色圆点 + 文字 |
| `icon` | 图标字段 | 图标 + 名称 |
| `color` | 颜色字段 | 色块 + 色值 |
| `path` | 路径字段 | 等宽字体 |
| `datetime` | 时间字段 | 格式化时间 |

### 5.3 状态类型配置

```javascript
{
    field: 'status',
    label: '状态',
    type: 'status',
    statusMap: { 1: 'active', 0: 'inactive', 2: 'dev' },
    statusLabels: { 1: '活跃', 0: '停用', 2: '开发中' }
}
```

### 5.4 下拉选择配置

```javascript
{
    field: 'role',
    label: '角色',
    formType: 'select',
    options: [
        { value: 'admin', label: '管理员' },
        { value: 'user', label: '普通用户' }
    ]
}
```

### 5.5 自定义渲染

```javascript
{
    field: 'avatar',
    label: '头像',
    render: function(value, row, col) {
        if (!value) return '-';
        return '<img src="' + value + '" class="avatar-thumb">';
    }
}
```

---

## 6. 操作列

### 6.1 按钮结构

操作列位于表格最后一列，包含三个按钮：

| 按钮 | 图标 | 样式 | 提示文字 |
|------|------|------|----------|
| 编辑 | `edit-2` | primary (红色) | "编辑" |
| 复制 | `copy` | default (蓝色) | "复制" |
| 删除 | `trash-2` | danger (红色) | "删除" |

### 6.2 复制功能

复制功能用于快速创建相似记录：

```javascript
// handleCopy 方法实现
DbTable.prototype.handleCopy = function(row) {
    // 1. 复制选中行的所有数据
    var copyData = Object.assign({}, row);

    // 2. 删除不应复制的字段
    delete copyData.id;           // 删除主键 ID
    delete copyData.created_at;   // 删除创建时间
    delete copyData.updated_at;   // 删除更新时间
    delete copyData.deleted_at;   // 删除软删除时间

    // 3. 以"新建"模式打开表单，预填充复制的数据
    this.openEditDialog(null, copyData);
};
```

**复制操作流程**：
1. 用户点击复制按钮
2. `handleCopy(row)` 被调用
3. 复制行数据，移除 id/created_at/updated_at/deleted_at
4. `openEditDialog(null, copyData)` 以新建模式打开表单
5. 表单预填充复制的数据（除了被删除的字段）
6. 用户编辑后点击保存
7. 调用 `create` action 创建新记录

---

## 7. 冻结列

表格支持冻结列功能，确保关键列在水平滚动时始终可见。

### 7.1 冻结策略

| 冻结位置 | 列 | z-index | 说明 |
|----------|-----|---------|------|
| 表头行 | 所有列 | 20 | 垂直滚动时固定在顶部 |
| 左上角 | 表头 ID 列 | 30 | 最高层级，始终可见 |
| 右上角 | 表头操作列 | 30 | 最高层级，始终可见 |
| 左侧 | ID 列（第一列） | 10 | 水平滚动时固定在左侧 |
| 右侧 | 操作列（最后一列） | 10 | 水平滚动时固定在右侧 |

### 7.2 CSS 实现

```css
/* 表格容器支持双向滚动 */
.dbtable-wrapper {
    overflow: auto;
    max-height: 70vh;
    position: relative;
}

/* 表头行冻结 */
.dbtable thead th {
    position: sticky;
    top: 0;
    z-index: 20;
}

/* ID 列（第一列）冻结 */
.dbtable th:first-child,
.dbtable td:first-child {
    position: sticky;
    left: 0;
    z-index: 10;
    border-right: 1px solid var(--border-color, #333);
}

/* 表头 ID 列（左上角）z-index 最高 */
.dbtable thead th:first-child {
    z-index: 30;
}

/* 操作列（最后一列）冻结 */
.dbtable th:last-child,
.dbtable td:last-child {
    position: sticky;
    right: 0;
    z-index: 10;
    border-left: 1px solid var(--border-color, #333);
}

/* 表头操作列（右上角）z-index 最高 */
.dbtable thead th:last-child {
    z-index: 30;
}
```

### 7.3 背景色处理

冻结列需要设置实色背景，避免滚动时内容透视：

```css
/* 数据行冻结列背景 */
.dbtable tbody tr td:first-child,
.dbtable tbody tr td:last-child {
    background: var(--card-bg, #1a1a2e);
}

/* hover 时使用实色背景 */
.dbtable tbody tr:hover td:first-child,
.dbtable tbody tr:hover td:last-child {
    background: var(--hover-bg-solid, #252538);
}

/* 选中行冻结列背景 */
.dbtable tbody tr.selected td:first-child,
.dbtable tbody tr.selected td:last-child {
    background: var(--selected-bg-solid, #2a1a1e);
}
```

### 7.4 排序图标样式

```css
/* 排序图标优化 */
.dbtable th .sort-icon {
    margin-left: 4px;
    opacity: 0.4;
    width: 12px;
    height: 12px;
    vertical-align: middle;
}

.dbtable th.sorted .sort-icon {
    opacity: 1;
    color: var(--primary-color, #E50914);
}
```

---

## 8. API 规范

### 7.1 请求格式

所有请求使用 POST + JSON：

```javascript
{
    "action": "list",
    "token": "xxx",
    "page": 1,
    "pageSize": 20,
    "sort": "id",
    "order": "desc",
    "search": "关键词"
}
```

### 7.2 响应格式

```javascript
// 列表响应
{
    "code": 200,
    "data": {
        "list": [...],
        "total": 100,
        "page": 1,
        "pageSize": 20
    }
}

// 操作响应
{
    "code": 200,
    "msg": "操作成功"
}

// 错误响应
{
    "code": 401,
    "msg": "未授权"
}
```

### 7.3 Action 列表

| Action | 说明 | 参数 |
|--------|------|------|
| `list` | 获取列表 | page, pageSize, sort, order, search |
| `create` | 创建记录 | data: {...} |
| `update` | 更新记录 | data: {id, ...} |
| `delete` | 删除记录 | id |

---

## 9. PHP API 模板

```php
<?php
/**
 * 用户管理 API
 */

require_once __DIR__ . '/../../db.inc.php';

header('Content-Type: application/json; charset=utf-8');

// 🔑 自定义认证函数（不要 require 其他 API 入口文件）
function checkCmdSession($token) {
    if (empty($token)) return false;
    $storedToken = getSetting('admin_session_token');
    return !empty($storedToken) && $token === $storedToken;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';
$token = $input['token'] ?? '';

// 验证认证
if (!checkCmdSession($token)) {
    echo json_encode(['code' => 401, 'msg' => '未授权']);
    exit;
}

switch ($action) {
    case 'list':
        handleList($input);
        break;
    case 'create':
        handleCreate($input);
        break;
    case 'update':
        handleUpdate($input);
        break;
    case 'delete':
        handleDelete($input);
        break;
    default:
        echo json_encode(['code' => 400, 'msg' => '未知操作']);
}

function handleList($input) {
    $db = getDB();
    $page = max(1, intval($input['page'] ?? 1));
    $pageSize = max(1, min(100, intval($input['pageSize'] ?? 20)));
    $sort = $input['sort'] ?? 'id';
    $order = strtoupper($input['order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
    $search = $input['search'] ?? '';

    // 白名单验证排序字段
    $allowedSorts = ['id', 'name', 'email', 'status', 'created_at'];
    if (!in_array($sort, $allowedSorts)) {
        $sort = 'id';
    }

    $where = '1=1';
    $params = [];

    if ($search) {
        $where .= ' AND (name LIKE ? OR email LIKE ?)';
        $params = ["%$search%", "%$search%"];
    }

    // 获取总数
    $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE $where");
    $stmt->execute($params);
    $total = $stmt->fetchColumn();

    // 获取数据
    $offset = ($page - 1) * $pageSize;
    $stmt = $db->prepare("SELECT * FROM users WHERE $where ORDER BY $sort $order LIMIT $offset, $pageSize");
    $stmt->execute($params);
    $list = $stmt->fetchAll();

    echo json_encode([
        'code' => 200,
        'data' => [
            'list' => $list,
            'total' => intval($total),
            'page' => $page,
            'pageSize' => $pageSize
        ]
    ]);
}
```

---

## 10. 常见问题

### 10.1 Token 未传递

**问题**：API 返回 401 未授权

**原因**：前端未传递 token

**解决**：
```javascript
// 确保 getToken() 函数存在
function getToken() {
    return localStorage.getItem('admin_token') || '';
}

// 初始化时传递 token
new DbTable({
    token: getToken(),  // 🔑 必须传递
    // ...
});
```

### 10.2 CDN 缓存导致更新不生效

**问题**：修改 JS 文件后，页面仍显示旧版本

**解决**：添加版本号
```html
<script src="/admin/dbtable.js?v=2"></script>
```

### 10.3 变量重复声明错误

**问题**：SPA 模式下报错 "Identifier has already been declared"

**解决**：使用 `var` 而非 `const/let`
```javascript
// ❌ 错误
const API_URL = '/api/users';

// ✅ 正确
var API_URL = '/api/users';
```

### 10.4 PHP API 输出两个 JSON

**问题**：前端 JSON.parse() 失败

**原因**：require 了其他完整的 API 入口文件

**解决**：只 require `.inc.php` 库文件，自己定义认证函数

---

## 11. 方法列表

| 方法 | 说明 | 参数 |
|------|------|------|
| `loadData()` | 加载数据 | - |
| `refresh()` | 刷新数据 | - |
| `openEditDialog(row)` | 打开编辑对话框 | row: 数据行或 null |
| `closeEditDialog()` | 关闭编辑对话框 | - |

---

## 12. 样式定制

### 12.1 CSS 变量

```css
:root {
    --dbtable-bg: #1a1a2e;
    --dbtable-border: #333;
    --dbtable-text: #e0e0e0;
    --dbtable-text-secondary: #888;
    --dbtable-primary: #e50914;
    --dbtable-hover: rgba(255,255,255,0.05);
}
```

### 12.2 状态颜色

```css
.status-dot.active { background: #52c41a; }
.status-dot.inactive { background: #ff4d4f; }
.status-dot.dev { background: #faad14; }
```

---

**最后更新**: 2025-12-31 | **维护者**: ZERO 框架团队
