# 03.frontend-02.admin-layout - 管理后台布局规范

> **文档版本**：v1.0.0
> **创建日期**：2025-12-30

---

## 📍 文档定位

本文档定义**管理后台 ABCD 四区域布局**的设计规范。

**关联文档**：
- `02.backend-04.db-manifest` - 页面清单表（B区数据源）
- `05.biz-01.menu` - 侧边栏菜单规范（B区业务逻辑）

---

## ABCD 四区域架构

```
┌─────────────────────────────────────────────────────────┐
│ A区：顶部栏 (56px)                                       │
│ Logo + 快捷操作 + 通知 + 用户信息                         │
├─────┬───────────────────────────────────────────────────┤
│  B  │ C区：页面头部 (48px)                               │
│  区 │ 面包屑导航 + 页面操作按钮                           │
│     ├───────────────────────────────────────────────────┤
│  侧 │ D区：主内容区 (自适应)                              │
│  边 │ router-view                                        │
│  栏 │                                                    │
│ 240px│                                                   │
└─────┴───────────────────────────────────────────────────┘
```

## 尺寸规范

| 区域 | 高度/宽度 | 收缩状态 |
|------|----------|---------|
| A区 | 56px (高) | - |
| B区 | 240px (宽) | 60px |
| C区 | 48px (高) | - |
| D区 | 自适应 | - |

---

## A区：顶部栏

### 职责边界

**负责**:
- ✅ 品牌 Logo 展示
- ✅ 快捷操作按钮（主页、全屏、刷新、设置）
- ✅ 通知中心（Badge + Drawer）
- ✅ 用户信息下拉菜单（个人资料、退出登录）

**不负责**:
- ❌ 菜单导航（在 B 区）
- ❌ 页面操作按钮（在 C 区）

### 组件结构

```
A.TopBar/
├── index.vue           # 入口 (简单场景可合并)
├── A.TopBar.vue        # 主组件
└── A.TopBar.style.scss # 样式 (可选)
```

### 核心功能

```typescript
// 快捷操作
goToHomePage()        // 返回主页
toggleFullscreen()    // 全屏切换
refreshPage()         // 刷新页面

// 通知
toggleNotifications() // 打开通知抽屉
markAsRead(id)        // 标记已读

// 用户
logout()              // 退出登录
```

### 依赖

- `useUserStore` - 用户信息
- `useNotificationStore` - 通知管理 (可选)

---

## B区：智能动态侧边栏（多层级）

> **核心特性**：自动扫描文件系统 + `xxx_manifest_list` 表配置合并 + **无限层级递归渲染**
>
> **关联文档**：
> - `02.backend-04.db-manifest` - 数据表结构
> - `05.biz-01.menu` - 菜单生成逻辑

### 职责边界

**负责**:
- ✅ **多层级菜单树递归渲染**（支持无限层级嵌套）
- ✅ 与 `xxx_manifest_list` 表配置合并
- ✅ 警告状态显示（无配置/配置不完整）
- ✅ **菜单展开/收缩状态管理**（每个层级独立控制）
- ✅ 侧边栏整体收缩/展开（240px ↔ 60px）
- ✅ 菜单点击路由跳转
- ✅ 当前路由高亮 + **自动展开父级链**

**不负责**:
- ❌ 面包屑导航（在 C 区）
- ❌ 页面内容渲染（在 D 区）

### 多层级菜单结构示例

```
├── 用户管理                    # 一级菜单
│   ├── 用户列表               # 二级菜单
│   ├── 角色管理               # 二级菜单
│   │   ├── 角色列表           # 三级菜单
│   │   └── 权限配置           # 三级菜单
│   └── 部门管理               # 二级菜单
├── 系统设置                    # 一级菜单
│   ├── 基础配置               # 二级菜单
│   └── 高级设置               # 二级菜单
│       ├── 缓存管理           # 三级菜单
│       └── 日志配置           # 三级菜单
```

### 数据流架构

```
文件系统递归扫描（所有层级）
  ↓
xxx_manifest_list 表批量查询
  ↓
数据合并 + 警告标记
  ↓
构建嵌套树结构
  ↓
缓存（Redis/内存）
  ↓
前端递归渲染
```

