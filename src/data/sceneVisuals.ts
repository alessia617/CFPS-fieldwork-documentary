/**
 * 场景视觉映射 — 真实农村摄影 NPR 数字绘景
 *
 * 色彩：低饱和 · 暖夏午后 · 灰绿/橄榄绿 · 暖灰水泥路 · 米白旧墙
 * 光影：柔和自然光 · 阴影边缘柔软 · 无 HDR
 * 材质：保留真实质感 · 降低锐度 · 边缘柔化 · 细节简化
 * 氛围：田野调查现场感 · 非旅游风景
 *
 * 6 张实地照片 + 2 个滤镜变体 = 8 场景
 */

export interface SceneVisual {
  nodeId: string
  groundColor: string
  mood: string
  timeOfDay: string
  imagePath: string
  /** CSS filter — NPR 管线 */
  filter: string
}

/* ── NPR 管线 ──
   blur(Npx)            柔化边缘，去除摄影锐度，模拟绘画笔触
   saturate(0.X)        降饱和，远离商业鲜艳感
   contrast(0.X)        柔化阴影，避免 HDR
   brightness(1.X)      微调曝光
   sepia(0.X)           暖化基底 → 下午阳光感
   hue-rotate(Ndeg)     色彩偏移 → 统一暖调
   ───────────────────────────────────────────── */

/** 远景开阔类 — 较强柔焦，模拟人眼远眺 */
const nprFar = 'blur(2.2px) saturate(0.4) contrast(0.9) brightness(1.03) sepia(0.18) hue-rotate(-4deg)'

/** 中景生活类 — 中等柔焦 */
const nprMid = 'blur(1.8px) saturate(0.45) contrast(0.92) brightness(1.02) sepia(0.15) hue-rotate(-2deg)'

/** 近景建筑类 — 略柔焦，保留结构 */
const nprNear = 'blur(1.4px) saturate(0.5) contrast(0.94) brightness(1.01) sepia(0.12)'

/** 深巷阴凉类 — 压暗 + 冷蓝偏 */
const nprShadow = 'blur(2.0px) saturate(0.3) contrast(0.85) brightness(0.7) sepia(0.05) hue-rotate(-12deg)'

export const sceneVisuals: SceneVisual[] = [
  {
    nodeId: 'entrance',
    groundColor: '#c4b494',
    mood: '开阔、安静、起点',
    timeOfDay: '下午三点 · 晴',
    // 村口 → 农田底图 + 远景柔焦
    imagePath: '/assets/village/scene_farmland.jpg',
    filter: nprFar,
  },
  {
    nodeId: 'shop',
    groundColor: '#bca888',
    mood: '有人气、日常、信息点',
    timeOfDay: '下午三点半 · 晴',
    imagePath: '/assets/village/scene_shop.jpg',
    filter: nprMid,
  },
  {
    nodeId: 'committee',
    groundColor: '#c0ac90',
    mood: '冷清、正式、疏离',
    timeOfDay: '下午三点 · 薄云',
    imagePath: '/assets/village/scene_committee.jpg',
    filter: 'blur(1.8px) saturate(0.35) contrast(0.9) brightness(0.95) sepia(0.1) hue-rotate(-6deg)',
  },
  {
    nodeId: 'drying_field',
    groundColor: '#c8b898',
    mood: '开阔、生活感、社交',
    timeOfDay: '下午四点 · 晴',
    imagePath: '/assets/village/scene_drying_field.jpg',
    filter: 'blur(2.0px) saturate(0.42) contrast(0.9) brightness(1.05) sepia(0.2) hue-rotate(2deg)',
  },
  {
    nodeId: 'old_housing',
    groundColor: '#b0a080',
    mood: '逼仄、迷路感、重复',
    timeOfDay: '下午三点 · 巷中阴凉',
    // 深巷 → 人家底图 + 压暗冷偏
    imagePath: '/assets/village/scene_target_vicinity.jpg',
    filter: nprShadow,
  },
  {
    nodeId: 'pond',
    groundColor: '#b8a888',
    mood: '开阔、湿润、转折点',
    timeOfDay: '下午四点半 · 微风',
    imagePath: '/assets/village/scene_pond.jpg',
    filter: 'blur(2.0px) saturate(0.45) contrast(0.9) brightness(1.0) sepia(0.12) hue-rotate(8deg)',
  },
  {
    nodeId: 'farmland',
    groundColor: '#9a9860',
    mood: '空旷、孤独、无方向',
    timeOfDay: '下午三点 · 晴',
    imagePath: '/assets/village/scene_farmland.jpg',
    filter: 'blur(2.5px) saturate(0.38) contrast(0.88) brightness(1.04) sepia(0.2) hue-rotate(-3deg)',
  },
  {
    nodeId: 'target_vicinity',
    groundColor: '#b4a484',
    mood: '安静、临近、确认感',
    timeOfDay: '下午四点 · 多云',
    imagePath: '/assets/village/scene_target_vicinity.jpg',
    filter: nprNear,
  },
]

export function getSceneVisual(nodeId: string): SceneVisual {
  return sceneVisuals.find((v) => v.nodeId === nodeId) ?? sceneVisuals[0]!
}
