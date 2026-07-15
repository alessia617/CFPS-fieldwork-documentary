import { useReducer, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { AppContext, initialState, appReducer } from './context'
import { canTransition, getTransitionType, SceneTransition } from './systems'
import { IntroPhone, Thinking, VillageSearch, NPCInteraction, Ending } from './scenes'
import { resetExplorationState } from './hooks/useVillageExploration'
import type { SceneId, AppState, AppAction } from './context/types'
import type { TransitionType } from './systems'

/* ================================================================
   App — 应用根组件
   场景状态机 + 转场动画 + 多场景渲染
   ================================================================ */

/* ── 共享背景装饰（所有场景共用） ── */
function SharedBackground() {
  return (
    <>
      {/* 纸质纹理 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />
      {/* 档案元数据 */}
      <ArchivalMeta />
      {/* 归档戳记 */}
      <ArchiveStamp />
      {/* 右下角几何 */}
      <motion.div
        className="absolute bottom-12 right-10 flex gap-2.5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.3 }}
      >
        <div className="w-2.5 h-2.5 bg-ink-primary opacity-60" />
        <div className="w-2.5 h-2.5 bg-brick opacity-70" />
        <div className="w-2.5 h-2.5 border border-ink-primary opacity-30" />
      </motion.div>
      {/* 左下黑色方块 */}
      <motion.div
        className="absolute bottom-10 left-6 md:left-12"
        initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div style={{ width: 28, height: 28, background: '#1a1a1a' }} />
      </motion.div>
    </>
  )
}

/* ── 档案元数据 ── */
function ArchivalMeta() {
  return (
    <motion.div
      className="absolute bottom-10 left-6 md:left-12 flex flex-col gap-1.5 font-mono text-caption text-ink-tertiary tracking-mono select-none"
      style={{ left: 48 }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.4 }}
    >
      <div className="flex items-center gap-2.5">
        <span className="w-4 h-[1px] bg-brick" />
        <span className="select-none text-ink-tertiary opacity-60">档案编号 ██████████████</span>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="w-4 h-[1px] bg-ink-primary opacity-30" />
        <span className="select-none text-ink-tertiary opacity-60">访员 ID ██████</span>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="w-4 h-[1px] bg-ink-primary opacity-15" />
        <span className="blur-[2px] select-none">点位 █████ · ████ · ██</span>
      </div>
    </motion.div>
  )
}

/* ── 归档戳记 ── */
function ArchiveStamp() {
  return (
    <motion.div
      className="absolute top-24 right-10 md:right-16 rotate-12"
      initial={{ scale: 0, rotate: 45 }}
      animate={{ scale: 1, rotate: 12 }}
      transition={{ duration: 0.8, delay: 0.7, type: 'spring', stiffness: 100 }}
    >
      <div className="border-2 border-brick px-3 py-2.5 opacity-45">
        <div className="font-display text-caption text-brick font-bold tracking-widest whitespace-nowrap">
          已 归 档
        </div>
        <div className="mt-0.5 text-caption text-brick font-mono text-center blur-[2px] select-none">
          FILE.███
        </div>
      </div>
    </motion.div>
  )
}

/* ================================================================
   场景渲染映射
   ================================================================ */
function SceneRenderer({
  scene,
  state,
  dispatch,
}: {
  scene: SceneId
  state: AppState
  dispatch: React.Dispatch<AppAction>
}) {
  const navigateTo = useCallback(
    (target: SceneId) => {
      if (canTransition(scene, target, state)) {
        dispatch({ type: 'NAVIGATE_SCENE', scene: target })
      }
    },
    [scene, state, dispatch],
  )

  switch (scene) {
    case 'introPhone':
      return <IntroPhone onComplete={() => navigateTo('thinking')} />
    case 'thinking':
      return <Thinking onComplete={() => navigateTo('villageSearch')} />
    case 'villageSearch':
      return (
        <VillageSearch
          onComplete={() => navigateTo('ending')}
          onGiveUp={() => navigateTo('ending')}
          onInteractNpc={(npcId) => {
            dispatch({ type: 'SET_NPC', npcId })
            navigateTo('npcInteraction')
          }}
        />
      )
    case 'npcInteraction':
      return (
        <NPCInteraction
          npcId={state.currentNpcId}
          onBack={() => navigateTo('villageSearch')}
        />
      )
    case 'ending':
      return (
        <Ending
          onRestart={() => {
            resetExplorationState()
            dispatch({ type: 'RESET_ALL' })
          }}
        />
      )
    default:
      return (
        <div style={{
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          color: '#7a7570',
        }}>
          {scene} — 待实现
        </div>
      )
  }
}

/* ================================================================
   根组件
   ================================================================ */
export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const prevSceneRef = useRef<SceneId>(state.currentScene)
  const transitionTypeRef = useRef<TransitionType>('fade')

  // 场景切换时记录转场类型
  if (prevSceneRef.current !== state.currentScene) {
    transitionTypeRef.current = getTransitionType(prevSceneRef.current, state.currentScene)
    prevSceneRef.current = state.currentScene
  }

  const currentTransitionType = transitionTypeRef.current

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div
        className="relative min-h-screen overflow-x-hidden select-none"
        style={{
          background: '#f2e8d5',
          fontFamily: 'var(--font-body)',
        }}
      >
        <SharedBackground />

        <SceneTransition
          sceneKey={state.currentScene}
          transitionType={currentTransitionType}
        >
          <SceneRenderer
            scene={state.currentScene}
            state={state}
            dispatch={dispatch}
          />
        </SceneTransition>
      </div>
    </AppContext.Provider>
  )
}
