# database-table-05.form-dialog.md - 表单对话框规范

> **版本**: 1.0.0
> **创建时间**: 2025-12-31

---

## 1. 表单对话框布局

编辑弹窗采用双列布局：

```
┌─────────────────────────────────────────────────────────┐
│  编辑记录                                          [×]  │
├──────────────┬──────────────────────────────────────────┤
│  数据表       │  字段编辑                    2个表/15字段 │
│  ┌──────────┐│  ┌────────────────────────────────────┐ │
│  │☑ 用户表  ││  │ 用户表（主表）                      │ │
│  │   主表   ││  │ ─────────────────────────────────  │ │
│  │  8 字段  ││  │ ❓ 名称    [________________]      │ │
│  └──────────┘│  │ ❓ 邮箱    [________________]      │ │
│  ┌──────────┐│  │ ❓ 手机    [________________]      │ │
│  │☑ 用户档案││  │                                    │ │
│  │  扩展表1 ││  │ 用户档案（扩展表1）                 │ │
│  │  7 字段  ││  │ ─────────────────────────────────  │ │
│  └──────────┘│  │ ❓ 昵称    [________________]      │ │
│              │  │ ❓ 头像    [________________]      │ │
│              │  └────────────────────────────────────┘ │
├──────────────┴──────────────────────────────────────────┤
│                              [取消]  [保存]             │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 字段标签与问号提示

每个表单字段标签包含：
- **问号图标（❓）** - 点击/悬停显示 Tooltip
- **中文名称** - 从字段注释第3段获取

**Tooltip 显示内容（四行）**：

```
┌─────────────────────────────┐
│ 📋 表                        │
│ fang_users_base_list        │  ← 数据库表英文名
│ 用户基础信息表|存储用户核心数据│  ← 表注释
│ ─────────────────────────── │
│ 📝 字段                      │
│ base_profile_nickname       │  ← 字段英文名
│ 1|基础|昵称|用户显示名称|1   │  ← 字段完整注释
└─────────────────────────────┘
```

---

## 3. DbFieldTooltip 组件

独立的问号提示组件，统一用于：
- 表单对话框字段标签
- 列设置对话框
- 列宽设置对话框
- 其他需要显示字段帮助信息的地方

```typescript
interface DbFieldTooltipProps {
  /** 数据库表英文名 */
  dbTableName: string;
  /** 表注释 */
  tableComment: string;
  /** 数据库字段英文名 */
  dbFieldName: string;
  /** 字段完整注释 */
  fieldComment: string;
  /** 扩展表颜色（可选，用于区分主表/扩展表） */
  extColor?: string;
}
```

**使用示例**：

```vue
<template #label>
  <div class="field-label">
    <db-field-tooltip
      :db-table-name="tableName"
      :table-comment="tableComment"
      :db-field-name="field.field"
      :field-comment="field.fullComment"
    />
    <span class="label-name">{{ field.label }}</span>
  </div>
</template>
```

---

## 4. 字段信息自动获取

表单字段配置从数据库字段注释自动解析：

```typescript
interface FormFieldConfig {
  /** 字段英文名（数据库字段名） */
  field: string;
  /** 字段中文名（注释第3段） */
  label: string;
  /** 完整注释（用于 Tooltip 显示） */
  fullComment: string;
  /** 表单组件类型 */
  component: string;
  /** 组件 Props */
  props?: Record<string, any>;
  /** 是否必填（根据 nullable 判断） */
  required: boolean;
  /** 帮助文本（注释第4段） */
  help?: string;
}
```

**解析流程**：

```
数据库字段注释: "1|基础|昵称|用户的显示名称|1"
        ↓ 解析
