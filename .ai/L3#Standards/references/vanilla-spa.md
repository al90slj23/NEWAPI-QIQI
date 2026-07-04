# 03.frontend-03.vanilla-spa - 原生 JS SPA 架构规范

> **文档版本**：v1.0.0
> **创建日期**：2025-12-31

---

## 📍 文档定位

本文档定义**不使用前端框架（Vue/React）时**，如何用原生 JavaScript 实现 SPA（单页应用）架构。

**适用场景**：
- 项目技术栈为 Pure HTML + CSS + Vanilla JS
- 不使用构建工具（webpack/vite）
- 需要实现管理后台的 ABCD 四区域布局
- 需要 D 区域动态加载，ABC 区域保持不变

**关联文档**：
- `03.frontend-02.admin-layout` - ABCD 四区域布局规范
- `02.backend-04.db-manifest` - 页面清单表（菜单数据源）

---

## 🎯 核心理念

1. **单一入口**：整个管理后台只有一个 `index.html`
2. **D 区动态加载**：点击菜单时只刷新 D 区域内容
3. **History API**：使用 `pushState` 实现无刷新路由
4. **内容片段**：每个页面提供 `content.html` 作为 D 区域内容

---

## 📁 文件结构

### 目录布局

```
admin/
├── index.html              # 🔑 唯一入口（ABCD 框架）
├── content.html            # 根目录 D 区域内容
├── layout.css              # 布局样式
├── layout.js               # 🔑 SPA 路由核心逻辑
│
├── Users/                  # 用户管理模块
│   ├── content.html        # D 区域内容片段
│   ├── users.css
│   ├── users.js
│   └── List/               # 子模块
│       ├── content.html
│       ├── list.css
│       └── list.js
│
└── Settings/               # 设置模块
    ├── content.html
    ├── settings.css
    └── settings.js
```

### 关键文件说明

| 文件 | 职责 |
|------|------|
| `index.html` | 主框架，包含 ABCD 四区域结构，只加载一次 |
| `content.html` | D 区域内容片段，按需动态加载 |
| `layout.js` | SPA 路由、内容加载、菜单管理 |

---

## 🏗️ 主框架结构 (index.html)

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>管理后台</title>
    <link rel="stylesheet" href="/admin/layout.css">
</head>
<body>
    <div class="admin-layout">
        <!-- A区：顶部栏 -->
        <header class="area-a">
            <div class="logo">Logo</div>
            <div class="user-info">用户信息</div>
        </header>

        <!-- 主体区域 -->
        <div class="area-main">
            <!-- B区：侧边栏 -->
            <aside class="area-b">
                <nav class="sidebar-menu" id="sidebarMenu">
                    <!-- 由 JS 动态渲染 -->
                </nav>
            </aside>

            <!-- CD区域容器 -->
            <div class="area-cd">
                <!-- C区：页面头部 -->
                <div class="area-c">
                    <div class="page-info" id="pageInfo">
                        <!-- 面包屑由 JS 动态更新 -->
                    </div>
                    <div class="page-actions">
                        <button onclick="location.reload()">刷新</button>
                    </div>
                </div>

                <!-- D区：主内容区 🔑 -->
                <main class="area-d" id="mainContent">
                    <!-- 由 SPA 路由动态加载 -->
                </main>
            </div>
        </div>
    </div>

    <script src="/admin/layout.js"></script>
</body>
</html>
```

---

## 📄 内容片段结构 (content.html)

每个模块目录下的 `content.html` 只包含 D 区域的内容：

```html
<!-- Users/content.html -->
<!-- D区域内容：用户管理 -->
<div class="panel active">
    <div class="panel-header">
        <h2>用户列表</h2>
    </div>
    <div class="panel-body">
        <table id="userTable">
            <!-- 表格内容 -->
        </table>
    </div>
</div>

<!-- 模块专属样式 -->
<link rel="stylesheet" href="/admin/Users/users.css">

<!-- 模块专属脚本 -->
<script src="/admin/Users/users.js"></script>
<script>
    // 页面初始化
    if (typeof initUsers === 'function') {
        initUsers();
    }
