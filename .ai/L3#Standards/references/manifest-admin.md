# manifest-admin - Manifest 管理页面规范

> **文档版本**：v1.1.0
> **创建日期**：2025-12-31
> **更新日期**：2025-12-31

---

## 📍 文档定位

本文档定义 **Manifest 管理页面**的实现规范。这是 ZERO 框架**强烈推荐**的管理后台核心功能页面，用于可视化管理 `xxx_manifest_list` 表中的页面配置。

**⚠️ 重要提示**：这是一个**树形层级视图**页面，**不是普通的数据表格**！

**关联文档**：
- `02.backend-04.db-manifest` - 页面清单表结构
- `admin-layout` - 管理后台布局（B区使用此数据）
- `05.biz-01.menu` - 侧边栏菜单规范

---

## 🎯 核心价值

### 为什么需要这个页面？

1. **可视化配置**：直观查看和编辑所有页面的配置信息
2. **文件系统同步**：自动扫描文件系统，发现未配置的页面
3. **警告提示**：快速定位缺少配置的页面目录
4. **批量管理**：统一管理页面的名称、图标、排序等属性

### 核心功能

- ✅ **层级树形展示**（文件系统结构，递归渲染）
- ✅ 数据库配置状态标记（已配置/未配置）
- ✅ 节点编辑功能（新增/修改配置）
- ✅ 全部展开/收缩操作
- ✅ 统计信息展示
- ✅ 展开状态持久化（localStorage）

### ❌ 这不是什么

- ❌ **不是普通的数据表格**（不使用 DatabaseTable 组件）
- ❌ 不是扁平列表视图
- ❌ 不是分页表格

---

## 📐 页面布局

### 整体结构

```
┌─────────────────────────────────────────────────────────────────┐
│ 统计信息栏                                                       │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│ │ 文件总数 │ │ 目录总数 │ │最大层级深度│ │已配置页面│  [展开] [收缩] [刷新]│
│ │   0     │ │   42    │ │    5    │ │   38   │                │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
├─────────────────────────────────────────────────────────────────┤
│ 层级树视图（递归渲染，可展开/收缩）                                │
│ ▼ 📁 admin/                               [已配置] [12] [✏️]    │
│   ▼ 📁 users/                             [已配置] [3]  [✏️]    │
│     ├── 📁 list/                          [已配置]      [✏️]    │
│     ├── 📁 roles/                         [未配置] ⚠️   [✏️]    │
│     └── 📁 settings/                      [已配置]      [✏️]    │
│   ▶ 📁 system/                            [已配置] [5]  [✏️]    │
│ ▶ 📁 home/                                [已配置] [8]  [✏️]    │
└─────────────────────────────────────────────────────────────────┘
```

### 节点显示元素

每个树节点包含：

```
[▼/▶] [图标] [显示名称] [配置状态标签] [子级数量] [编辑按钮]
              └── 路径信息（灰色小字）
```

| 元素 | 说明 |
|------|------|
| ▼/▶ | 展开/收缩图标（有子节点时显示） |
| 图标 | 从数据库配置获取，默认 `folder` |
| 显示名称 | 优先使用 `shortName`，fallback 到目录名 |
| 配置状态 | `[已配置]` 绿色 / `[未配置]` 黄色警告 |
| 子级数量 | 递归统计所有子孙节点数量 |
| 编辑按钮 | 点击打开编辑弹窗 |

---

## 🔧 核心实现

### 1. 数据加载流程

```typescript
async function loadHierarchyData() {
  // 1. 并行获取文件系统结构和数据库配置
  const [fileSystemResponse, manifestResponse] = await Promise.all([
    fetch('/api/v1/admin/files/scan-directory?path=resources/js/views'),
    fetch('/api/v1/admin/xxx/manifest-list?per_page=1000')
  ])

  // 2. 将数据库配置转换为以 path 为 key 的 Map
  const manifestConfig = new Map()
  manifestData.forEach(item => {
    if (item.path) {
      manifestConfig.set(item.path, item)
    }
  })

  // 3. 合并文件系统结构和数据库配置
  const enrichedTree = enrichTreeWithManifestConfig(
    fileSystemResult.structure.children,
    manifestConfig
  )

  // 4. 计算统计信息
  calculateHierarchyStats(enrichedTree)
}
```

