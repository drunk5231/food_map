# 味觉地图 · 高规格自查报告

**审计日期**: 2026-06-05
**审计维度**: 8个并行审计agent + 综合分析
**总体健康评分**: 6.5 / 10

---

## Executive Summary

项目架构基础扎实：清晰的feature-based组件组织、正确的React模式（memo/useCallback/context）、良好的XSS防御（无dangerouslySetInnerHTML、React自动转义）、周全的降级链（Supabase -> localDishes）、以及结构良好的工具模块。但在**运行时数据验证**、**错误边界粒度**和**测试覆盖**方面存在关键缺口，可能导致生产环境崩溃或数据静默丢失。

**Top 3 致命问题：**
1. Supabase和localStorage数据零运行时验证 — schema变更或缓存损坏将导致全应用崩溃
2. 单一ErrorBoundary包裹整个应用 — 任意组件渲染错误摧毁用户整个会话
3. localStorage配额溢出错误被静默吞掉 — 用户可能丢失所有收藏和进度却无任何提示

---

## P0 · 致命问题（发布前必须修复）

### P0-1: 为Supabase和缓存数据添加运行时验证

**问题**: `DishCacheContext.tsx:70` 和 `useDishes.ts:66` 将Supabase结果直接`as Dish[]`断言，无运行时形状检查。localStorage缓存读取同样如此。Schema变更或缓存损坏 → 全应用崩溃。

**行动**:
1. 创建 `src/utils/validators.ts`，含 `isDish(value: unknown): value is Dish` 类型守卫
2. 在Supabase入口点和localStorage缓存读取处应用 `data.filter(isDish)`
3. 缓存数据添加 `version` 字段，schema变更时自动失效
4. 缓存顶层结构验证（`Array.isArray`、`typeof timestamp`）

**工作量**: 2-3小时，一次性解决5个审计发现

### P0-2: 添加路由级ErrorBoundary

**问题**: `main.tsx` 中单一ErrorBoundary → 任意组件渲染错误摧毁整个应用。

**行动**:
1. 创建 `RouteErrorBoundary` 组件包裹 `App.tsx` 中的各个路由
2. 每个路由错误边界显示局部错误信息+重试按钮，其余功能不受影响
3. 根ErrorBoundary添加 `componentDidCatch` 错误日志

**工作量**: 2-3小时

### P0-3: 处理localStorage配额溢出

**问题**: `storage.ts` 所有 `setItem` 调用静默吞掉 `QuotaExceededError`。用户积累收藏/搜索历史后可能丢失所有持久化数据。

**行动**:
1. `saveUserState` catch块中检测 `QuotaExceededError` 并通过Toast提示用户
2. 写入大体积dish缓存前检查 `navigator.storage.estimate()`
3. 至少 `console.error` 记录

**工作量**: 1小时

### P0-4: 添加Content-Security-Policy头

**问题**: 无CSP头。应用从 `geo.datav.aliyun.com` 和Supabase加载外部资源，XSS漏洞可能允许任意脚本注入。

**行动**: 在 `vercel.json` 添加CSP头：
```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [{
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://mhknirrwyuzdoinojsuj.supabase.co https://geo.datav.aliyun.com; img-src 'self' data:; font-src 'self'"
    }]
  }]
}
```

**工作量**: 10分钟

---

## P1 · 高优先级（尽快修复）

### P1-1: 修复颜色对比度失败 (WCAG 1.4.3)

`--color-accent: #FA8C16` 在 `#FFF7E6` 背景上对比度约2.39:1（不满足4.5:1最低要求）。`--color-primary: #D4380D` 约4.00:1（也不满足）。

**行动**: 将 `--color-primary` 加深至至少 `#B8300A`，`--color-accent` 加深至至少 `#9A5A00`。
**文件**: `src/index.css` | **工作量**: 1小时

### P1-2: 补全可访问性基础

| 子任务 | 文件 | 工作量 |
|--------|------|--------|
| 添加跳过导航链接 | `App.tsx` | 30分钟 |
| 添加 `prefers-reduced-motion` CSS | `index.css` | 15分钟 |
| 修复搜索输入焦点轮廓 | `SearchPage.tsx` | 15分钟 |

### P1-3: useDishes添加本地降级

缓存为空且Supabase不可达时，`useDishes` 返回错误无数据。应降级过滤 `localDishes`。
**文件**: `src/hooks/useDishes.ts` | **工作量**: 1小时

