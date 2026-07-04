# database-table-08.history.md - 操作历史功能

> **版本**: 1.0.0
> **创建时间**: 2025-12-31

---

## 1. 功能说明

- 记录所有 CRUD 操作
- 支持查看历史记录
- 支持回滚到历史状态（列设置）
- 双 Tab 切换（浏览器缓存 / Redis 缓存）
- 展开详情查看完整数据
- 删除单条历史记录

---

## 2. 历史对话框布局

```
┌─────────────────────────────────────────────────────────────────────┐
│  操作历史                                                      [×]  │
├─────────────────────────────────────────────────────────────────────┤
│  操作历史仅存在于浏览器和 Redis 缓存中，定期会自动清理              │
├─────────────────────────────────────────────────────────────────────┤
│  [浏览器缓存]  [Redis 缓存]                                         │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ▶ [列设置] 2025-12-31 10:30:25                              │   │
│  │   修改了 5 个字段的显示设置                    [回滚] [删除] │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ▼ [编辑] 2025-12-31 10:25:10                                │   │
│  │   编辑记录 ID=123                                    [删除] │   │
│  │   ┌─────────────────────────────────────────────────────┐   │   │
│  │   │ 序号 │ 字段名  │ 中文名 │ 显示 │                    │   │   │
│  │   │ 1    │ name    │ 名称   │ 是   │                    │   │   │
│  │   │ 2    │ email   │ 邮箱   │ 是   │                    │   │   │
│  │   └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ▶ [新增] 2025-12-31 10:20:00                                │   │
│  │   新增记录 ID=124                                    [删除] │   │
│  └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                                                          [关闭]     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. 历史记录类型

```typescript
type OperationType =
  | 'create'           // 新增
  | 'update'           // 编辑
  | 'delete'           // 删除
  | 'batch_delete'     // 批量删除
  | 'export'           // 导出
  | 'column_settings'; // 列设置

interface OperationHistory {
  /** 唯一标识 */
  id: string;
  /** 操作类型 */
  type: OperationType;
  /** 操作摘要 */
  summary: string;
  /** 详细数据（可选） */
  data?: any;
  /** 操作时间戳 */
  timestamp: string;
}
```

---

## 4. 操作类型标签

| 类型 | 标签 | 主题色 |
|------|------|--------|
| create | 新增 | success |
| update | 编辑 | primary |
| delete | 删除 | danger |
| batch_delete | 批量删除 | danger |
| export | 导出 | warning |
| column_settings | 列设置 | default |

```typescript
const getTypeLabel = (type: OperationType): string => {
  const labels: Record<OperationType, string> = {
    create: '新增',
    update: '编辑',
    delete: '删除',
    batch_delete: '批量删除',
    export: '导出',
    column_settings: '列设置',
  };
  return labels[type] || type;
};

const getTypeTheme = (type: OperationType): string => {
  const themes: Record<OperationType, string> = {
    create: 'success',
    update: 'primary',
    delete: 'danger',
    batch_delete: 'danger',
    export: 'warning',
    column_settings: 'default',
  };
  return themes[type] || 'default';
};
```

---

## 5. 双 Tab 切换

| Tab | 说明 | 存储位置 |
|-----|------|---------|
| 浏览器缓存 | 本地存储，仅当前浏览器可见 | localStorage |
| Redis 缓存 | 服务端存储，跨设备可见 | Redis |

```typescript
const activeTab = ref<'local' | 'cloud'>('local');
const localHistory = ref<OperationHistory[]>([]);
const cloudHistory = ref<OperationHistory[]>([]);
const cloudLoading = ref(false);

// 切换 Tab 时加载数据
watch(activeTab, async (tab) => {
  if (tab === 'cloud' && cloudHistory.value.length === 0) {
    cloudLoading.value = true;
    try {
      const res = await api.get('/api/v1/admin/DatabaseTable.HistoryDialog:history', {
        params: { table: props.tableName }
      });
      cloudHistory.value = res.data.data || [];
    } finally {
      cloudLoading.value = false;
    }
  }
});
```

---

## 6. 展开详情功能

点击历史记录可展开查看详细数据：

```typescript
const expandedId = ref<string | null>(null);