### 与 manifest_list 表的关系

```
文件系统路径: /pages/admin/users/roles/list/
        ↓ 查询
manifest_list.path = '/pages/admin/users/roles/list/'
        ↓ 获取
shortName, icon, color, sortOrder, status...
        ↓ 合并
菜单项数据（保留层级关系）
```

### 菜单项数据结构

```typescript
interface MenuItem {
  // 文件系统来源（始终有值）
  key: string              // 唯一标识（基于路径）
  path: string             // 文件系统路径
  url: string              // 访问 URL
  folderName: string       // 目录名（始终保留）
  level: number            // 层级深度（1, 2, 3...）

  // 数据库来源（可能为 null）
  shortName: string | null // 显示名称
  icon: string | null      // 图标
  color: string | null     // 颜色
  sortOrder: number | null // 排序

  // 状态标记
  hasDbRecord: boolean     // 是否有数据库记录
  warnings: Warning[]      // 警告列表

  // 🔑 子菜单（递归结构）
  children?: MenuItem[]    // 子菜单数组，支持无限嵌套
}
```

### 展开/收缩状态管理

```typescript
// 使用 Set 存储展开的菜单 key
const expandedMenus = ref<Set<string>>(new Set())

// 切换展开状态
function toggleExpand(menuKey: string) {
  if (expandedMenus.value.has(menuKey)) {
    // 收缩时：同时收缩所有子孙菜单
    expandedMenus.value.delete(menuKey)
    collapseAllDescendants(menuKey)
  } else {
    expandedMenus.value.add(menuKey)
  }
}

// 自动展开父级链（路由变化时）
function expandParentMenus(routePath: string) {
  const parentKeys = findParentChain(menuTree, routePath)
  parentKeys.forEach(key => expandedMenus.value.add(key))
}
```

### 递归渲染组件

```vue
<!-- B.Sidebar.MenuItemRenderer.vue -->
<template>
  <div class="menu-item" :class="itemClasses" :style="indentStyle">
    <!-- 菜单项内容 -->
    <div class="menu-item-content" @click="handleClick">
      <Icon :name="displayIcon" />
      <span class="menu-item-name">{{ displayName }}</span>
      <!-- 展开/收缩箭头（有子菜单时显示） -->
      <Icon
        v-if="hasChildren"
        :name="isExpanded ? 'chevron-down' : 'chevron-right'"
        class="expand-icon"
      />
    </div>

    <!-- 🔑 递归渲染子菜单 -->
    <div v-if="hasChildren && isExpanded" class="menu-children">
      <MenuItemRenderer
        v-for="child in menu.children"
        :key="child.key"
        :menu="child"
        :level="level + 1"
        :expanded-menus="expandedMenus"
        @menu-click="$emit('menu-click', $event)"
      />
    </div>
  </div>
</template>

<script setup>
// 缩进样式（每层级增加 16px）
const indentStyle = computed(() => ({
  paddingLeft: `${(props.level - 1) * 16 + 12}px`
}))
</script>
```

### 显示规则

```typescript
// 显示名称：有 shortName 用 shortName，没有就用目录名
const displayName = item.shortName || item.folderName

// 图标：有就显示，没有显示警告图标
const displayIcon = item.icon || 'help-circle'

// 警告状态
const warningClass = !item.hasDbRecord
  ? 'menu-item--no-record'      // 红色警告
  : item.warnings.length > 0
    ? 'menu-item--incomplete'   // 黄色警告
    : ''                        // 正常
```

### 警告样式

```css
/* 无数据库记录 - 红色警告 */
.menu-item--no-record {
  opacity: 0.7;
  border-left: 3px solid #ff4d4f;
}

/* 字段不完整 - 黄色警告 */
.menu-item--incomplete {
  border-left: 3px solid #faad14;
}

/* 层级缩进 */
.menu-children {
  /* 子菜单容器 */
}

/* 展开/收缩动画 */
.menu-children {
  overflow: hidden;
  transition: max-height 0.3s ease;
}
```

### 组件结构

