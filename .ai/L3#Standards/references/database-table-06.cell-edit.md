# database-table-06.cell-edit.md - 单元格交互规范（ZERO 新增）

> **版本**: 1.0.0
> **创建时间**: 2025-12-31

---

## 1. 交互模式

ZERO 框架的通用表格组件默认支持单元格级别的交互：

| 操作 | 行为 |
|------|------|
| 单击单元格 | 选中该单元格（高亮显示） |
| 双击单元格 | 进入行内编辑模式 |
| Enter / Tab | 确认编辑，移动到下一个单元格 |
| Esc | 取消编辑，恢复原值 |

---

## 2. 单元格选中状态

```
┌──────────────────────────────────────────────────────┐
│  ID  │  名称   │  邮箱              │  状态  │  操作  │
├──────┼─────────┼────────────────────┼────────┼────────┤
│  1   │  张三   │ ┌────────────────┐ │  正常  │  ...   │
│      │         │ │ zhang@test.com │ │        │        │
│      │         │ └────────────────┘ │        │        │  ← 选中状态（蓝色边框）
├──────┼─────────┼────────────────────┼────────┼────────┤
│  2   │  李四   │  li@test.com       │  正常  │  ...   │
└──────────────────────────────────────────────────────┘
```

---

## 3. 双击编辑模式

双击单元格后，该单元格变为可编辑状态：

```
┌──────────────────────────────────────────────────────┐
│  ID  │  名称   │  邮箱              │  状态  │  操作  │
├──────┼─────────┼────────────────────┼────────┼────────┤
│  1   │  张三   │ ┌────────────────┐ │  正常  │  ...   │
│      │         │ │ zhang@test.com │ │        │        │
│      │         │ │ [光标闪烁]     │ │        │        │  ← 编辑状态（输入框）
│      │         │ └────────────────┘ │        │        │
├──────┼─────────┼────────────────────┼────────┼────────┤
│  2   │  李四   │  li@test.com       │  正常  │  ...   │
└──────────────────────────────────────────────────────┘
```

---

## 4. 实现要点

```typescript
interface CellEditState {
  /** 当前编辑的行索引 */
  rowIndex: number | null;
  /** 当前编辑的列键 */
  colKey: string | null;
  /** 编辑前的原始值 */
  originalValue: any;
  /** 当前编辑值 */
  currentValue: any;
}

// 单元格点击处理
const handleCellClick = (row: any, col: any, rowIndex: number) => {
  selectedCell.value = { rowIndex, colKey: col.colKey };
};

// 单元格双击处理
const handleCellDblClick = (row: any, col: any, rowIndex: number) => {
  // 系统字段不可编辑
  if (['id', 'created_at', 'updated_at', 'deleted_at'].includes(col.colKey)) {
    return;
  }

  editState.value = {
    rowIndex,
    colKey: col.colKey,
    originalValue: row[col.colKey],
    currentValue: row[col.colKey],
  };
};

// 确认编辑
const handleCellEditConfirm = async () => {
  if (!editState.value) return;

  const { rowIndex, colKey, originalValue, currentValue } = editState.value;

  // 值未变化，直接退出
  if (originalValue === currentValue) {
    editState.value = null;
    return;
  }

  // 调用更新 API
  await updateRecord(tableData.value[rowIndex].id, {
    [colKey]: currentValue,
  });

  // 更新本地数据
  tableData.value[rowIndex][colKey] = currentValue;
  editState.value = null;
};

// 取消编辑
const handleCellEditCancel = () => {
  editState.value = null;
};
```

---

## 5. 键盘快捷键

| 快捷键 | 行为 |
|--------|------|
| Enter | 确认当前编辑，移动到下一行同列 |
| Tab | 确认当前编辑，移动到同行下一列 |
| Shift + Tab | 确认当前编辑，移动到同行上一列 |
| Esc | 取消编辑，恢复原值 |
| 方向键 | 在选中状态下移动选中单元格 |

---

## 6. 不可编辑字段

以下字段禁止双击编辑：
- `id` - 主键
- `created_at` - 创建时间
- `updated_at` - 更新时间
- `deleted_at` - 删除时间
- 外键字段（扩展表的关联字段）

---

**最后更新**: 2025-12-31 | **维护者**: ZERO 框架团队
