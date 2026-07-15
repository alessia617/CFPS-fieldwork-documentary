/**
 * Design Tokens — 构成主义色彩体系
 *
 * 灵感来源：
 * - 苏联构成主义海报的有限色盘（红、黑、白、灰）
 * - 中国农村实地调查的褪色质感（旧纸张、泥土、砖墙、墨水）
 * - CFPS 田野工作的纪实感（自然、朴素、功能优先）
 *
 * 命名约定：
 * - canvas    → 画布底色
 * - ink       → 墨水色（文字）
 * - earth     → 大地色系（背景、卡片）
 * - brick     → 砖红色（强调、警示）
 * - field     → 田野色系（辅助、装饰）
 * - accent    → 功能强调色
 * - surface   → 表面色（卡片、面板）
 */

export const colors = {
  /* ========== 画布 ========== */
  canvas: '#f5f0e8',
  'canvas-alt': '#ede6da',
  'canvas-dark': '#e0d8c8',

  /* ========== 墨水（文字层级） ========== */
  'ink-primary': '#1a1a1a',
  'ink-secondary': '#4a4540',
  'ink-tertiary': '#7a7570',
  'ink-disabled': '#b0aaa5',

  /* ========== 大地（背景/卡片） ========== */
  'earth-light': '#f0ebe0',
  'earth': '#e8e0d0',
  'earth-dark': '#d4c8b0',

  /* ========== 砖红（构成主义强调） ========== */
  'brick': '#c44b3c',
  'brick-light': '#d96e5e',
  'brick-dark': '#9e372b',

  /* ========== 田野（辅助色） ========== */
  'field-green': '#6b8a5a',
  'field-green-light': '#8aa678',
  'field-yellow': '#c4a44a',
  'field-yellow-light': '#d4bc6e',

  /* ========== 功能强调 ========== */
  'accent-info': '#4a7a9e',
  'accent-success': '#5a8a5a',
  'accent-warning': '#c4944a',
  'accent-error': '#c44b3c',

  /* ========== 表面 ========== */
  'surface-phone': '#e8e4dc',
  'surface-card': '#faf7f0',
  'surface-overlay': 'rgba(26, 26, 26, 0.6)',
  'surface-glass': 'rgba(245, 240, 232, 0.85)',

  /* ========== 边界 ========== */
  'border-light': '#d8d0c4',
  'border': '#c0b8a8',
  'border-dark': '#a09888',
} as const

export type ColorToken = keyof typeof colors
