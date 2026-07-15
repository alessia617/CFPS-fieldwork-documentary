# 移动端性能诊断报告 — CFPS-fieldwork-documentary

> 检测日期：2026-07-15
> 规则：只分析，不修改代码

---

## 1. 图片分析（public/assets/village/）

| 文件 | 大小 | 4G 加载耗时(2000Kbps) | 优先级 |
|------|------|----------------------|--------|
| `scene_farmland.jpg` | **4.17 MB** | ~2.1s | 🔴 极其严重 |
| `scene_target_vicinity.jpg` | **1.25 MB** | ~0.6s | 🟡 偏高 |
| `scene_drying_field.jpg` | **1.01 MB** | ~0.5s | 🟡 偏高 |
| `scene_pond.jpg` | 0.59 MB | ~0.3s | 🟢 可接受 |
| `scene_committee.jpg` | 0.09 MB | ~0.0s | 🟢 小 |
| `scene_shop.jpg` | 0.06 MB | ~0.0s | 🟢 小 |

**6 张总计：7.16 MB**

| 问题 | 详情 |
|------|------|
| `scene_farmland.jpg` | 4.17MB，移动端首屏加载超过 2 秒 |
| 全部为 JPG | 无 WebP 格式；WebP 通常比 JPG 小 25-35% |
| 无响应式多分辨率 | 所有设备加载同一巨图 |
| 无 lazy loading | `<img>` 标签未使用 `loading="lazy"`（在 Environment 组件中） |

---

## 2. 首屏资源分析

| 场景 | 加载内容 | 首屏影响 |
|------|---------|---------|
| **IntroPhone** | Phone 组件（SVG 图标 + 内联样式）+ ChatBubble + dialogues.json | ✅ 极小。Phone 是纯 SVG，dialogues.json 是文本，**首屏极快** |
| **Thinking** | 暗色背景 SVG + 地图网格 | ✅ 无外部图片，仅在 SVG viewBox 内渲染 |
| **VillageSearch** | Environment 组件才开始加载 `scene_*.jpg` | ⚠️ 这是第一次触发大图加载。用户走到 VillageSearch 时，如果是 farmland 节点，**4.17MB 图片会在移动端下载 2 秒** |

**结论：首屏（IntroPhone）不存在图片加载问题。瓶颈发生在 VillageSearch 首次访问 farmland/pond/target 节点时。**

---

## 3. React Bundle

| 文件 | 原始大小 | gzip 大小 |
|------|---------|----------|
| `index-CCo7AcRL.js` | 420 KB | **130 KB** 🟢 |
| `index-Bgok-pek.css` | 11.6 KB | **3.4 KB** 🟢 |

**JS gzip 130KB — 移动端可接受。** Vercel CDN 自动 gzip 传输。

---

## 4. Framer Motion 检查

| 检查项 | 结果 |
|--------|------|
| `node_modules` 安装大小 | 5.7 MB |
| 实际打包引用次数 | **1 次** |
| Tree-shaking | ✅ 已生效。仅 `motion` 和 `AnimatePresence` 的 used code 被打入 bundle。安装大小 5.7MB 与 shipped 大小无关 |

Framer Motion 不是性能瓶颈。

---

## 5. 未使用的大型依赖

| 依赖 | 大小 | 是否使用 |
|------|------|---------|
| `react-dom` | 7.1 MB 安装 | ✅ 使用中（任何 React 项目必须有） |
| `@tailwindcss/vite` | 3.3 MB 安装 | ✅ 使用中 |
| `tailwindcss` | 0.8 MB 安装 | ✅ 使用中 |
| `framer-motion` | 5.7 MB 安装 | ✅ 使用中 |
| `oxlint` | devDependency | ✅ 仅 dev |

**无未使用的大型依赖。**

---

## 6. dist/ 部署大小

```
dist/assets/village/  7.16 MB  (6 张 JPG)
dist/assets/*.js      0.42 MB
dist/assets/*.css     0.01 MB
dist/favicon.svg      0.01 MB
dist/icons.svg        0.01 MB
──────
dist/ 总计            7.70 MB
```

每次 Vercel 部署传输 7.7MB 静态资源。

---

## 总结：瓶颈排行

| 排名 | 瓶颈 | 严重度 | 影响 |
|------|------|--------|------|
| **1** | `scene_farmland.jpg` — 4.17 MB | 🔴 极 | farmland 节点移动端加载 2 秒 |
| **2** | `scene_target_vicinity.jpg` — 1.25 MB | 🟡 | target 节点 ~0.6s |
| **3** | `scene_drying_field.jpg` — 1.01 MB | 🟡 | drying_field 节点 ~0.5s |
| **4** | 无 WebP 格式 | 🟡 | 所有图片可再压 25-35% |
| **5** | 无响应式多分辨率 | 🟡 | 移动端加载和桌面端同样大小的图片 |
| **6** | `<img>` 无 `loading="lazy"` | 🟢 | Environment 组件中图片缺少懒加载 |

---

## 建议优化方案（仅列出，不实施）

| # | 方案 | 预期收益 | 工作量 |
|---|------|---------|--------|
| 1 | 将 6 张 JPG 转为 WebP | -25% 体积 | low（自动工具） |
| 2 | 生成 3 级分辨率（320w/768w/1280w），`<picture>` 标签 | 移动端减 60% | medium |
| 3 | `scene_farmland.jpg` 单独处理：降低分辨率到 1440px 宽 + WebP | -60% | low |
| 4 | `<img loading="lazy">` 在 Environment 中 | 首帧不阻塞 | trivial |
| 5 | 考虑在 IntroPhone 场景播放时预加载下一场景的图片（`<link rel="prefetch">`） | 切换场景时 0 延迟 | trivial |

---

*本报告仅分析，未修改任何代码。*