```
B.Sidebar/
├── index.vue                       # 入口
├── B.Sidebar.vue                   # 主组件
├── B.Sidebar.logic.ts              # 业务逻辑（含递归算法）
├── B.Sidebar.style.scss            # 样式
└── B.Sidebar.MenuItemRenderer.vue  # 🔑 递归菜单项渲染器
```

### 核心方法

```typescript
// 获取菜单树（文件系统 + 数据库合并，递归构建）
async function loadMenuTree(): Promise<MenuItem[]>

// 切换收缩
function toggleCollapse(): void

// 菜单点击（区分：有子菜单展开/无子菜单跳转）
function handleMenuClick(menu: MenuItem): void

// 切换菜单展开状态
function toggleMenuExpand(menuKey: string): void

// 自动展开父级到当前路由
function expandParentMenus(routePath: string): void

// 收缩菜单及其所有子孙
function collapseWithDescendants(menuKey: string): void

// 刷新菜单缓存
async function refreshMenuCache(): Promise<void>
```

### 缓存策略

```typescript
// 缓存键
const CACHE_KEY = 'sidebar_menu_tree'

// 缓存刷新时机
// 1. 手动点击刷新按钮
// 2. 新建/删除目录后
// 3. 修改 manifest_list 表后
```

---

## C区：页面头部（含复制功能）

### 职责边界

**负责**:
- ✅ 面包屑导航显示
- ✅ **路径复制功能**（复制按钮）
- ✅ 页面操作按钮（刷新、全屏）

**不负责**:
- ❌ 菜单导航（在 B 区）
- ❌ 页面内容渲染（在 D 区）
- ❌ 全局操作（在 A 区）

### 组件结构

```
C.PageHeader/
├── index.vue              # 入口
├── C.PageHeader.vue       # 主组件
├── C.PageHeader.logic.ts  # 业务逻辑
└── C.PageHeader.style.scss # 样式
```

### 布局结构

```
┌──────────────────────────────────────────────────────────────┐
│ 页面:用户列表  路径:管理后台/用户管理/用户列表 [📋]  [🔄] [⛶] │
└──────────────────────────────────────────────────────────────┘

[📋] = 复制按钮（复制页面信息和链接）
[🔄] = 刷新按钮
[⛶] = 全屏按钮
```

### 面包屑数据结构

```typescript
interface BreadcrumbItem {
  title: string      // 显示名称（来自 manifest_list.shortName）
  path: string       // 路由路径
  icon?: string      // 图标（可选）
}

// 示例数据
const breadcrumbs = [
  { title: '管理后台', path: '/admin', icon: 'dashboard' },
  { title: '用户管理', path: '/admin/users', icon: 'user' },
  { title: '用户列表', path: '/admin/users/list', icon: 'list' }
]
```

### 🔑 复制功能实现

```typescript
// 复制状态
const copyingPath = ref(false)
const pathCopyIcon = ref('file-copy')  // 复制图标状态

/**
 * 复制面包屑路径（包含页面信息和URL）
 *
 * 复制内容格式：
 * 页面:用户列表      路径:管理后台/用户管理/用户列表
 * https://example.com/admin/users/list
 */
async function copyBreadcrumbPath() {
  copyingPath.value = true

  try {
    // 获取当前页面名称（最后一级）
    const pageName = getCurrentPageName()

    // 获取完整路径文本（用斜杠分隔）
    const pathText = breadcrumbs.value
      .map(item => item.title)
      .join('/')

    // 获取当前完整 URL
    const currentUrl = window.location.href

    // 组装复制内容
    const textToCopy = `页面:${pageName}      路径:${pathText}\n${currentUrl}`

    // 写入剪贴板
    await navigator.clipboard.writeText(textToCopy)

    // 显示成功状态（图标变为勾）
    pathCopyIcon.value = 'check'
    showMessage('路径已复制', 'success')

    // 2秒后恢复图标
    setTimeout(() => {
      pathCopyIcon.value = 'file-copy'
    }, 2000)

  } catch (err) {
    console.error('复制失败:', err)
    showMessage('复制失败，请手动复制', 'error')
  } finally {
    copyingPath.value = false
  }
}

// 获取当前页面名称（面包屑最后一级）
function getCurrentPageName(): string {
  if (breadcrumbs.value.length > 0) {
    return breadcrumbs.value[breadcrumbs.value.length - 1].title
  }
  return '管理后台'
}

// 获取斜杠分隔的完整路径
const fullBreadcrumbTextWithSlashes = computed(() => {
  return breadcrumbs.value.map(item => item.title).join('/')
})
```