### 2. 树结构数据合并

```typescript
/**
 * 合并文件系统结构和数据库配置
 *
 * 核心逻辑：
 * 1. 只保留目录节点（过滤文件）
 * 2. 尝试多种路径格式匹配数据库配置
 * 3. 标记配置状态和警告信息
 * 4. 按 sortOrder 排序
 */
function enrichTreeWithManifestConfig(
  tree: FileNode[],
  manifestConfig: Map<string, ManifestItem>
): EnrichedNode[] {

  return tree
    .filter(node => node.type === 'directory')  // 只保留目录
    .map(node => {
      const enrichedNode = { ...node }

      // 路径匹配策略（按优先级）
      const pathVariants = [
        '/' + node.path + '/',           // /resources/js/views/admin/users/
        '/' + node.path,                 // /resources/js/views/admin/users
        node.path + '/',                 // resources/js/views/admin/users/
        node.path                        // resources/js/views/admin/users
      ]

      let matchedConfig = null
      for (const pathVariant of pathVariants) {
        if (manifestConfig.has(pathVariant)) {
          matchedConfig = manifestConfig.get(pathVariant)
          break
        }
      }

      if (matchedConfig) {
        // 有数据库配置
        enrichedNode.manifestConfig = matchedConfig
        enrichedNode.displayName = matchedConfig.shortName || matchedConfig.name || node.name
        enrichedNode.icon = matchedConfig.icon
        enrichedNode.color = matchedConfig.color
        enrichedNode.hasConfig = true
        enrichedNode.sortOrder = matchedConfig.sortOrder
      } else {
        // 无数据库配置 - 标记警告
        const pathDepth = node.path.split('/').filter(Boolean).length
        enrichedNode.hasConfig = false
        enrichedNode.isWarning = pathDepth > 3  // 只对深层目录显示警告
        enrichedNode.warningText = '未在数据库中配置'
      }

      // 递归处理子节点
      if (node.children?.length > 0) {
        enrichedNode.children = enrichTreeWithManifestConfig(node.children, manifestConfig)
      }

      return enrichedNode
    })
    .sort((a, b) => {
      // 排序规则：有配置的按 sortOrder，无配置的按名称
      if (a.hasConfig && b.hasConfig) {
        return (a.sortOrder || 999) - (b.sortOrder || 999)
      }
      if (a.hasConfig) return -1
      if (b.hasConfig) return 1
      return a.name.localeCompare(b.name, 'zh-CN')
    })
}
```

### 3. 树节点组件（递归）

```vue
<!-- ManifestTreeNode.vue -->
<template>
  <div class="tree-node" :class="{ 'has-warning': node.isWarning }">
    <div class="node-content" :style="{ paddingLeft: `${level * 20 + 12}px` }">
      <!-- 展开/收缩图标 -->
      <div class="expand-icon" v-if="hasChildren" @click.stop="toggleExpand">
        <Icon :name="isExpanded ? 'chevron-down' : 'chevron-right'" />
      </div>
      <div v-else class="expand-placeholder"></div>

      <!-- 节点图标 -->
      <div class="node-icon">
        <Icon :name="displayIcon" :style="iconStyle" />
      </div>

      <!-- 节点信息 -->
      <div class="node-info">
        <div class="node-name">
          {{ displayName }}
          <!-- 配置状态标签 -->
          <Tag v-if="node.hasConfig" theme="success" size="small">已配置</Tag>
          <Tag v-else-if="node.isWarning" theme="warning" size="small">未配置</Tag>
          <!-- 子级数量 -->
          <Tag v-if="hasChildren" theme="primary" size="small">{{ childrenCount }}</Tag>
        </div>
        <div class="node-path">{{ node.path }}</div>
      </div>

      <!-- 编辑按钮 -->
      <div class="node-actions">
        <Button variant="text" size="small" @click.stop="handleEdit">
          <Icon name="edit" />
        </Button>
      </div>
    </div>

    <!-- 🔑 递归渲染子节点 -->
    <div v-if="isExpanded && hasChildren" class="children-container">
      <ManifestTreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :level="level + 1"
        @node-edit="$emit('node-edit', $event)"
      />
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'ManifestTreeNode' })  // 递归组件必须声明名称

const props = defineProps(['node', 'level'])
const emit = defineEmits(['node-edit'])

// 展开状态持久化
const STORAGE_KEY = 'manifest-tree-expand-states'

const getStoredExpandState = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const states = JSON.parse(stored)
    return states[props.node.path] || false
  }
  return false
}

const saveExpandState = (expanded) => {
  const stored = localStorage.getItem(STORAGE_KEY) || '{}'
  const states = JSON.parse(stored)
  states[props.node.path] = expanded
  localStorage.setItem(STORAGE_KEY, JSON.stringify(states))
}

const isExpanded = ref(getStoredExpandState())

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  saveExpandState(isExpanded.value)
}

// 全局展开/收缩事件监听
onMounted(() => {
  window.addEventListener('manifest-tree-expand-all', () => {
    isExpanded.value = true
    saveExpandState(true)
  })
  window.addEventListener('manifest-tree-collapse-all', () => {
    isExpanded.value = false
    saveExpandState(false)
  })
})
</script>
```

