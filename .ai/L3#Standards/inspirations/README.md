# ZERO 灵感来源库（Inspirations）

> **目录定位**：收集优秀的 AI 辅助开发框架、规范和最佳实践，作为 ZERO 演进的灵感来源

---

## 📚 收录标准

本目录收录的框架/规范需满足以下条件：
1. **实战验证**：经过真实项目验证，非纸上谈兵
2. **AI 友好**：专门针对 AI 辅助开发优化
3. **开源可学习**：有完整的文档和代码示例
4. **社区认可**：有一定的用户基础和 star 数

---

## 📖 已收录框架

### 1. Everything Claude Code (ECC)

**基本信息**：
- **作者**：Affaan Mustafa（Anthropic x Forum Ventures 黑客松获胜者）
- **GitHub**：https://github.com/affaan-m/everything-claude-code
- **Star 数**：25,000+（2025年1月）
- **实战经验**：10+ 个月日常使用，构建真实产品
- **技术栈**：Claude Code CLI 配置集合

**核心内容**：
- 12 个专门化子代理（planner、code-reviewer、tdd-guide 等）
- 22 个工作流定义（coding-standards、backend-patterns 等）
- 8 个始终遵循的规则（security、testing、git-workflow 等）
- 23 个斜杠命令（/tdd、/code-review、/plan 等）
- 自动化 Hooks（PreToolUse、PostToolUse、SessionStart/End 等）

**参考价值**：
- ✅ 代码风格规范（不可变性、嵌套深度限制）
- ✅ TDD 工作流（80% 测试覆盖率）
- ✅ 安全检查清单（10 大安全检查项）
- ✅ 后端/前端开发模式库
- ✅ Git 工作流最佳实践
- ✅ 性能优化策略

**本地路径**：`docs/inspirations/ECC/`

**何时参考**：
- 需要补充代码质量规范时
- 需要建立测试规范时
- 需要完善安全规范时
- 需要参考开发模式时
- 遇到 AI 开发工作流问题时

---

## 🎯 使用建议

### 参考而非照搬
这些框架都有其特定的技术栈和使用场景，不要直接照搬到 ZERO：
1. **先理解**：理解框架背后的设计理念
2. **再提炼**：提炼出技术栈无关的核心原则
3. **后适配**：根据 ZERO 的定位进行适配
4. **最后验证**：在实际项目中验证效果

### 演进而非革命
ZERO 的演进应该是渐进式的：
1. **发现问题**：在实际开发中遇到具体问题
2. **查找参考**：在这些框架中寻找解决方案
3. **小步试验**：在小范围内试验新规范
4. **验证效果**：确认有效后再推广
5. **更新文档**：更新 ZERO 的规范文档

### 保持 ZERO 的特色
ZERO 的核心价值是"路径为王"，任何参考都不应破坏这个核心：
- ✅ 可以参考：代码质量标准、测试规范、安全规范
- ⚠️ 谨慎参考：架构模式（需适配路径驱动理念）
- ❌ 不要参考：特定工具的配置（如 Claude Code CLI 专属功能）

---

## 📝 贡献指南

### 如何添加新框架

1. **创建框架目录**
   ```bash
   mkdir -p docs/inspirations/[框架名称]
   ```

2. **复制原始文档**
   - 保留原始 README
   - 保留核心文档
   - 保留许可证信息

3. **创建索引文件**
   - 框架基本信息
   - 核心内容概述
   - 参考价值分析
   - 何时参考的建议

4. **更新本 README**
   - 添加到"已收录框架"列表
   - 说明参考价值

### 目录命名建议

- 使用框架的常用简称或缩写
- 全大写（如 ECC）或全小写（如 cursor-rules）
- 避免使用空格和特殊字符

### 推荐收录的框架类型

- AI 辅助开发工作流框架
- AI 友好的代码规范
- Prompt Engineering 最佳实践
- AI 代码审查规范
- AI 测试策略
- AI 项目管理方法论

---

## 🔗 相关资源

### 官方文档
- [Claude Code 官方文档](https://code.claude.com/docs)
- [Anthropic Academy](https://anthropic.skilljar.com)

### 社区资源
- [Awesome Claude Code](https://github.com/topics/claude-code)
- [AI Coding Best Practices](https://github.com/topics/ai-coding)

---

**最后更新**：2025-01-31