### 复制按钮 UI

```vue
<template>
  <div class="page-header">
    <!-- 左侧：面包屑信息 -->
    <div class="header-info">
      <span class="label">页面:</span>
      <span class="page-name">{{ getCurrentPageName() }}</span>
      <span class="separator"></span>
      <span class="label">路径:</span>
      <span class="path-value">{{ fullBreadcrumbTextWithSlashes }}</span>

      <!-- 🔑 复制按钮 -->
      <button
        class="copy-btn"
        @click="copyBreadcrumbPath"
        :disabled="copyingPath"
        title="复制页面信息和链接"
      >
        <Icon :name="pathCopyIcon" />
      </button>
    </div>

    <!-- 右侧：操作按钮 -->
    <div class="header-actions">
      <button @click="refreshContent" title="刷新">
        <Icon name="refresh" />
      </button>
      <button @click="toggleFullscreen" title="全屏">
        <Icon :name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" />
      </button>
    </div>
  </div>
</template>
```

### 复制按钮样式

```css
.copy-btn {
  padding: 4px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #333;
}

/* 复制成功状态 */
.copy-btn .icon-check {
  color: #52c41a;  /* 绿色勾 */
}

/* 复制中状态 */
.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 面包屑生成逻辑

```typescript
// 从 manifest_list 数据生成面包屑
async function generateBreadcrumbs() {
  const pathSegments = route.path.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = []

  // 添加根节点
  items.push({
    title: '管理后台',
    path: '/admin',
    icon: 'dashboard'
  })

  // 逐级构建路径并查询配置
  let currentPath = ''
  for (let i = 1; i < pathSegments.length; i++) {
    currentPath += `/${pathSegments[i]}`
    const fullPath = `/admin${currentPath}`

    // 从 manifest_list 获取配置
    const config = await fetchPathConfig(fullPath)

    items.push({
      title: config?.shortName || pathSegments[i],
      path: fullPath,
      icon: config?.icon
    })
  }

  breadcrumbs.value = items
}

// 监听路由变化，自动更新面包屑
watch(() => route.path, generateBreadcrumbs, { immediate: true })
```

### 核心功能

```typescript
// 面包屑
generateBreadcrumbs()           // 根据路由生成面包屑
copyBreadcrumbPath()            // 🔑 复制路径（含页面信息和URL）
getCurrentPageName()            // 获取当前页面名称

// 页面操作
refreshContent()                // 刷新 D 区域
toggleFullscreen()              // CD 区域全屏
```

---

## D区：主内容区

### 职责边界

**负责**:
- ✅ 页面内容渲染（router-view）
- ✅ 组件缓存（keep-alive）
- ✅ 加载状态管理
- ✅ 错误状态处理

**不负责**:
- ❌ 面包屑导航（在 C 区）
- ❌ 页面操作按钮（在 C 区）
- ❌ 菜单导航（在 B 区）

### 组件结构

```
D.ContentArea/
├── index.vue               # 入口
├── D.ContentArea.vue       # 主组件
└── D.ContentArea.style.scss # 样式
```

### 核心渲染

```vue
<template>
  <div class="content-area">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <Loading text="页面加载中..." />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="error-container">
      <ErrorPage :message="errorMessage" @retry="retryLoad" />
    </div>

    <!-- 正常内容 -->
    <router-view v-else v-slot="{ Component, route }">
      <keep-alive :max="10">
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </router-view>
  </div>
</template>
```

### 核心状态

```typescript
interface ContentAreaState {
  isLoading: boolean    // 加载中
  hasError: boolean     // 错误状态
  errorMessage: string  // 错误信息
}
```

---

## 主布局组件

### 文件结构

```
layouts/
├── AdminLayout.vue         # 主布局入口
├── components/
│   ├── A.TopBar.vue
│   ├── B.Sidebar.vue
│   ├── B.Sidebar.MenuItemRenderer.vue
│   ├── C.PageHeader.vue
│   └── D.ContentArea.vue
└── styles/
    └── admin-layout.scss