</script>
```

### ⚠️ 关键注意事项

**1. Panel 显示问题**

如果使用 `.panel { display: none }` 的 CSS 规则（需要 `.active` 类才显示），必须在 `content.html` 中添加 `active` 类：

```html
<!-- ❌ 错误：panel 不会显示 -->
<div class="panel">...</div>

<!-- ✅ 正确：添加 active 类 -->
<div class="panel active">...</div>
```

**2. 变量声明问题**

SPA 模式下，JS 文件可能被多次加载。使用 `var` 而非 `const/let` 避免重复声明错误：

```javascript
// ❌ 错误：重复加载时报错 "Identifier has already been declared"
const API_URL = '/api/users';

// ✅ 正确：var 允许重复声明
var API_URL = '/api/users';

// ✅ 更好：检查是否已定义
if (typeof API_URL === 'undefined') {
    var API_URL = '/api/users';
}
```

---

## 🔄 SPA 路由实现 (layout.js)

### 核心变量

```javascript
// 当前路径
let currentPath = window.location.pathname;

// 菜单数据缓存
window._menuData = null;
```

### URL 到文件路径映射

```javascript
/**
 * URL 路径转文件路径
 * /admin/users -> admin/Users/
 * /admin/users/list -> admin/Users/List/
 */
function urlToFilePath(urlPath) {
    // 移除前缀和尾部斜杠
    const parts = urlPath.replace(/^\/admin\/?/, '').replace(/\/$/, '').split('/').filter(Boolean);

    if (parts.length === 0) {
        return 'admin/';
    }

    // URL 小写 -> 目录名映射（首字母大写）
    const dirMap = {
        'users': 'Users',
        'settings': 'Settings',
        'orders': 'Orders'
        // ... 根据项目添加
    };

    const fileParts = parts.map(p => dirMap[p.toLowerCase()] || capitalize(p));
    return 'admin/' + fileParts.join('/') + '/';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
```

### 内容加载函数

```javascript
/**
 * 加载 D 区域内容
 */
async function loadContent() {
    const contentEl = document.getElementById('mainContent');
    if (!contentEl) return;

    // 显示加载状态
    contentEl.innerHTML = '<div class="loading">加载中...</div>';

    // 获取内容文件路径
    const filePath = urlToFilePath(currentPath);
    const contentUrl = '/' + filePath + 'content.html';

    try {
        const resp = await fetch(contentUrl);

        if (resp.ok) {
            const html = await resp.text();
            contentEl.innerHTML = html;

            // 🔑 执行动态加载的脚本
            executeScripts(contentEl);

            // 更新页面标题
            updatePageTitle();
        } else {
            // 没有 content.html，显示子模块卡片
            await renderSubModules(filePath);
        }
    } catch (e) {
        console.error('加载内容失败:', e);
        contentEl.innerHTML = '<div class="error">加载失败</div>';
    }

    // 重新初始化图标（如 Lucide）
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}
```

### 脚本执行函数

动态插入的 `<script>` 标签不会自动执行，需要手动处理：

```javascript
/**
 * 执行动态加载的 HTML 中的脚本
 */
function executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');

        // 复制属性
        Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
        });

        // 复制内容
        newScript.textContent = oldScript.textContent;

        // 替换脚本（触发执行）
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}
```

### SPA 导航函数

```javascript
/**
 * SPA 导航到指定路径
 * 只更新 D 区域，ABC 区域保持不变
 */
async function navigateTo(url, pushState = true) {
    // 只处理管理后台路径
    if (!url.startsWith('/admin')) {
        window.location.href = url;
        return;
    }

    const path = url.split('?')[0];

    // 相同路径不处理
    if (path === currentPath) return;

    // 更新当前路径
    currentPath = path;

    // 更新浏览器 URL（不刷新页面）
    if (pushState) {
        history.pushState({ path }, '', url);
    }

    // 更新 C 区面包屑
    updateBreadcrumb();

    // 更新 B 区菜单高亮
    updateMenuHighlight();

    // 加载 D 区域内容
    await loadContent();
}
```

### 链接拦截

```javascript
/**
 * 拦截链接点击，实现 SPA 导航
 */
function setupLinkInterception() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // 只拦截管理后台路径
        if (href.startsWith('/admin')) {
            e.preventDefault();
            navigateTo(href);
        }
    });
}
```

### 浏览器前进/后退支持

```javascript
/**
 * 监听浏览器后退/前进按钮
 */
