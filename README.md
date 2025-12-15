# Scash Explorer 前端（中文介绍）

Scash Explorer 是一个面向 SCASH 网络的专业区块链浏览器前端，基于 Next.js 构建，专注实时数据展示、国际化体验与搜索引擎友好。项目以“SSR + 国际化 + 组件化”为核心，提供生产环境可用的前端基础设施。

## 核心优势
- SEO 友好：在 `app/layout.tsx` 中配置完整的站点元信息、Open Graph、Twitter 卡片、站点图标与主题色，提升搜索与分享转化。
- 服务端国际化：`i18n/i18n-provider.tsx` 提供中/英/俄三语覆盖，并通过服务端翻译函数在 SSR 场景无缝工作。
- 组件化布局：统一的根布局（Header、Footer、ThemeProvider）保证结构清晰与可维护性，易于扩展。
- 移动端优化：布局与组件针对手机端进行适配，保证信息密度与清晰度。
- 类型安全：TypeScript + 现代 React 生态，降低维护成本，提升开发效率。

## 关键文件
- `app/layout.tsx`：站点根布局与完整 SEO 配置（标题、描述、关键词、作者、发布者、基础 URL、Open Graph、Twitter、icons、manifest、主题色）。
- `i18n/i18n-provider.tsx`：国际化键值与服务端翻译函数，覆盖导航、首页、区块、交易、富豪榜、大户追踪、不活跃地址等模块。

## SEO 配置亮点（来自 `app/layout.tsx`）
- 标题模板与详细描述，覆盖核心关键词。
- Open Graph：站点名称与预览图，适配社交平台分享。
- Twitter 卡片：大图摘要、标题与描述，提升点击转化。
- 站点图标与 `manifest`，保证跨平台一致化展示。
- `metadataBase` 与 `themeColor` 明确设置，增强 SEO 与浏览器表现。

## 国际化设计亮点（来自 `i18n/i18n-provider.tsx`）
- 三语支持：中文（zh）、英文（en）、俄文（ru）。
- 翻译键覆盖面广，减少文案遗漏与 fallback 风险。
- `getTranslation(locale)` 与 `getAvailableLocales()` 以服务端函数形式提供，SSR 友好。

## 适用场景
- 搭建专业的区块链浏览器前端，需兼顾 SEO、国际化与 SSR。
- 面向移动端用户的实时数据分析产品。
- 需要清晰架构与可维护性的中长期项目。


## 后端仓库
- NestJS 后端实现（API 与 RPC）：https://github.com/Forlingham/scash_explorer_nest_server

## 声明
本项目仅包含前端实现，数据与接口由后端提供。建议在生产环境下结合高可用后端与缓存策略，以获得最佳体验。

