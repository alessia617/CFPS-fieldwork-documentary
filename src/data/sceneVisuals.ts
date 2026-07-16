/**
 * 场景视觉映射 — 真实农村摄影 NPR 数字绘景
 * 响应式多分辨率: _thumb(400w) / _med(800w) / 原图(1400w)
 *
 * 路径兼容：
 *   Vercel         → BASE_URL = '/' → '/assets/village/...'
 *   GitHub Pages   → BASE_URL = '/CFPS-fieldwork-documentary/' → '/CFPS-fieldwork-documentary/assets/village/...'
 *   npm run dev    → BASE_URL = '/' → '/assets/village/...'
 */

export interface SceneVisual {
  nodeId: string
  groundColor: string
  mood: string
  timeOfDay: string
  /** 桌面原图 */
  imagePath: string
  /** 响应式 srcSet */
  srcSet?: string
  /** CSS filter — NPR 管线 */
  filter: string
  /** 移动端减少 blur 以提升性能 */
  mobileFilter?: string
}

const nprFar   = 'blur(2.2px) saturate(0.4) contrast(0.9) brightness(1.03) sepia(0.18) hue-rotate(-4deg)'
const nprMid   = 'blur(1.8px) saturate(0.45) contrast(0.92) brightness(1.02) sepia(0.15) hue-rotate(-2deg)'
const nprNear  = 'blur(1.4px) saturate(0.5) contrast(0.94) brightness(1.01) sepia(0.12)'
const nprShadow= 'blur(2.0px) saturate(0.3) contrast(0.85) brightness(0.7) sepia(0.05) hue-rotate(-12deg)'

const mFar = 'blur(1.2px) saturate(0.5) contrast(0.92) brightness(1.02) sepia(0.15) hue-rotate(-3deg)'
const mMid = 'blur(1.0px) saturate(0.55) contrast(0.94) brightness(1.01) sepia(0.12) hue-rotate(-1deg)'
const mNear= 'blur(0.8px) saturate(0.6) contrast(0.95) brightness(1.01) sepia(0.1)'

/** 统一 asset 路径 — 兼容 Vercel(/) + GitHub Pages(/repo/) */
const BASE = import.meta.env.BASE_URL

function asset(p: string): string {
  return `${BASE}${p.replace(/^\//, '')}`
}

/** 生成 srcSet: 400w thumb, 800w med, 1400w desktop */
function src(base: string): string {
  const name = asset(base).replace(/\.jpg$/, '')
  return `${name}_thumb.jpg 400w, ${name}_med.jpg 800w, ${asset(base)} 1400w`
}

export const sceneVisuals: SceneVisual[] = [
  {
    nodeId: 'entrance',
    groundColor: '#c4b494', mood: '开阔、安静、起点', timeOfDay: '下午三点 · 晴',
    imagePath: asset('assets/village/scene_farmland.jpg'), srcSet: src('assets/village/scene_farmland.jpg'),
    filter: nprFar, mobileFilter: mFar,
  },
  {
    nodeId: 'shop',
    groundColor: '#bca888', mood: '有人气、日常、信息点', timeOfDay: '下午三点半 · 晴',
    imagePath: asset('assets/village/scene_shop.jpg'), srcSet: src('assets/village/scene_shop.jpg'),
    filter: nprMid, mobileFilter: mMid,
  },
  {
    nodeId: 'committee',
    groundColor: '#c0ac90', mood: '冷清、正式、疏离', timeOfDay: '下午三点 · 薄云',
    imagePath: asset('assets/village/scene_committee.jpg'), srcSet: src('assets/village/scene_committee.jpg'),
    filter: 'blur(1.8px) saturate(0.35) contrast(0.9) brightness(0.95) sepia(0.1) hue-rotate(-6deg)',
    mobileFilter: 'blur(1.0px) saturate(0.45) contrast(0.92) brightness(0.96) sepia(0.08) hue-rotate(-4deg)',
  },
  {
    nodeId: 'drying_field',
    groundColor: '#c8b898', mood: '开阔、生活感、社交', timeOfDay: '下午四点 · 晴',
    imagePath: asset('assets/village/scene_drying_field.jpg'), srcSet: src('assets/village/scene_drying_field.jpg'),
    filter: 'blur(2.0px) saturate(0.42) contrast(0.9) brightness(1.05) sepia(0.2) hue-rotate(2deg)',
    mobileFilter: 'blur(1.0px) saturate(0.5) contrast(0.92) brightness(1.04) sepia(0.16) hue-rotate(1deg)',
  },
  {
    nodeId: 'old_housing',
    groundColor: '#b0a080', mood: '逼仄、迷路感、重复', timeOfDay: '下午三点 · 巷中阴凉',
    imagePath: asset('assets/village/scene_target_vicinity.jpg'), srcSet: src('assets/village/scene_target_vicinity.jpg'),
    filter: nprShadow, mobileFilter: 'blur(1.2px) saturate(0.4) contrast(0.88) brightness(0.72) sepia(0.04) hue-rotate(-8deg)',
  },
  {
    nodeId: 'pond',
    groundColor: '#b8a888', mood: '开阔、湿润、转折点', timeOfDay: '下午四点半 · 微风',
    imagePath: asset('assets/village/scene_pond.jpg'), srcSet: src('assets/village/scene_pond.jpg'),
    filter: 'blur(2.0px) saturate(0.45) contrast(0.9) brightness(1.0) sepia(0.12) hue-rotate(8deg)',
    mobileFilter: 'blur(1.0px) saturate(0.55) contrast(0.92) brightness(1.0) sepia(0.1) hue-rotate(5deg)',
  },
  {
    nodeId: 'farmland',
    groundColor: '#9a9860', mood: '空旷、孤独、无方向', timeOfDay: '下午三点 · 晴',
    imagePath: asset('assets/village/scene_farmland.jpg'), srcSet: src('assets/village/scene_farmland.jpg'),
    filter: 'blur(2.5px) saturate(0.38) contrast(0.88) brightness(1.04) sepia(0.2) hue-rotate(-3deg)',
    mobileFilter: 'blur(1.4px) saturate(0.48) contrast(0.9) brightness(1.03) sepia(0.16) hue-rotate(-2deg)',
  },
  {
    nodeId: 'target_vicinity',
    groundColor: '#b4a484', mood: '安静、临近、确认感', timeOfDay: '下午四点 · 多云',
    imagePath: asset('assets/village/scene_target_vicinity.jpg'), srcSet: src('assets/village/scene_target_vicinity.jpg'),
    filter: nprNear, mobileFilter: mNear,
  },
]

export function getSceneVisual(nodeId: string): SceneVisual {
  return sceneVisuals.find((v) => v.nodeId === nodeId) ?? sceneVisuals[0]!
}
