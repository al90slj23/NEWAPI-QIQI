# database-table-04.table-interaction.md - 表格主体交互规范

> **版本**: 1.0.0
> **创建时间**: 2025-12-31

---

## 1. 表格样式配置

```typescript
<t-table
  :data="data"
  :columns="columns"
  :table-layout="'fixed'"    // 固定布局
  :stripe="true"             // 斑马纹（隔行变色）
  :hover="true"              // 悬停高亮
  :bordered="true"           // 显示边框
  :resizable="true"          // 列宽可调整
  :drag-sort="'col'"         // 列可拖动排序
  row-key="id"
/>
```

---

## 2. 表头固定

滚动时表头固定在顶部：

```typescript
// 设置表格高度，启用表头固定
<t-table
  :height="tableHeight"      // 明确的高度值
/>

// 动态计算表格高度
const calculateTableHeight = () => {
  if (tableContentRef.value) {
    const rect = tableContentRef.value.getBoundingClientRect();
    tableHeight.value = rect.height > 0 ? rect.height : undefined;
  }
};

// 使用 ResizeObserver 监听容器大小变化
onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    calculateTableHeight();
  });
  resizeObserver.observe(tableContentRef.value);
});
```

---

## 3. 固定列

左侧/右侧固定列，滚动时不移动：

```typescript
// 列配置中设置 fixed
const columns = [
  { colKey: 'id', title: 'ID', fixed: 'left', width: 80 },
  // ... 其他列
  { colKey: 'actions', title: '操作', fixed: 'right', width: 150 },
];
```

**固定列样式**：

```scss
:deep(.t-table) {
  // 固定列背景色（确保不透明）
  .t-table__cell--fixed-left,
  .t-table__cell--fixed-right {
    background: var(--td-bg-color-container) !important;
  }

  // 斑马纹行的固定列背景色
  .t-table__row--striped {
    .t-table__cell--fixed-left,
    .t-table__cell--fixed-right {
      background: var(--td-bg-color-secondarycontainer) !important;
    }
  }

  // 表头固定列需要更高的 z-index
  .t-table__header th.t-table__cell--fixed-left,
  .t-table__header th.t-table__cell--fixed-right {
    z-index: 3;
  }
}
```

---

## 4. 鼠标中键拖拽滚动

按住鼠标中键拖拽，实现抹布拖动效果：

```typescript
// 状态
const isDragging = ref(false);
let startX = 0, startY = 0;
let scrollLeft = 0, scrollTop = 0;
let scrollContainer: HTMLElement | null = null;

// 获取滚动容器
const getScrollContainer = (): HTMLElement | null => {
  return tableContentRef.value?.querySelector('.t-table__content');
};

// 开始拖拽（鼠标中键按下）
const startDrag = (e: MouseEvent) => {
  scrollContainer = getScrollContainer();
  if (!scrollContainer) return;

  isDragging.value = true;
  startX = e.clientX;
  startY = e.clientY;
  scrollLeft = scrollContainer.scrollLeft;
  scrollTop = scrollContainer.scrollTop;

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

// 拖拽中（反向滚动，模拟抹布效果）
const onDrag = (e: MouseEvent) => {
  if (!isDragging.value || !scrollContainer) return;
  e.preventDefault();

  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;
  scrollContainer.scrollLeft = scrollLeft - deltaX;
  scrollContainer.scrollTop = scrollTop - deltaY;
};

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};
```

**拖拽时的光标样式**：

```scss
.database-table-content {
  &.is-dragging {
    cursor: grabbing;
    user-select: none;

    :deep(*) {
      cursor: grabbing !important;
      user-select: none !important;
    }
  }
}
```

---

## 5. 吸附表头

在表单对话框和列设置对话框中，滚动时显示当前所在表的名称：

```typescript
interface StickyTableInfo {
  label: string;      // 表显示名称
  color?: string;     // 扩展表颜色
  isMain: boolean;    // 是否主表
  index?: number;     // 扩展表索引
}

const currentStickyTable = ref<StickyTableInfo | null>(null);
const showStickyHeader = ref(false);

// 监听滚动，更新吸附表头
const handleFormScroll = (e: Event) => {
  const container = e.target as HTMLElement;
  const scrollTop = container.scrollTop;

  // 遍历所有表区块，找到当前可见的
  const sections = container.querySelectorAll('.table-section');
  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (rect.top <= containerRect.top + 50 && rect.bottom > containerRect.top) {
      // 更新吸附表头信息
      currentStickyTable.value = {
        label: section.dataset.tableLabel,
        isMain: section.dataset.tableType === 'main',
        // ...
      };
      showStickyHeader.value = true;
      return;
    }
  }

  showStickyHeader.value = false;
};
```

**吸附表头样式**：

```vue
<div v-if="showStickyHeader && currentStickyTable" class="sticky-table-header">
  <t-icon :name="currentStickyTable.isMain ? 'root-list' : 'fork'" />
  <span>{{ currentStickyTable.label }}</span>
  <span class="sticky-hint" :style="{ color: currentStickyTable.color }">
    {{ currentStickyTable.isMain ? '主表' : `扩展表 ${currentStickyTable.index}` }}
  </span>
</div>
```

---

## 6. 性能优化

### 6.1 数据缓存

- 表结构缓存到 localStorage（带版本号）
- 列设置缓存到 localStorage
- 数据不缓存（实时获取）

```typescript
// 缓存键格式
const STRUCTURE_CACHE_KEY = `db_table_structure_${tableName}`;
const COLUMN_CONFIG_CACHE_KEY = `db_table_columns_${tableName}`;
```

### 6.2 防抖处理

- 搜索输入防抖（300ms）
- 列宽调整防抖（100ms）
- 列拖拽排序防抖（200ms）

### 6.3 虚拟滚动

数据量 > 1000 条时建议启用虚拟滚动：

```vue
<DatabaseTable
  table="large_table"
  :enable-virtual-scroll="true"
/>
```

---

**最后更新**: 2025-12-31 | **维护者**: ZERO 框架团队