### 4. 编辑功能

```typescript
/**
 * 处理节点编辑
 *
 * 两种场景：
 * 1. 已有配置 → 编辑现有记录
 * 2. 未配置 → 创建新记录（自动填充默认值）
 */
function handleNodeEdit(node: EnrichedNode) {
  let editData: ManifestEditData

  if (node.hasConfig && node.manifestConfig) {
    // 编辑现有配置
    editData = {
      id: node.manifestConfig.id,
      path: node.manifestConfig.path,
      url: node.manifestConfig.url,
      route: node.manifestConfig.route,
      name: node.manifestConfig.name,
      shortName: node.manifestConfig.shortName,
      icon: node.manifestConfig.icon || 'folder',
      color: node.manifestConfig.color || '#1890ff',
      sortOrder: node.manifestConfig.sortOrder || 100,
      status: node.manifestConfig.status || 'active'
    }
  } else {
    // 创建新配置 - 自动推导字段值
    const normalizedPath = ensureLeadingSlash(node.path) + '/'

    editData = {
      path: normalizedPath,
      vuePageComponent: normalizedPath + 'index.vue',
      url: normalizedPath.replace(/^\/resources\/js\/views/, ''),
      route: pathToRoute(normalizedPath),
      name: node.name || '未命名页面',
      shortName: node.name || '未命名',
      icon: 'folder',
      color: '#1890ff',
      sortOrder: 100,
      status: 'development'
    }
  }

  // 打开编辑弹窗
  openEditDialog(editData)
}

// 路径转路由名称
function pathToRoute(path: string): string {
  return path
    .replace(/^\/resources\/js\/views\//, '')
    .replace(/\//g, '_')
    .replace(/_$/, '')
}
```

---

## 📊 统计信息

```typescript
interface HierarchyStats {
  totalFiles: number       // 文件总数（通常为0，只统计目录）
  totalDirectories: number // 目录总数
  maxDepth: number         // 最大层级深度
  configuredPages: number  // 已配置页面数
}

function calculateHierarchyStats(tree: EnrichedNode[]): HierarchyStats {
  let totalDirectories = 0
  let configuredPages = 0
  let maxDepth = 0

  const traverse = (nodes: EnrichedNode[], depth = 1) => {
    nodes.forEach(node => {
      if (node.type === 'directory') {
        totalDirectories++
        if (node.hasConfig) configuredPages++
        maxDepth = Math.max(maxDepth, depth)

        if (node.children?.length > 0) {
          traverse(node.children, depth + 1)
        }
      }
    })
  }

  traverse(tree)

  return { totalFiles: 0, totalDirectories, maxDepth, configuredPages }
}
```

---

## 🎨 样式规范

### 警告状态样式

```scss
.tree-node {
  &.has-warning {
    .node-content {
      background-color: rgba(250, 173, 20, 0.1);
      border-left: 3px solid #faad14;
    }

    .warning-icon {
      color: #faad14;
    }
  }
}

// 配置状态标签
.config-status {
  margin-left: 8px;
}

// 子级数量标签
.children-count {
  margin-left: 4px;
}
```

### 层级缩进

