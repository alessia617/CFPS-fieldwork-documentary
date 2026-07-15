import type { SceneId, AppState } from '../../context/types'

/* ================================================================
   SceneStateMachine — 轻量场景状态机
   配置驱动：场景图 + 跳转守卫 + 转场类型
   ================================================================ */

/** 转场动画类型 — 委托 SceneTransition 执行 */
export type TransitionType =
  | 'fade'
  | 'fadeSlow'
  | 'slideLeft'
  | 'slideRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'phoneEnter'
  | 'phoneExit'

/** 跳转规则 */
export interface TransitionRule {
  from: SceneId
  to: SceneId
  guard?: (state: AppState) => boolean
  transitionType: TransitionType
}

/** 场景图：每个场景允许跳转到哪些场景 */
const SCENE_GRAPH: Record<SceneId, SceneId[]> = {
  introPhone: ['thinking'],
  thinking: ['villageSearch'],
  villageSearch: ['npcInteraction', 'ending'],
  npcInteraction: ['villageSearch'],
  ending: ['introPhone'],
}

/** 跳转规则表 — 定义每个 edge 的转场动画和守卫 */
const TRANSITION_RULES: TransitionRule[] = [
  {
    from: 'introPhone',
    to: 'thinking',
    transitionType: 'phoneExit',
  },
  {
    from: 'thinking',
    to: 'villageSearch',
    transitionType: 'zoomIn',
  },
  {
    from: 'villageSearch',
    to: 'npcInteraction',
    // VillageSearch 自身检查 NPC 存在后才允许触发
    transitionType: 'fade',
  },
  {
    from: 'villageSearch',
    to: 'ending',
    // 目标验证逻辑由 VillageSearch 内部 handle，这里不做 guard
    transitionType: 'fadeSlow',
  },
  {
    from: 'ending',
    to: 'introPhone',
    transitionType: 'fadeSlow',
  },
  {
    from: 'npcInteraction',
    to: 'villageSearch',
    transitionType: 'fade',
  },
]

/* ── 公开 API ── */

/** 获取某场景允许的跳转目标 */
export function getAllowedNext(from: SceneId): SceneId[] {
  return SCENE_GRAPH[from] ?? []
}

/** 找到匹配的跳转规则 */
export function findRule(from: SceneId, to: SceneId): TransitionRule | undefined {
  return TRANSITION_RULES.find((r) => r.from === from && r.to === to)
}

/** 检查是否可以跳转（场景图 + guard） */
export function canTransition(from: SceneId, to: SceneId, state: AppState): boolean {
  const allowed = getAllowedNext(from)
  if (!allowed.includes(to)) return false

  const rule = findRule(from, to)
  if (rule?.guard) {
    return rule.guard(state)
  }
  return true
}

/** 获取跳转的转场动画类型 */
export function getTransitionType(from: SceneId, to: SceneId): TransitionType {
  const rule = findRule(from, to)
  return rule?.transitionType ?? 'fade'
}