function setupPopState() {
    window.addEventListener('popstate', (e) => {
        const path = e.state?.path || window.location.pathname;
        if (path.startsWith('/admin')) {
            navigateTo(path, false); // 不再 pushState
        }
    });
}
```

### 初始化

```javascript
/**
 * 初始化 SPA
 */
async function initLayout() {
    // 加载菜单
    const menuData = await fetchMenuTree();
    if (menuData) {
        renderSidebar(menuData);
        window._menuData = menuData;
    }

    // 生成面包屑
    updateBreadcrumb();

    // 加载 D 区域内容
    await loadContent();

    // 设置 SPA 路由
    setupLinkInterception();
    setupPopState();

    // 保存初始状态
    history.replaceState({ path: currentPath }, '', window.location.href);
}

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', initLayout);
```

---

## 🌐 Nginx 配置

SPA 需要将所有路径都返回主框架 `index.html`：

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;

    # 管理后台 SPA 路由
    location /admin {
        # 如果请求的是静态文件，直接返回
        try_files $uri $uri/ /admin/index.html;
    }

    # 或者更精确的配置
    location ~ ^/admin(?!/.*\.(css|js|png|jpg|svg|html|php)).*$ {
        rewrite ^/admin.*$ /admin/index.html last;
    }
}
```

### 关键点

1. **静态资源直接返回**：CSS、JS、图片等文件正常访问
2. **路由路径返回主框架**：`/admin/users`、`/admin/settings` 等都返回 `index.html`
3. **content.html 可直接访问**：用于 AJAX 加载

---

## 🎨 布局样式 (layout.css)

```css
/* 基础布局 */
.admin-layout {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* A区：顶部栏 */
.area-a {
    height: 56px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background: #1a1a2e;
    color: #fff;
}

/* 主体区域 */
.area-main {
    flex: 1;
    display: flex;
    overflow: hidden;
}

/* B区：侧边栏 */
.area-b {
    width: 240px;
    flex-shrink: 0;
    background: #16213e;
    overflow-y: auto;
    transition: width 0.3s;
}

.area-b.collapsed {
    width: 60px;
}

/* CD区域容器 */
.area-cd {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* C区：页面头部 */
.area-c {
    height: 48px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background: #0f0f23;
    border-bottom: 1px solid #333;
}

/* D区：主内容区 */
.area-d {
    flex: 1;
    overflow: auto;
    padding: 16px;
    background: #0a0a1a;
}

/* 加载状态 */
.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #666;
}
```

---

## 📋 菜单渲染

### 递归渲染多层级菜单

```javascript
/**
 * 渲染侧边栏菜单
 */
function renderSidebar(menuData) {
    const container = document.getElementById('sidebarMenu');
    if (!container || !menuData?.menu) return;

    // 构建树形结构
    const tree = buildMenuTree(menuData.menu);

    // 清空并渲染
    container.innerHTML = '';
    tree.forEach(item => {
        const node = createMenuNode(item, 1);
        container.appendChild(node);
    });

    // 展开当前路由的父级
    expandParentMenus();
}

/**
 * 创建菜单节点（递归）
 */
function createMenuNode(item, level) {
    const node = document.createElement('div');
    node.className = 'menu-node';
    node.dataset.level = level;
    node.dataset.key = item.path;

    // 菜单项内容
    const content = document.createElement('div');
    content.className = 'menu-item-content';
    content.style.paddingLeft = `${(level - 1) * 16 + 12}px`;

    // 图标 + 文字
    content.innerHTML = `
        <i data-lucide="${item.icon || 'folder'}"></i>
        <span class="menu-text">${item.shortName || item.folderName}</span>
        ${item.children?.length ? '<i data-lucide="chevron-right" class="expand-icon"></i>' : ''}
    `;

    // 高亮当前页
    if (item.url === currentPath) {
        content.classList.add('active');
    }

    // 点击事件
    content.addEventListener('click', (e) => {
        e.preventDefault();
        if (item.children?.length) {
            toggleMenuExpand(node);
        } else if (item.url) {
            navigateTo(item.url);
        }
    });

    node.appendChild(content);

    // 递归渲染子菜单
    if (item.children?.length) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'menu-children';

        item.children.forEach(child => {
            childrenContainer.appendChild(createMenuNode(child, level + 1));
        });

        node.appendChild(childrenContainer);
    }

    return node;
}
```