FormFieldConfig: {
  field: "base_profile_nickname",
  label: "昵称",           // 第3段
  fullComment: "1|基础|昵称|用户的显示名称|1",  // 完整注释
  help: "用户的显示名称",   // 第4段
  required: true,          // 根据 NOT NULL 判断
  component: "TInput",     // 根据字段类型映射
}
```

---

## 5. 字段类型映射

根据数据库字段类型自动选择表单组件：

| 数据库类型 | 表单组件 |
|-----------|---------|
| varchar, char | TInput |
| text, longtext | TTextarea |
| int, bigint | TInputNumber |
| decimal, float | TInputNumber |
| tinyint(1), boolean | TSwitch |
| date | TDatePicker |
| datetime, timestamp | TDateTimePicker |
| time | TTimePicker |
| enum | TSelect |
| json | TTextarea (JSON 模式) |

---

## 6. 表单验证

根据字段属性自动生成验证规则：

```typescript
const generateFormRules = (columns: ColumnInfo[]) => {
  const rules: Record<string, any[]> = {};

  for (const col of columns) {
    const fieldRules = [];

    // 必填验证
    if (!col.nullable && !col.autoIncrement) {
      fieldRules.push({
        required: true,
        message: `${col.extra.displayName}不能为空`,
      });
    }

    // 长度验证
    if (col.length && col.type.includes('varchar')) {
      fieldRules.push({
        max: col.length,
        message: `${col.extra.displayName}最多${col.length}个字符`,
      });
    }

    if (fieldRules.length > 0) {
      rules[col.name] = fieldRules;
    }
  }

  return rules;
};
```

---

## 7. 变更预览功能

编辑模式下，保存前显示变更预览对话框：

```
┌─────────────────────────────────────────────────┐
│  确认变更                                  [×]  │
├─────────────────────────────────────────────────┤
│  共检测到 3 处变更：                             │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ [用户表] 名称                            │   │
│  │ "张三" → "张三（已修改）"                 │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ [用户表] 邮箱                            │   │
│  │ "old@test.com" → "new@test.com"         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ [用户档案] 昵称                          │   │
│  │ "小张" → "大张"                          │   │
│  └─────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│                        [取消]  [确认保存]        │
└─────────────────────────────────────────────────┘
```

**变更检测逻辑**：

```typescript
interface ChangeItem {
  /** 表显示名称 */
  tableLabel: string;
  /** 字段显示名称 */
  fieldLabel: string;
  /** 字段英文名 */
  fieldName: string;
  /** 原始值 */
  oldValue: any;
  /** 新值 */
  newValue: any;
}

// 检测变更
const detectChanges = (): ChangeItem[] => {
  const changes: ChangeItem[] = [];

  // 检测主表变更
  if (mainTableEnabled.value && originalMainData.value) {
    for (const field of allMainFormFields.value) {
      const oldVal = originalMainData.value[field.field];
      const newVal = mainFormData.value[field.field];
      if (!isEqual(oldVal, newVal)) {
        changes.push({
          tableLabel: mainTableShortLabel.value,
          fieldLabel: field.label,
          fieldName: field.field,
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    }
  }

  // 检测扩展表变更
  for (const ext of extensionTablesList.value) {
    if (!ext.enabled) continue;
    const originalExt = originalExtensionData.value[ext.name];
    const currentExt = extensionFormData.value[ext.name];
    if (!originalExt || !currentExt) continue;

    for (const field of ext.fields) {
      const oldVal = originalExt[field.field];
      const newVal = currentExt[field.field];
      if (!isEqual(oldVal, newVal)) {
        changes.push({
          tableLabel: ext.label,
          fieldLabel: field.label,
          fieldName: field.field,
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    }
  }

  return changes;
};

// 提交时先显示预览
const handleSubmit = () => {
  const detectedChanges = detectChanges();
  if (detectedChanges.length === 0) {
    MessagePlugin.info('没有检测到任何变更');
    return;
  }
  changes.value = detectedChanges;
  previewVisible.value = true;
};
```

**值格式化显示**：

```typescript
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '(空)';
  if (value === '') return '(空字符串)';
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (typeof value === 'object') return JSON.stringify(value);
  const str = String(value);
  return str.length > 50 ? str.slice(0, 50) + '...' : str;
};
```

---

**最后更新**: 2025-12-31 | **维护者**: ZERO 框架团队