### P1-4: 稳定回调引用，修复Memo失效

`HomePage.tsx:130-133` 的 `HotDishesSection` 每次渲染创建内联箭头函数，完全绕过 `React.memo`。`DishList.tsx:69` 的柯里化点击处理器同样如此。

**行动**: 提取memoized包装组件；将 `favorites`/`eaten`/`wantToEat` 数组转为 `Set` 消除O(n)查找。
**工作量**: 2-3小时

### P1-5: 建立测试基础设施

仅4个测试文件覆盖 `utils/`。零组件测试、零hook测试、零集成测试。

**行动优先级**:
1. 创建Supabase mock（解除所有数据依赖测试的阻塞）
2. 为 `solarTerm.ts` 添加单元测试（纯函数，快速收益）
3. 补全 `storage.ts` 测试（搜索历史、口味历史）
4. `renderHook` 测试 `useUserState`
5. 组件测试 `DishCard`、`ChinaMap`、`TasteTest`

**工作量**: 2-3天

### P1-6: 数据加载失败添加重试UI

`PageError` 组件无操作按钮。`DishCacheContext` 的 `retry` 函数从未接入UI。
**行动**: `PageError` 添加 `onRetry` prop，在 `FoodClockPage` 和 `TasteTestPage` 接线。
**工作量**: 30分钟

### P1-7: 生成512px PWA图标

Chrome要求512x512图标用于PWA安装提示和启动画面。当前仅有192px SVG。
**工作量**: 30分钟

### P1-8: 为交互组件添加ARIA属性

| 组件 | 修改 |
|------|------|
| DishDetailModal/SolarTermDetailModal | `aria-labelledby` 关联标题id |
| FavoritesPage | `aria-controls`、`role="tabpanel"` |
| FilterChipGroup | `role="radiogroup"`、`aria-pressed` |
| SearchPage | `aria-live="polite"` 搜索结果计数 |
| ChinaMap | 省份路径 `aria-label` 合并tooltip信息 |
| FoodClock | `role="group"`、动态 `aria-label` |

**工作量**: 2-3小时

### P1-9: 提取重复的模态框焦点陷阱逻辑

`DishDetailModal.tsx` 和 `SolarTermDetailModal.tsx` 包含50+行相同的焦点陷阱、ESC处理、滚动锁定逻辑。
**行动**: 提取为共享 `useModalAccessibility` hook。
**工作量**: 1小时

---

## P2 · 中优先级（质量提升）

### P2-1: 修复剩余类型安全问题

- GeoJSON坐标类型断言添加 `Array.isArray` 检查
- ProvincePath断言添加字段验证
- CustomEvent `e.detail` 形状验证
- `activeElement` 类型为 `HTMLElement | null`
- SolarTerm.season 改为字面量联合类型
- storage.ts口味历史深度验证

### P2-2: 改进错误处理

- ErrorBoundary添加 `componentDidCatch` 日志
- 孤立收藏ID清理（同步badge计数）
- `window.alert` 替换为Toast
- Supabase环境变量缺失时优雅降级
- FoodClock空时段显示降级信息

### P2-3: 从页面组件提取业务逻辑

- `FavoritesPage` → `useFavoritesStats` hook
- `SearchPage` → `useFilteredDishes` hook
- `HomePage` → 自定义hook或工具函数

### P2-4: 改善触摸目标尺寸

7个交互元素低于44x44px最小值：筛选芯片(36px)、分类按钮(36px)、搜索历史删除按钮(20x20px)等。

### P2-5: Supabase查询优化

- `select('*')` 替换为显式列列表
- 添加复合索引 `idx_dishes_province_category`

### P2-6: 实现Stale-While-Revalidate缓存

30分钟硬TTL意味着频繁网络命中。改用：返回已过期缓存 → 后台重新获取 → 更新状态。

### P2-7: Emoji可访问性替代

装饰性emoji包裹 `<span aria-hidden="true">` + `<span className="sr-only">` 文本替代。

---

## P3 · 未来改进

- Service Worker加固（预缓存、容量限制、构建注入版本号）
- 数据迁移策略（版本字段+显式迁移函数）
- IndexedDB替代localStorage存储dish缓存
- FlavorRadar/ChinaMap快照测试
- Playwright E2E测试（5个核心流程）
- 县级GeoJSON离线缓存
- 用户数据跨设备同步（Supabase Auth）
- 用户数据导出/导入

---

## 快速修复清单（每个<30分钟）

