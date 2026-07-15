/** 场景标识 */
export type SceneId =
  | 'introPhone'
  | 'thinking'
  | 'villageSearch'
  | 'npcInteraction'
  | 'ending'

/** 村庄节点 */
export interface VillageNode {
  id: string
  name: string
  npcs: string[]         // NPC id 列表
  connections: string[]   // 相邻节点 id
}

/** NPC 交互状态 */
export interface NpcInteractionState {
  met: boolean
  trust: number
  dialoguesCompleted: string[]
}

/** 玩家状态 */
export interface PlayerState {
  clues: string[]
  dialectSkillUses: number
  maxDialectSkillUses: number
  route: VillageNode[]
  currentNodeIndex: number
}

/** 进度 */
export interface ProgressState {
  startTime: number
  housesFound: number
  totalHouses: number
}

/** 全局应用状态 */
export interface AppState {
  currentScene: SceneId
  currentNpcId: string | null
  player: PlayerState
  npcState: Record<string, NpcInteractionState>
  progress: ProgressState
}

/** 全部 Action 类型联合 */
export type AppAction =
  | { type: 'NAVIGATE_SCENE'; scene: SceneId }
  | { type: 'SET_NPC'; npcId: string | null }
  | { type: 'RESET_ALL' }
  | { type: 'ADD_CLUE'; clueId: string }
  | { type: 'USE_DIALECT_SKILL' }
  | { type: 'UPDATE_NPC_TRUST'; npcId: string; delta: number }
  | { type: 'COMPLETE_DIALOGUE'; npcId: string; dialogueId: string }
  | { type: 'MOVE_TO_NODE'; nodeIndex: number }
  | { type: 'COMPLETE_GAME' }