const toggleExpand = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id;
};
```

**列设置详情表格**：

```vue
<template v-if="record.type === 'column_settings' && record.data?.columns">
  <table class="detail-table">
    <thead>
      <tr>
        <th>序号</th>
        <th>字段名</th>
        <th>中文名</th>
        <th>显示</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(col, idx) in record.data.columns" :key="col.name">
        <td>{{ idx + 1 }}</td>
        <td>{{ col.name }}</td>
        <td>{{ col.label || '-' }}</td>
        <td>{{ col.defaultVisible ? '是' : '否' }}</td>
      </tr>
    </tbody>
  </table>
</template>
```

**其他类型详情（JSON 格式）**：

```vue
<template v-else-if="record.data">
  <pre class="detail-json">{{ formatJson(record.data) }}</pre>
</template>

<script setup>
const formatJson = (data: any): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};
</script>
```

---

## 7. 回滚功能

仅列设置类型支持回滚：

```typescript
const rollingBackId = ref<string | null>(null);

const handleRollback = async (record: OperationHistory) => {
  if (record.type !== 'column_settings' || !record.data?.columns) {
    MessagePlugin.warning('该记录不支持回滚');
    return;
  }

  rollingBackId.value = record.id;
  try {
    // 触发回滚事件，由父组件处理
    emit('rollback', record.data.columns);
    MessagePlugin.success('回滚成功');
    visibleLocal.value = false;
  } finally {
    rollingBackId.value = null;
  }
};
```

---

## 8. 删除记录功能

支持删除单条历史记录：

```typescript
// 删除浏览器缓存记录
const handleDeleteLocal = (id: string) => {
  const index = localHistory.value.findIndex(r => r.id === id);
  if (index > -1) {
    localHistory.value.splice(index, 1);
    // 同步到 localStorage
    saveLocalHistory();
    MessagePlugin.success('已删除');
  }
};

// 删除 Redis 缓存记录
const handleDeleteCloud = async (id: string) => {
  try {
    await api.post('/api/v1/admin/DatabaseTable.HistoryDialog:deleteHistory', {
      table: props.tableName,
      id,
    });
    const index = cloudHistory.value.findIndex(r => r.id === id);
    if (index > -1) {
      cloudHistory.value.splice(index, 1);
    }
    MessagePlugin.success('已删除');
  } catch (error) {
    MessagePlugin.error('删除失败');
  }
};
```

---

## 9. 后端 API

**获取历史记录**：

```
GET /api/v1/admin/DatabaseTable.HistoryDialog:history?table=users
```

**响应**：

```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "type": "column_settings",
      "summary": "修改了 5 个字段的显示设置",
      "data": { "columns": [...] },
      "timestamp": "2025-12-31T10:30:25Z"
    }
  ]
}
```

**保存历史记录**：

```
POST /api/v1/admin/DatabaseTable.HistoryDialog:saveHistory
Content-Type: application/json

{
  "table": "users",
  "type": "column_settings",
  "summary": "修改了 5 个字段的显示设置",
  "data": { "columns": [...] }
}
```

**删除历史记录**：

```
POST /api/v1/admin/DatabaseTable.HistoryDialog:deleteHistory
Content-Type: application/json

{
  "table": "users",
  "id": "abc123"
}
```

---

## 10. 样式规范

```scss
.history-dialog-content {
  .history-hint {
    padding: 8px 12px;
    background: var(--td-bg-color-secondarycontainer);
    border-radius: 4px;
    font-size: 12px;
    color: var(--td-text-color-secondary);
    margin-bottom: 16px;
  }

  .history-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .history-item-wrapper {
    margin-bottom: 8px;
  }

  .history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: var(--td-bg-color-container);
    border: 1px solid var(--td-component-border);
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      border-color: var(--td-brand-color);
    }
  }

  .history-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;

    .expand-icon {
      color: var(--td-text-color-placeholder);
      transition: transform 0.2s;
    }
  }

  .history-detail {
    margin-top: 8px;
    padding: 12px;
    background: var(--td-bg-color-secondarycontainer);
    border-radius: 4px;

    .detail-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;

      th, td {
        padding: 6px 8px;
        border: 1px solid var(--td-component-border);
        text-align: left;
      }

      th {
        background: var(--td-bg-color-container);
        font-weight: 500;
      }
    }

    .detail-json {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 11px;
      white-space: pre-wrap;
      word-break: break-all;
      margin: 0;
    }
  }
}
```

---

**最后更新**: 2025-12-31 | **维护者**: ZERO 框架团队