| # | 任务 | 文件 | 耗时 |
|---|------|------|------|
| Q1 | 添加CSP头 | `vercel.json` | 10分钟 |
| Q2 | 添加 `prefers-reduced-motion` CSS | `index.css` | 10分钟 |
| Q3 | 修复搜索输入焦点轮廓 | `SearchPage.tsx` | 10分钟 |
| Q4 | 装饰性SVG添加 `aria-hidden` | ThemeToggle, ScrollToTopButton | 15分钟 |
| Q5 | `window.alert` 替换为Toast | `share.ts` | 15分钟 |
| Q6 | PageError添加重试按钮 | `PageLoading.tsx` | 20分钟 |
| Q7 | 移除死代码：`County`类型、空目录 | `types/index.ts` | 10分钟 |
| Q8 | 魔法数字命名化 | 多个文件 | 20分钟 |
| Q9 | localStorage key集中管理 | 新建 `src/constants.ts` | 15分钟 |
| Q10 | 生成512px PWA图标 | `public/` | 20分钟 |
| Q11 | 添加跳过导航链接 | `App.tsx` | 15分钟 |
| Q12 | 模态框标题添加 `aria-labelledby` | DishDetailModal, SolarTermDetailModal | 15分钟 |

---

## 技术债务登记册

| ID | 债务项 | 范围 | 延迟风险 | 工作量 |
|----|--------|------|----------|--------|
| TD-1 | Dish运行时验证器 | `validators.ts` + 3个消费方 | Schema变更导致生产崩溃 | 3小时 |
| TD-2 | 提取 `useModalAccessibility` hook | 2个模态组件 | 持续DRY违规 | 1小时 |
| TD-3 | 提取 `useFavoritesStats` hook | `FavoritesPage`(516行) | 页面不可维护 | 2小时 |
| TD-4 | 提取 `useFilteredDishes` hook | `SearchPage` | 测试困难 | 2小时 |
| TD-5 | favorites/eaten/wantToEat转为Set | AppContext, useUserState | O(n)查找性能退化 | 2小时 |
| TD-6 | Stale-While-Revalidate缓存 | DishCacheContext | 频繁网络命中+故障时数据丢失 | 3小时 |
| TD-7 | 路由级ErrorBoundary | App.tsx + 新组件 | 单组件崩溃杀死整个应用 | 3小时 |
| TD-8 | 集中管理label/color映射 | provinces.ts + 2个页面 | 三份副本漂移不同步 | 2小时 |
| TD-9 | 拆分 `solarTerm.ts` | 183行 | 概念混淆 | 1小时 |
| TD-10 | 测试基础设施：Supabase mock | 测试配置 | 所有数据依赖测试被阻塞 | 3小时 |
| TD-11 | Service Worker现代化 | `sw.js` | 资源过期、无预缓存 | 4小时 |
| TD-12 | dish缓存迁移至IndexedDB | DishCacheContext | localStorage配额压力 | 4小时 |

---

## 项目亮点（值得肯定）

**架构与模式：**
- 清晰的feature-based目录结构，零循环依赖
- 整个代码库零 `any`、零 `@ts-ignore`、零 `dangerouslySetInnerHTML`
- 正确的 `React.memo` 使用（DishCard、ProvinceShape）

**数据处理：**
- `storage.ts` 完善的 `isValidUserState()` 验证 + 全量try/catch
- `DishCacheContext` 优雅降级链：Supabase → localStorage缓存 → localDishes
- 防抖localStorage写入 + 卸载时立即刷新 = 快速切换不丢数据

**可访问性（已做得好的）：**
- 模态框完整的焦点陷阱、ESC关闭、焦点恢复
- Toast使用 `aria-live="polite"` + `role="status"`
- 省份SVG路径有 `role="button"`、`tabIndex={0}`、键盘Enter/Space支持
- 口味测试进度条有正确的 `role="progressbar"` + `aria-valuenow/min/max`

**性能：**
- ChinaMap tooltip用ref定位避免hover时重渲染
- d3-geo仅导入 `geoMerator`（tree-shakeable ~5KB vs 全量~30KB）
- 系统字体栈（零Web字体加载开销）

**安全：**
- Supabase所有表启用RLS，仅SELECT策略（只读公共应用正确配置）
- 无开放重定向向量 — 所有导航使用硬编码相对路径
- `.env` 正确gitignore，`.env.example` 仅占位值
- `sanitizeSearch` 在Supabase查询前剥离注入字符
