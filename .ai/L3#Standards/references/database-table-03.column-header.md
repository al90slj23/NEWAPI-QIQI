# database-table-03.column-header.md - 表格列头规范

> **版本**: 1.0.0
> **创建时间**: 2025-12-31

---

## 1. 列头结构

每个表格列头包含三个元素：

```
┌─────────────────────────────────────┐
│  ❓  名称  ↕                         │
│  │    │    └── 排序按钮（可选）       │
│  │    └────── 中文名称（注释第3段）   │
│  └─────────── 问号图标（Tooltip）    │
└─────────────────────────────────────┘
```

---

## 2. 列头中文名动态获取

列头中文名从数据库字段注释的**第3段**自动获取：

```
字段注释: "1|基础|昵称|用户的显示名称|1"
                  ↑
              第3段 = 列头显示名
```

**解析代码示例**：

```typescript
const parseColumnComment = (comment: string) => {
  if (!comment) return { displayName: '', helpText: '', displayOrder: 999 };

  // 兼容全角竖线
  const normalized = comment.replace(/｜/g, '|');
  const parts = normalized.split('|');

  return {
    displayOrder: parseInt(parts[0]) || 999,  // 第1段：排序
    category: parts[1] || '',                  // 第2段：分类
    displayName: parts[2] || '',               // 第3段：中文名 → 列头显示
    helpText: parts[3] || '',                  // 第4段：说明
    defaultVisible: parts[4] !== '0',          // 第5段：是否显示
  };
};
```

---

## 3. 列头问号 Tooltip

悬停问号图标显示字段详细信息（两行）：

```
┌─────────────────────────────┐
│ base_profile_nickname       │  ← 第1行：字段英文名
│ 1|基础|昵称|用户的显示名称|1 │  ← 第2行：完整注释
└─────────────────────────────┘
```

**渲染代码示例**：

```typescript
import { h } from 'vue';
import { Tooltip as TTooltip } from 'tdesign-vue-next';
import { HelpCircleIcon } from 'tdesign-icons-vue-next';

const renderColumnTitle = (
  displayName: string,    // 中文名（注释第3段）
  fieldName: string,      // 字段英文名
  fullComment: string     // 完整注释
) => {
  return () => h('div', { class: 'column-header' }, [
    // 问号图标 + Tooltip
    h(TTooltip, {
      placement: 'top',
      content: () => h('div', { class: 'column-tooltip' }, [
        h('div', { class: 'field-name' }, fieldName),
        h('div', { class: 'field-comment' }, fullComment),
      ])
    }, {
      default: () => h(HelpCircleIcon, { class: 'help-icon' })
    }),
    // 中文名称
    h('span', { class: 'display-name' }, displayName),
  ]);
};
```

---

## 4. 列头样式

```scss
.column-header {
  display: flex;
  align-items: center;
  gap: 6px;

  .help-icon {
    font-size: 14px;
    color: var(--td-text-color-placeholder);
    cursor: help;
    flex-shrink: 0;

    &:hover {
      color: var(--td-brand-color);
    }
  }

  .display-name {
    font-size: 13px;
    font-weight: 500;
  }
}

// Tooltip 内容样式
.column-tooltip {
  .field-name {
    font-weight: 500;
    color: #fff;
    font-family: 'Monaco', 'Courier New', monospace;
  }

  .field-comment {
    color: rgba(255, 255, 255, 0.85);
    font-size: 12px;
    margin-top: 4px;
  }
}
```

---

## 5. 扩展表列头

扩展表列使用不同颜色区分，Tooltip 显示四行信息：

```
┌─────────────────────────────┐
│ 📋 表                        │
│ fang_users_profile_list     │  ← 扩展表英文名
│ 用户档案表|存储用户详细信息   │  ← 扩展表注释
│ ─────────────────────────── │
│ 📝 字段                      │
│ profile_info_avatar         │  ← 字段英文名
│ 1|档案|头像|用户头像URL|1    │  ← 字段完整注释
└─────────────────────────────┘
```

**扩展表颜色循环**：

```typescript
const EXTENSION_TABLE_COLORS = [
  '#e34d59', // 赤
  '#ed7b2f', // 橙
  '#ebb105', // 黄
  '#2ba471', // 绿
  '#0594fa', // 青
  '#0052d9', // 蓝
  '#8b5cf6', // 紫
];

// 根据扩展表索引获取颜色
const getExtensionColor = (index: number) => {
  return EXTENSION_TABLE_COLORS[index % EXTENSION_TABLE_COLORS.length];
};
```

---

## 6. 列宽自动计算

根据中文名长度自动计算列宽：

```typescript
const calculateColumnWidth = (displayName: string) => {
  let textWidth = 0;
  for (const char of displayName) {
    // 中文字符 14px，英文字符 7px
    textWidth += /[\u4e00-\u9fa5]/.test(char) ? 14 : 7;
  }
  // 加上问号图标和排序按钮的宽度（约 82px）
  // 最小宽度 100px
  return Math.max(textWidth + 82, 100);
};
```

---

## 7. 列宽拖动调整

支持拖动列边框实时调整列宽：

```typescript
// TDesign 表格配置
<t-table
  :resizable="true"
  @column-resize-change="handleColumnResize"
/>

// 处理列宽调整
const handleColumnResize = (context: { columnsWidth: Record<string, number> }) => {
  Object.entries(context.columnsWidth).forEach(([colKey, width]) => {
    // 保存到 localStorage 或后端
    saveColumnWidth(colKey, width);
  });
};
```

---

## 8. 列拖动排序

支持拖动列头调整列顺序：

```typescript
// TDesign 表格配置
<t-table
  :drag-sort="'col'"
  @drag-sort="handleDragSort"
/>

// 处理列拖动排序
const handleDragSort = (params: {
  currentIndex: number;
  targetIndex: number;
  current: any;
  target: any;
}) => {
  // 更新列顺序到后端
  const columnOrders = sortableColumns.map((col, index) => ({
    column: col.colKey,
    order: index + 1,
  }));
  saveColumnOrder(columnOrders);
};
```

---

**最后更新**: 2025-12-31 | **维护者**: ZERO 框架团队
