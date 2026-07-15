/**
 * Design Tokens — 圆角系统
 *
 * 构成主义倾向：大面积直角、小面积微圆角
 * 手机外壳保留圆角（模拟真实设备）
 * 按钮和卡片使用微小圆角（功能感，不过度软化）
 */

export const radii = {
  /** 无圆角 — 构成主义标志性的直角 */
  none: '0',

  /** 微圆角 — 按钮、输入框、标签 */
  xs: '2px',

  /** 小圆角 — 卡片、面板 */
  sm: '4px',

  /** 中圆角 — 大卡片、对话框 */
  md: '8px',

  /** 大圆角 — 手机外壳 */
  lg: '16px',

  /** 超大圆角 — 聊天气泡 */
  xl: '20px',

  /** 全圆 — 头像、圆形按钮 */
  full: '9999px',
} as const

/** 语义化圆角映射 */
export const semanticRadii = {
  phone: radii.lg,
  button: radii.xs,
  card: radii.sm,
  npcCard: radii.md,
  bubble: radii.xl,
  avatar: radii.full,
  skillButton: radii.sm,
  mapNode: radii.full,
} as const

export type RadiiToken = keyof typeof radii
