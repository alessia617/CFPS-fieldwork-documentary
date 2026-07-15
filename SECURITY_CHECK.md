# Security Check — CFPS-Web 部署前安全检查

> 检查日期：2026-07-15
> 目标：GitHub + Vercel 部署
> 状态：✅ 通过，无高危发现

---

## 1. API Key / Token / Secret 扫描

| 检查模式 | 结果 |
|---------|------|
| `API_KEY` / `API Key` / `apikey` | ❌ 无 |
| `SECRET` / `secret_key` | ❌ 无 |
| `TOKEN` / `access_token` | ❌ 无 |
| `PASSWORD` | ❌ 无 |
| `PRIVATE_KEY` | ❌ 无 |
| `CREDENTIAL` | ❌ 无 |
| Slack token (`xox[baprs]-`) | ❌ 无 |
| GitHub token (`ghp_`) | ❌ 无 |
| GitLab token (`glpat-`) | ❌ 无 |
| OpenAI key (`sk-`) | ❌ 无 |
| AWS key (`AKIA`) | ❌ 无 |
| JWT (`eyJ...`) | ❌ 无 |
| 外部 URL | ❌ 无（仅 SVG `data:` URI 和 `http://www.w3.org/2000/svg` 命名空间） |

**结论：源代码中零敏感凭据。**

---

## 2. 环境变量文件

| 文件 | 状态 |
|------|------|
| `.env` | ❌ 不存在 |
| `.env.local` | ❌ 不存在 |
| `.env.development` | ❌ 不存在 |
| `.env.production` | ❌ 不存在 |

**结论：项目不使用 `.env`。纯静态前端，无环境变量依赖。**

---

## 3. `.gitignore` 审查

当前 `.gitignore` 涵盖：
- `node_modules` ✅
- `dist` / `dist-ssr` ✅
- `*.local` ✅
- `.vscode/*`（保留 `extensions.json`）✅
- `.idea` / `.DS_Store` ✅
- logs ✅

**建议补充**：
```
# 环境变量（防止未来误提交）
.env
.env.*
!.env.example

# Vercel
.vercel

# 其他
*.tmp
```

---

## 4. 配置文件检查

| 文件 | 风险 |
|------|------|
| `package.json` | ✅ 无敏感信息，只有公开 npm 依赖 |
| `vite.config.ts` | ✅ 无 secret 注入 |
| `tsconfig.json` | ✅ 标准配置 |
| `vercel.json` | ❌ 不存在（Vite 默认即可部署 Vercel） |

---

## 5. 照片文件 EXIF 检查

`public/assets/village/` 中 6 张 `.jpg`：

| 文件 | 大小 | 来源 | 风险 |
|------|------|------|------|
| `scene_farmland.jpg` | 4.4 MB | 用户实地拍摄 | ⚠️ 可能含 EXIF GPS |
| `scene_target_vicinity.jpg` | 1.3 MB | 用户实地拍摄 | ⚠️ 可能含 EXIF GPS |
| `scene_drying_field.jpg` | 1.1 MB | 用户实地拍摄 | ⚠️ 可能含 EXIF GPS |
| `scene_pond.jpg` | 617 KB | 用户实地拍摄 | ⚠️ 可能含 EXIF GPS |
| `scene_committee.jpg` | 89 KB | 微信传输（已压缩） | 低风险 |
| `scene_shop.jpg` | 63 KB | 微信传输（已压缩） | 低风险 |

**提醒**：实地拍摄的照片可能包含 GPS 坐标、拍摄时间、设备信息等 EXIF 元数据。如果介意这些信息被公开，部署前用以下方式清除：

```bash
# macOS / Linux
exiftool -all= public/assets/village/*.jpg

# 或使用在线工具
# 或手动截图后重新保存
```

微信传输的图片通常已自动清除 EXIF，但手机直接保存的原图可能保留 GPS 信息。

---

## 6. 当前不是 Git 仓库

项目还未 `git init`，无需担心历史提交泄露。初始化时建议立即提交 `.gitignore` 后再添加文件。

---

## 7. Vercel 部署兼容性

| 检查项 | 状态 |
|--------|------|
| Vite 项目 | ✅ 原生支持，无需额外配置 |
| 构建命令 | `npm run build` → `tsc -b && vite build` ✅ |
| 输出目录 | `dist/` → Vite 默认 ✅ |
| SPA 路由 | 纯前端，无服务端路由 ✅ |
| 外部 API 调用 | 零外部依赖 ✅ |

---

## 总结

```
✅ 零敏感凭据
✅ 零 .env 文件
✅ 零硬编码 Token / Password / Secret
✅ .gitignore 已覆盖核心路径
⚠️ 建议清除实地照片 EXIF 信息
⚠️ 建议补充 .gitignore 条目
```

**结论：可以部署。**

---

*本报告由自动化安全扫描生成。未修改任何代码。*
