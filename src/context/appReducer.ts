import type { AppState, AppAction } from './types'

export const initialState: AppState = {
  currentScene: 'introPhone',
  currentNpcId: null,
  player: {
    clues: [],
    dialectSkillUses: 0,
    maxDialectSkillUses: 3,
    route: [],
    currentNodeIndex: 0,
  },
  npcState: {},
  progress: {
    startTime: Date.now(),
    housesFound: 0,
    totalHouses: 3,
  },
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE_SCENE':
      return { ...state, currentScene: action.scene }

    case 'SET_NPC':
      return { ...state, currentNpcId: action.npcId }

    case 'ADD_CLUE':
      if (state.player.clues.includes(action.clueId)) return state
      return {
        ...state,
        player: { ...state.player, clues: [...state.player.clues, action.clueId] },
      }

    case 'USE_DIALECT_SKILL': {
      if (state.player.dialectSkillUses >= state.player.maxDialectSkillUses) return state
      return {
        ...state,
        player: {
          ...state.player,
          dialectSkillUses: state.player.dialectSkillUses + 1,
        },
      }
    }

    case 'UPDATE_NPC_TRUST': {
      const npc = state.npcState[action.npcId]
      const current = npc?.trust ?? 0
      const next = Math.max(0, Math.min(100, current + action.delta))
      return {
        ...state,
        npcState: {
          ...state.npcState,
          [action.npcId]: { ...(npc ?? { met: false, trust: 0, dialoguesCompleted: [] }), trust: next },
        },
      }
    }

    case 'COMPLETE_DIALOGUE': {
      const npc = state.npcState[action.npcId]
      const base = npc ?? { met: true, trust: 50, dialoguesCompleted: [] }
      if (base.dialoguesCompleted.includes(action.dialogueId)) return state
      return {
        ...state,
        npcState: {
          ...state.npcState,
          [action.npcId]: {
            ...base,
            met: true,
            dialoguesCompleted: [...base.dialoguesCompleted, action.dialogueId],
          },
        },
      }
    }

    case 'MOVE_TO_NODE':
      return {
        ...state,
        player: { ...state.player, currentNodeIndex: action.nodeIndex },
      }

    case 'COMPLETE_GAME':
      return {
        ...state,
        currentScene: 'ending',
      }

    case 'RESET_ALL':
      return { ...initialState, progress: { ...initialState.progress, startTime: Date.now() } }

    default:
      return state
  }
}