---

## ⚠️ 常见问题与解决方案

### 1. 内容加载后不显示

**原因**：CSS 规则 `.panel { display: none }` 需要 `.active` 类

**解决**：在 `content.html` 中添加 `active` 类

```html
<div class="panel active">...</div>
```

### 2. JS 变量重复声明错误

**原因**：SPA 模式下 JS 文件可能被多次加载

**解决**：使用 `var` 或检查是否已定义

```javascript
var CONFIG = CONFIG || { api: '/api' };
```

### 3. 图标不显示

**原因**：动态加载的内容中的图标未初始化

**解决**：内容加载后重新初始化图标库

```javascript
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}
```

### 4. 脚本不执行

**原因**：innerHTML 插入的 `<script>` 不会自动执行

**解决**：使用 `executeScripts()` 函数手动执行

### 5. 浏览器后退不生效

**原因**：未监听 `popstate` 事件

**解决**：添加 `setupPopState()` 监听

### 6. Cloudflare Rocket Loader 干扰脚本执行

**原因**：Cloudflare 的 Rocket Loader 会拦截并延迟执行 `<head>` 中的脚本

**解决**：将动态脚本添加到 `document.body` 而非 `document.head`

```javascript
function executeScripts(container) {
    const scripts = Array.from(container.querySelectorAll('script'));

    // 分离外部脚本和内联脚本
    const externalScripts = scripts.filter(s => s.src);
    const inlineScripts = scripts.filter(s => !s.src);

    // 移除原始脚本标签
    scripts.forEach(s => s.remove());

    // 加载外部脚本（按顺序）
    let loadPromise = Promise.resolve();

    externalScripts.forEach(oldScript => {
        loadPromise = loadPromise.then(() => {
            return new Promise((resolve) => {
                const newScript = document.createElement('script');
                newScript.src = oldScript.src;
                newScript.onload = resolve;
                newScript.onerror = () => {
                    console.error('脚本加载失败:', oldScript.src);
                    resolve(); // 继续执行，不阻塞
                };
                // 🔑 使用 body 而非 head，避免 Cloudflare Rocket Loader 干扰
                document.body.appendChild(newScript);
            });
        });
    });

    // 外部脚本加载完成后执行内联脚本
    loadPromise.then(() => {
        inlineScripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            newScript.textContent = oldScript.textContent;
            document.body.appendChild(newScript);
        });
    });
}
```

### 7. CDN 缓存导致 JS 更新不生效

**原因**：Cloudflare 等 CDN 会缓存静态资源

**解决**：在 `content.html` 中给 JS/CSS 文件添加版本号

```html
<!-- ❌ 错误：可能被缓存 -->
<script src="/admin/users.js"></script>

<!-- ✅ 正确：添加版本号强制刷新 -->
<script src="/admin/users.js?v=2"></script>
```

**最佳实践**：每次修改 JS/CSS 文件后，更新版本号

---

## 🔗 与框架版本的对比

| 特性 | Vanilla JS | Vue/React |
|------|-----------|-----------|
| 路由 | History API + 手动实现 | vue-router / react-router |
| 状态管理 | 全局变量 / localStorage | Pinia / Redux |
| 组件复用 | HTML 片段 + JS 函数 | 组件系统 |
| 构建工具 | 无需 | webpack / vite |
| 学习成本 | 低 | 中-高 |
| 维护成本 | 中 | 低 |
| 适用规模 | 小-中型项目 | 中-大型项目 |

---

## 📝 检查清单

实现 Vanilla JS SPA 时，确保：

- [ ] 主框架 `index.html` 包含 ABCD 四区域结构
- [ ] 每个模块有 `content.html` 作为 D 区域内容
- [ ] `content.html` 中的 `.panel` 添加了 `active` 类
- [ ] JS 变量使用 `var` 避免重复声明错误
- [ ] 实现了 `executeScripts()` 函数执行动态脚本
- [ ] 实现了链接拦截和 `popstate` 监听
- [ ] Nginx 配置了 SPA 路由规则
- [ ] 内容加载后重新初始化图标库

---

**最后更新**：2025-12-31
