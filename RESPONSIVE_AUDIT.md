# Responsive Audit Report — CFPS-Web

> 日期：2026-07-16
> 方法：Mobile First 渐进增强

---

## 诊断摘要

| 问题 | 涉及文件 | 状态 |
|------|---------|------|
| 手机模型 68vw 在某些设备过大 | Phone | ✅ 已改为 `min(80vw, 290px)` |
| 手机 3D 透视变换有性能开销 | Phone | ✅ 已移除 `rotateX/rotateY/perspective` |
| 桌面阴影过大(12px 40px) | Phone | ✅ 改为 3px 12px 轻阴影 |
| 气泡在移动端不可见（三栏布局） | IntroPhone | ✅ `<640px` 隐藏左右栏，仅手机居中 |
| 无 safe-area 支持 | index.css | ✅ 添加 `env(safe-area-inset-*)` |
| 移动端无 blur/滤镜减载 | index.css | ✅ `<640px` 移除所有图片滤镜 |
| 方向按钮无 min-height | VillageSearch | ✅ `min-height: 44px` |
| NPC 按钮横向排列 | NPCInteraction | ✅ 原生 `flex-direction: column`（已正确） |

---

## 修改清单

### 1. `src/index.css`

| 改动 | 说明 |
|------|------|
| 添加 `env(safe-area-inset-*)` | iPhone 刘海 + 底部栏安全区 |
| 添加 `<640px` 性能系统 | 自动移除图片 filter + 减半 shadow |
| 精简 @theme | 移除未使用的 token |

### 2. `src/components/Phone/index.tsx`

| 改动 | 说明 |
|------|------|
| `width: 'min(80vw, 290px)'` | 移动端 ≤80vw，桌面 ≤290px |
| 移除 `rotateX(3deg) rotateY(-3deg)` | 简化渲染，无性能消耗 |
| 移除 `perspective` | 同上 |
| 移除 `tilt` prop | 未使用 |
| 阴影降级 | `3px 12px rgba(0,0,0,0.20)` |
| 地面阴影缩放 | `min(80%, 240px)` |

### 3. `src/scenes/IntroPhone/index.tsx`

| 改动 | 说明 |
|------|------|
| 三栏 → flex 布局 + CSS 媒体查询 | `≤640px` 隐藏侧边气泡栏 |
| 手机始终居中 | 桌面双气泡+手机，移动端仅手机 |
| 移除 `NarrativeItem` 未使用导入 | 清理 |

---

## 断点测试

| 宽度 | 手机比例 | 气泡可见 | 性能 |
|------|---------|---------|------|
| **375px** (iPhone) | 80vw 居中 | 仅聊天内容在手机屏内 | 无滤镜, 无3D, 轻阴影 |
| **640px** (大屏手机) | 80vw 居中 | 同上 | 轻阴影 |
| **768px** (iPad) | ≈290px 居中 | 侧边气泡出现 | 正常 |
| **1024px** | 290px 居中 | 完整三栏 | 桌面效果 |
| **1280px+** | 290px 居中 | 完整三栏 | 桌面效果 |

---

## 未修改但已验证 OK 的组件

| 组件 | 检查结果 |
|------|---------|
| Thinking | 全部 `clamp()` 字号 + `maxWidth`，OK |
| VillageSearch | 48 处 `clamp()` + `min-height:44px`，OK |
| NPCInteraction | 18 处 `clamp()` + 纵向按钮，OK |
| Ending | 19 处 `clamp()` + 纵向卡片，OK |
| Environment | `<img loading="lazy" decoding="async" srcSet/sizes>`，OK |
| FieldEventOverlay | 点击任意处关闭，OK |
| ChatBubble | `clamp(14px, 4vw, 16px)`，OK |
| FatigueOverlay | 自包含卡片式弹窗，OK |

---

## 运行检查

```
✓ tsc -b     → 零错误
✓ vite build → 429 KB JS + 12 KB CSS
✓ oxlint     → 零新增警告
```