```


### AdminLayout.vue 示例

```vue
<template>
  <div class="admin-layout" :style="layoutVars">
    <!-- A区：顶部栏 -->
    <TopBar class="area-a" />

    <!-- 主体区域 -->
    <div class="area-main">
      <!-- B区：侧边栏 -->
      <Sidebar
        class="area-b"
        @toggle-collapse="handleSidebarCollapse"
      />

      <!-- CD区域容器 -->
      <div class="area-cd">
        <!-- C区：页面头部 -->
        <PageHeader class="area-c" />

        <!-- D区：主内容区 -->
        <ContentArea class="area-d" />
      </div>
    </div>
  </div>
</template>

<script setup>
import TopBar from './components/A.TopBar.vue'
import Sidebar from './components/B.Sidebar.vue'
import PageHeader from './components/C.PageHeader.vue'
import ContentArea from './components/D.ContentArea.vue'

const sidebarCollapsed = ref(false)

const layoutVars = computed(() => ({
  '--area-a-height': '56px',
  '--area-b-width': sidebarCollapsed.value ? '60px' : '240px',
  '--area-c-height': '48px'
}))

const handleSidebarCollapse = (collapsed) => {
  sidebarCollapsed.value = collapsed
}
</script>

<style lang="scss">
.admin-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.area-a {
  height: var(--area-a-height);
  flex-shrink: 0;
}

.area-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.area-b {
  width: var(--area-b-width);
  flex-shrink: 0;
  transition: width 0.3s;
}

.area-cd {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.area-c {
  height: var(--area-c-height);
  flex-shrink: 0;
}

.area-d {
  flex: 1;
  overflow: auto;
}
</style>
```

---

## 区域间通信

### 推荐方式：Pinia Store

```typescript
// stores/layout.ts
export const useLayoutStore = defineStore('layout', {
  state: () => ({
    sidebarCollapsed: false,
    contentFullscreen: false
  }),
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    toggleFullscreen() {
      this.contentFullscreen = !this.contentFullscreen
    }
  }
})
```

### 通信流向

```
┌─────────────────────────────────────────┐
│           Pinia Store (共享状态)         │
│  layoutStore / menuStore / userStore    │
└─────────────────────────────────────────┘
       ↑              ↑              ↑
       │              │              │
   ┌───┴───┐     ┌────┴────┐    ┌────┴────┐
   │ A区   │     │  B区    │    │  C区    │
   │TopBar │     │Sidebar  │    │PageHeader│
   └───────┘     └─────────┘    └─────────┘
                      │
                      ↓ router.push()
                 ┌─────────┐
                 │  D区    │
                 │ContentArea│
                 └─────────┘
```

---

## 命名规范

### 文件命名

```
[区域标识].[组件名称].[文件类型]

示例:
A.TopBar.vue
B.Sidebar.vue
B.Sidebar.logic.ts
B.Sidebar.MenuItemRenderer.vue
C.PageHeader.vue
D.ContentArea.vue
```

### CSS 类名

```scss
// 区域容器
.area-a { }
.area-b { }
.area-c { }
.area-d { }

// 组件内部
.top-bar { }
.sidebar { }
.page-header { }
.content-area { }
```

---

## 与 LickJCR 的映射关系

| ZERO | LickJCR | 职责 |
|------|--------|------|
| A区 | A区 | 顶部栏 |
| B区 | D区 | 智能动态侧边栏（文件系统 + manifest_list） |
| C区 | E区 | 页面头部 |
| D区 | F区 | 主内容区 |

**简化点**:
- 移除 LickJCR 的 B区（一级菜单横向导航）
- 移除 LickJCR 的 C区（标签页栏）
- 移除 LickJCR 的 D2区（子侧边栏）
- 简化缓存策略
- 简化加载编排

---

## 🔗 关联文档

| 文档 | 说明 |
|------|------|
| `02.backend-04.db-manifest` | B区数据源：manifest_list 表结构 |
| `05.biz-01.menu` | B区业务逻辑：菜单生成规则 |
| `03.frontend-01.structure` | 前端目录结构规范 |

---

**最后更新**：2025-12-30
