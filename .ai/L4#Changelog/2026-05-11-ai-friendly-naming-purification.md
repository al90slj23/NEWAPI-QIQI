# AI 友好命名纯化

> 日期：2026-05-11
> 类型：standard
> 主题：ai-friendly-naming-purification

## 背景

`04.quality-00.naming-philosophy.md` 已确立四条命名哲学，但其中"AI 友好 > 人类打字方便"在执行层面容易被误读为"建议"。AL Venom 项目在做 Classic Symbiote 的 `App.tsx` 拆分时重新确认：

- 命名长度不是成本。
- 结构清晰完整是默认。
- AI 代码生成与代码搜索 > 人类敲键便捷。

需要把这一点从"倾向"固化为"硬约束"，并同时写入 ZERO 和 AL Venom 两套 `.ai`。

## 决策

1. 在 ZERO `L3#Standards/standards/` 新增 `04.quality-02.ai-friendly-naming.md`，把哲学升格为零容忍硬约束：
   - 长名字是正确默认，鼓励 40-60 字符的完整命名。
   - 命名结构要素（主体 + 子能力 + 角色层 + 扩展名）不允许省略。
   - 平铺优先，结构靠命名而非目录。
   - 搜索友好是硬指标（领域、角色、跨项目三类搜索必须 1 秒内可用文件名完成）。
   - 抽象模糊词（`util`、`helper`、`manager`、`service`、`base`、`common`、`core`、`index`、`main`）禁止单独使用。
   - 缩写收敛到行业标准白名单。
   - 同一文件名内禁止混用 `-` 和 `.`。
2. 在 ZERO `L1#Overview/guide.md` 的命名哲学列表补两条（"长度不是成本"、"结构靠命名而非目录"），并引用新规范。
3. 在 ZERO `L1#Overview/guide.md` 的零容忍规则加入两条对应硬约束。
4. 在 ZERO `L2#Index/toc.md` 新增 "AI 友好命名" 小节，同时指向父规范与扩展规范。
5. AL Venom 侧同步：
   - 新增 `.ai/L3#Standards/03.frontend-07.file-naming.md`，把 ZERO 的哲学落到 TypeScript / React 层（layer 后缀集合、PascalCase/camelCase 规则、入口固定名保留、保留后缀列表）。
   - 在 `.ai/L1#Overview/01.quick-map.md` 增加 `Naming` 小节。
   - 在 `.ai/L2#Index/00.root-index.md` 索引新规范。
   - 在 `.ai/L4#Changelog/` 写对应决策记录。

## 影响

- 后续新文件必须遵循新规则，命名偏短或结构省略的新文件在 PR 阶段视为不合规。
- 既有文件不回溯重命名；在拆分或新增中途接触时按新规则落地，并在 `large-file-ledger.md` 或对应 split 变更日志中记录 from/to。
- ZERO 自身与使用 ZERO 的项目共享同一哲学升级，后续 ZERO-ITERATION 流程可以依赖新规范做自动检查。

## 首个应用

- AL Venom 的 `apps/symbiote-isomimic-newapi-classic-web/src/` 拆分按新规则落地：`App.tsx`、`api.ts`、`styles.css` 切薄；页面一律 `FeatureName.view.tsx`；组件一律 `FeatureName.SubFeature.tsx`；API 域一律 `domain.api.ts`；CSS 分片一律 `domain.style.css`；框架 glue 一律 `app.route.tsx`、`app.provider.tsx`、`classic.const.ts`。
