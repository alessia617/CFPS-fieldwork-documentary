/**
 * Design Tokens — 字体系统
 *
 * 层级设计：
 * - display  → 场景标题、结算大标题（粗黑体，构成主义冲击力）
 * - heading  → 章节标题、NPC 名字
 * - body     → 正文、对话内容
 * - dialogue → NPC 对话（楷体/手写感，增强叙事沉浸）
 * - mono     → 数据统计、分数
 * - caption  → 辅助说明、图注
 */

export const typography = {
  /* ========== 字体族 ========== */
  fontFamily: {
    display: `'Noto Serif SC', 'Source Han Serif SC', 'SimSun', serif`,
    heading: `'Noto Sans SC', 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif`,
    body: `'Noto Sans SC', 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif`,
    dialogue: `'ZCOOL XiaoWei', 'KaiTi', 'STKaiti', 'AR PL UKai CN', serif`,
    mono: `'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace`,
    caption: `'Noto Sans SC', 'Source Han Sans SC', 'PingFang SC', sans-serif`,
  },

  /* ========== 字号 ========== */
  fontSize: {
    'display-xl': 'clamp(40px, 8vw, 72px)',
    'display-lg': 'clamp(32px, 6vw, 56px)',
    'display-md': 'clamp(24px, 4vw, 40px)',
    'heading-xl': '28px',
    'heading-lg': '22px',
    'heading-md': '18px',
    'body-lg': '18px',
    'body-md': '16px',
    'body-sm': '14px',
    'dialogue-lg': '20px',
    'dialogue-md': '17px',
    'dialogue-sm': '15px',
    'mono-md': '15px',
    'mono-sm': '13px',
    'caption': '12px',
  },

  /* ========== 字重 ========== */
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },

  /* ========== 行高 ========== */
  lineHeight: {
    display: '1.15',
    heading: '1.25',
    body: '1.65',
    dialogue: '1.8',
    mono: '1.4',
    caption: '1.4',
  },

  /* ========== 字距 ========== */
  letterSpacing: {
    display: '-0.02em',
    heading: '-0.01em',
    body: '0.01em',
    dialogue: '0.02em',
    mono: '0.04em',
    caption: '0.04em',
  },
} as const
