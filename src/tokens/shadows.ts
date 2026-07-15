/**
 * Design Tokens — 阴影系统
 *
 * 设计逻辑：
 * - 手机阴影：深而实，强调"手中物理设备"的存在感
 * - NPC 卡片：柔和的纸质阴影，模拟档案卡片叠放
 * - 按钮悬浮：轻微上浮，构成主义的功能性反馈
 * - 对话气泡：极轻阴影，保持轻盈感
 * - 场景叠加层：无阴影，用半透明覆盖区分层级
 */

export const shadows = {
  /** 手机外壳物理阴影 — 深、带偏移 */
  phone: '0 8px 32px rgba(26, 26, 26, 0.25), 0 2px 8px rgba(26, 26, 26, 0.12)',

  /** NPC 卡片 — 柔和纸质阴影 */
  npcCard: '0 2px 12px rgba(26, 26, 26, 0.08), 0 1px 3px rgba(26, 26, 26, 0.06)',

  /** NPC 卡片悬浮 */
  npcCardHover: '0 4px 20px rgba(26, 26, 26, 0.12), 0 2px 6px rgba(26, 26, 26, 0.08)',

  /** 按钮默认 */
  button: '0 1px 3px rgba(26, 26, 26, 0.12)',

  /** 按钮悬浮 — 轻微上浮 */
  buttonHover: '0 4px 12px rgba(26, 26, 26, 0.18)',

  /** 按钮按下 — 压入感（内阴影） */
  buttonActive: 'inset 0 1px 3px rgba(26, 26, 26, 0.2)',

  /** 对话气泡 */
  bubble: '0 1px 4px rgba(26, 26, 26, 0.06)',

  /** 技能按钮悬浮 */
  skillHover: '0 4px 16px rgba(196, 75, 60, 0.25)',

  /** 地图节点 */
  mapNode: '0 2px 8px rgba(26, 26, 26, 0.12)',

  /** 地图节点已访问 */
  mapNodeVisited: '0 1px 4px rgba(26, 26, 26, 0.08)',

  /** 无阴影 */
  none: 'none',
} as const

export type ShadowToken = keyof typeof shadows