```scss
.node-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--hover-bg-color);
  }
}

// 缩进计算：level * 20px + 12px 基础内边距
```

---

## 🔌 API 接口

### 1. 文件系统扫描

```
GET /api/v1/admin/files/scan-directory?path=resources/js/views

Response:
{
  "success": true,
  "structure": {
    "name": "views",
    "path": "resources/js/views",
    "type": "directory",
    "children": [
      {
        "name": "admin",
        "path": "resources/js/views/admin",
        "type": "directory",
        "children": [...]
      }
    ]
  }
}
```

### 2. Manifest 列表查询

```
GET /api/v1/admin/xxx/manifest-list?per_page=1000

Response:
{
  "data": [
    {
      "id": 1,
      "path": "/resources/js/views/admin/users/",
      "url": "/admin/users",
      "route": "admin_users",
      "name": "用户管理",
      "shortName": "用户",
      "icon": "user",
      "color": "#1890ff",
      "sortOrder": 10,
      "status": "active"
    }
  ],
  "total": 42
}
```

### 3. Manifest 创建/更新

```
POST /api/v1/admin/xxx/manifest-list
PUT  /api/v1/admin/xxx/manifest-list/:id

Body:
{
  "path": "/resources/js/views/admin/users/roles/",
  "url": "/admin/users/roles",
  "route": "admin_users_roles",
  "name": "角色管理",
  "shortName": "角色",
  "icon": "user-group",
  "color": "#52c41a",
  "sortOrder": 20,
  "status": "active"
}
```

---

## ⚠️ 注意事项

### 1. 路径格式一致性

```typescript
// 数据库存储格式（带前导和尾部斜杠）
path: '/resources/js/views/admin/users/'

// 文件系统扫描格式（无前导斜杠）
path: 'resources/js/views/admin/users'

// 匹配时需要处理多种格式
```

### 2. 递归组件声明

```typescript
// 递归组件必须声明 name
defineOptions({
  name: 'ManifestTreeNode'
})
```

### 3. 展开状态持久化

```typescript
// 使用 localStorage 保存展开状态
// 避免每次刷新页面都需要重新展开
const STORAGE_KEY = 'manifest-tree-expand-states'
```

### 4. 性能优化

```typescript
// 大量节点时使用虚拟滚动
// 或限制初始展开层级
const MAX_AUTO_EXPAND_DEPTH = 2
```

---

## 📁 推荐目录结构

```
pages/admin/system/manifest/
├── index.vue                    # 页面入口
├── ManifestList.logic.ts        # 业务逻辑（可选）
├── ManifestList.style.scss      # 页面样式
├── ManifestTreeNode.vue         # 树节点组件（递归）
└── ManifestTreeNode.style.scss  # 节点样式
```

---

## 🔗 关联文档

| 文档 | 说明 |
|------|------|
| `02.backend-04.db-manifest` | 数据表结构定义 |
| `03.frontend-02.admin-layout` | B区侧边栏使用此数据 |
| `05.biz-01.menu` | 菜单生成逻辑 |

---

**最后更新**：2025-12-31

---

## 🚨 常见错误

### ❌ 错误实现：使用普通表格

```
┌────┬────────┬──────────┬────────┬────────┐
│ ID │ 简称   │ 全称     │ 图标   │ 路径   │  ← 这是错误的！
├────┼────────┼──────────┼────────┼────────┤
│ 1  │ 调度室 │ Command  │ shield │ /cmd/  │
│ 2  │ 配置   │ CfgHub   │ settings│ /cfg/ │
└────┴────────┴──────────┴────────┴────────┘
```

**问题**：
- 丢失了层级关系
- 无法直观看到目录结构
- 无法发现未配置的目录

### ✅ 正确实现：树形层级视图

```
▼ 📁 cmd/                    [已配置] [5]  [✏️]
  ├── 📁 cfghub/             [已配置] [2]  [✏️]
  │   ├── 📁 msrinfo/        [已配置]      [✏️]
  │   └── 📁 extservices/    [未配置] ⚠️   [✏️]  ← 警告：未配置
  └── 📁 datahub/            [已配置]      [✏️]
```

**优势**：
- 清晰的层级关系
- 一眼看出哪些目录未配置
- 支持展开/收缩操作
