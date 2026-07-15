/**
 * Design Tokens — 构成主义间距系统
 *
 * 基于 4px 网格，8px 步进
 * 构成主义特征：大块留白 + 不对称布局的张力
 *
 * 用途：
 * - 场景内边距
 * - 组件间距
 * - 手机屏幕内部间距
 * - 地图节点间距
 */

export const spacing = {
  px: '1px',
  '0': '0',
  '0.5': '2px',
  '1': '4px',
  '1.5': '6px',
  '2': '8px',
  '2.5': '10px',
  '3': '12px',
  '3.5': '14px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '7': '28px',
  '8': '32px',
  '9': '36px',
  '10': '40px',
  '11': '44px',
  '12': '48px',
  '14': '56px',
  '16': '64px',
  '20': '80px',
  '24': '96px',
  '28': '112px',
  '32': '128px',
  '40': '160px',
  '48': '192px',
} as const

export type SpacingToken = keyof typeof spacing

/** 常用语义间距 */
export const semanticSpacing = {
  /** 场景内边距 */
  'scene-padding': spacing['8'],
  'scene-padding-mobile': spacing['4'],
  /** 手机屏幕内部 */
  'phone-inner': spacing['4'],
  'phone-inner-tight': spacing['3'],
  /** 组件间隙 */
  'component-gap': spacing['4'],
  'component-gap-tight': spacing['2'],
  /** 节点地图 */
  'map-node-gap': spacing['12'],
  'map-node-size': spacing['10'],
} as const
