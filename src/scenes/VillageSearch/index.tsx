import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVillageExploration } from '../../hooks/useVillageExploration'
import { useFieldEvents } from '../../hooks/useFieldEvents'
import { Environment } from '../../components/Environment'
import { FieldEventOverlay } from '../../components/FieldEventOverlay'
import type { VisiblePath, VisibleLandmark, NpcInfo, VillageNode, ClueRecord } from '../../hooks/useVillageExploration'

export interface VillageSearchProps {
  onComplete: () => void
  onGiveUp: () => void
  onInteractNpc: (npcId: string) => void
}

export function VillageSearch({ onComplete, onGiveUp, onInteractNpc }: VillageSearchProps) {
  const {
    currentView, visited, steps, arrived, clues, moveTo, weather,
    isCandidate, verifyNode, resolved,
  } = useVillageExploration()
  const { currentNode, paths, landmarks } = currentView
  const { activeEvent, tryTrigger, dismissEvent } = useFieldEvents()

  const FATIGUE_THRESHOLD = 15

  const [verifyResult, setVerifyResult] = useState<'idle' | 'checking' | 'not_here' | 'confirmed'>('idle')
  const [showFatigue, setShowFatigue] = useState(false)
  const [fatigueDismissed, setFatigueDismissed] = useState(false)

  const handleMove = useCallback(
    (nodeId: string) => {
      moveTo(nodeId)
      setVerifyResult('idle')
      setFailReason('')
      setTimeout(() => {
        tryTrigger({ currentNodeId: nodeId, stepCount: steps, hasNpc: (currentNode?.npcsHere?.length ?? 0) > 0, weatherModifier: weather.eventModifier })
      }, 800)
    },
    [moveTo, tryTrigger, steps, currentNode, weather.eventModifier],
  )

  // 验证确认后延迟跳转
  useEffect(() => {
    if (verifyResult === 'confirmed') {
      const t = setTimeout(() => onComplete(), 3000)
      return () => clearTimeout(t)
    }
  }, [verifyResult, onComplete])

  // 验证失败原因池
  const failReasons = [
    '门牌号不对。不是███家。',
    '问了邻居，说这一户姓别的。',
    '对联的颜色不对。受访户门口没有红漆门。',
    '没有石磨。不是这里。',
    '出来开门的是个年轻人，不是受访户。',
    '这户人家说从来没听说过CFPS调查。',
  ]
  const [failReason, setFailReason] = useState('')

  // 走近查看
  const handleApproach = () => {
    setVerifyResult('checking')
    setTimeout(() => {
      const found = verifyNode()
      if (!found) setFailReason(failReasons[Math.floor(Math.random() * failReasons.length)]!)
      setVerifyResult(found ? 'confirmed' : 'not_here')
    }, 1800)
  }

  // 打电话确认
  const handleCallConfirm = () => {
    setVerifyResult('checking')
    setTimeout(() => {
      const found = verifyNode()
      if (!found) setFailReason('电话打过去，对方说不是这户。')
      setVerifyResult(found ? 'confirmed' : 'not_here')
    }, 2500)
  }

  // 步数达到阈值且未找到目标且未触发过 → 显示耐心提示
  useEffect(() => {
    if (steps >= FATIGUE_THRESHOLD && !resolved && !fatigueDismissed && verifyResult !== 'confirmed' && verifyResult !== 'checking') {
      setShowFatigue(true)
    }
  }, [steps, resolved, fatigueDismissed, verifyResult])

  const handleFatigueDismiss = () => {
    setShowFatigue(false)
    setFatigueDismissed(true)
  }

  const isDeadEnd = currentNode.type === 'empty' || currentNode.type === 'natural_space'

  return (
    <div style={{ minHeight: '100svh', background: '#1a1a1a', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)', position: 'relative', overflow: 'hidden' }}>
      <Environment nodeId={currentNode.visual ?? currentNode.id} />
      <FieldEventOverlay event={activeEvent} onDismiss={dismissEvent} />

      {/* 炎热日头视觉强化 */}
      {weather.id === 'hot' && <HeatOverlay />}

      {/* 耐心耗尽弹窗 */}
      {showFatigue && <FatigueOverlay onDismiss={handleFatigueDismiss} onGiveUp={onGiveUp} steps={steps} />}

      {/* 遮罩 */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.05) 70%, transparent 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)' }} />

      {/* Layer 3 — 顶部状态栏 */}
      <div style={{ position: 'relative', zIndex: 20 }}>
        <FieldStatusBar locationName={currentNode.name} steps={steps} weather={weather} resolved={resolved} />
      </div>

      {/* Layer 2 — 交互层 */}
      <div style={{ flex: 1, position: 'relative', zIndex: 10 }}>
        <InteractionLayer
          currentNode={currentNode}
          paths={paths}
          landmarks={landmarks}
          visited={visited}
          arrived={arrived}
          isCandidate={isCandidate}
          verifyResult={verifyResult}
          failReason={failReason}
          isDeadEnd={isDeadEnd}
          weather={weather}
          clues={clues}
          onMove={handleMove}
          onApproach={handleApproach}
          onCallConfirm={handleCallConfirm}
          onInteractNpc={onInteractNpc}
        />
      </div>

      {/* Layer 3 — 底部日志 */}
      <div style={{ position: 'relative', zIndex: 20 }}>
        <FieldJournal visited={visited} currentNodeId={currentNode.id} steps={steps} clues={clues} />
      </div>
    </div>
  )
}

/* ================================================================ */
function InteractionLayer({
  currentNode, paths, landmarks, visited, arrived, isCandidate, verifyResult, failReason, isDeadEnd, clues, weather, onMove, onApproach, onCallConfirm, onInteractNpc,
}: {
  currentNode: VillageNode; paths: VisiblePath[]; landmarks: VisibleLandmark[]
  visited: Set<string>; arrived: boolean; isCandidate: boolean
  verifyResult: 'idle' | 'checking' | 'not_here' | 'confirmed'
  failReason: string; isDeadEnd: boolean; clues: ClueRecord[]
  weather: { id: string; label: string }
  onMove: (id: string) => void; onApproach: () => void; onCallConfirm: () => void
  onInteractNpc: (id: string) => void
}) {
  const isHot = weather.id === 'hot'
  const activePaths = paths.filter((p) => !p.blocked)
  const blockedPaths = paths.filter((p) => p.blocked)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(8px, 2vh, 16px) clamp(10px, 3vw, 20px)', gap: 'clamp(6px, 1.2vh, 10px)', maxWidth: 580, margin: '0 auto', width: '100%' }}>

      {/* 到达提示 */}
      <AnimatePresence>
        {arrived && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(11px, 2.8vw, 14px)', color: '#fff', letterSpacing: '0.1em', background: 'rgba(0,0,0,0.5)', padding: '4px 16px', borderRadius: 2, backdropFilter: 'blur(4px)' }}>
              已到达 {currentNode.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 验证结果 */}
      <AnimatePresence>
        {verifyResult === 'checking' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: 'clamp(12px, 3vw, 16px)', letterSpacing: '0.06em' }}>
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>●</motion.span>
            确认中……
          </motion.div>
        )}
        {verifyResult === 'not_here' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#c44b3c', background: 'rgba(196,75,60,0.12)', padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 3vw, 18px)', borderRadius: 2, alignSelf: 'center', maxWidth: 400 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 600, letterSpacing: '0.06em' }}>不是这家。</span>
            {failReason && (
              <span style={{ fontFamily: 'var(--font-dialogue)', fontSize: 'clamp(13px, 3.5vw, 16px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, textAlign: 'center' }}>
                {failReason}
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>继续找</span>
          </motion.div>
        )}
        {verifyResult === 'confirmed' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#6b8a5a', background: 'rgba(0,0,0,0.5)', padding: '12px 20px', borderRadius: 2, alignSelf: 'center', backdropFilter: 'blur(4px)' }}>
            <div style={{ width: 14, height: 1, background: '#6b8a5a' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '0.06em' }}>确认了，这就是受访户。</span>
            <div style={{ width: 14, height: 1, background: '#6b8a5a' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 场景描述 */}
      <motion.div key={currentNode.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderRadius: 2, padding: 'clamp(10px, 2vw, 14px) clamp(10px, 2.5vw, 16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 2.2vw, 11px)', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
            {currentNode.type === 'residential' ? 'HOUSE · 一户人家' :
             currentNode.type === 'empty' ? 'EMPTY · 无人' :
             currentNode.type === 'natural_space' ? 'NATURE · 自然空间' :
             `FIELD · ${currentNode.area}`}
          </div>
          {isDeadEnd && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 2.2vw, 11px)', color: '#c44b3c', letterSpacing: '0.06em' }}>这里不是目标</span>}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 700, color: '#fff', margin: '0 0 6px 0', letterSpacing: '0.06em' }}>{currentNode.name}</h2>
        <p style={{ fontFamily: 'var(--font-dialogue)', fontSize: 'clamp(13px, 3.5vw, 16px)', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{currentNode.description}</p>
        {isHot && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              fontFamily: 'var(--font-dialogue)', fontSize: 'clamp(12px, 3vw, 16px)', lineHeight: 1.7,
              color: 'rgba(255,200,120,0.55)', margin: '8px 0 0 0', fontStyle: 'italic',
            }}
          >
            日头毒辣。裸露的皮肤晒得生疼。
          </motion.p>
        )}
      </motion.div>

      {/* 已获线索 */}
      <AnimatePresence>
        {clues.length > 0 && (
          <motion.div key={`c-${clues.length}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
            style={{ borderLeft: '2px solid #c4944a', paddingLeft: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 2.2vw, 11px)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', display: 'block', marginBottom: 2 }}>笔记</span>
            <span style={{ fontFamily: 'var(--font-dialogue)', fontSize: 'clamp(12px, 3vw, 16px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
              "{clues[clues.length - 1]!.text}"
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 2.2vw, 11px)', color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>——{clues[clues.length - 1]!.source}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 候选目标 — 验证操作 */}
      {isCandidate && verifyResult !== 'confirmed' && verifyResult !== 'not_here' && (
        <CandidatePanel
          onApproach={onApproach}
          onCallConfirm={onCallConfirm}
          clues={clues}
          currentNodeName={currentNode.name}
        />
      )}

      {/* 方向选择 */}
      {verifyResult !== 'confirmed' && (
        <DirectionChoices activePaths={activePaths} blockedPaths={blockedPaths} visited={visited} onMove={onMove} />
      )}

      {/* NPC */}
      {currentNode.npcsHere.length > 0 && verifyResult === 'idle' && (
        <NpcInteractionPanel npcs={currentNode.npcsHere} onInteract={onInteractNpc} />
      )}

      {/* 远处地标 */}
      {landmarks.length > 0 && verifyResult === 'idle' && (
        <LandmarkHints landmarks={landmarks} />
      )}

      {/* 死胡同 */}
      {isDeadEnd && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px 0' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>这里没有要找的人。折返吧。</span>
        </motion.div>
      )}
    </div>
  )
}

/* ================================================================
   CandidatePanel — 住宅节点可能是目标，需要验证
   ================================================================ */
function CandidatePanel({
  onApproach, onCallConfirm, clues, currentNodeName,
}: {
  onApproach: () => void; onCallConfirm: () => void; clues: ClueRecord[]; currentNodeName: string
}) {
  const matchCount = clues.length
  const clueTexts = clues.map((c) => c.text).join('')
  const hasGate = clueTexts.includes('门') || clueTexts.includes('红')
  const hasMill = clueTexts.includes('石磨')
  const hasDirection = clueTexts.includes('南') || clueTexts.includes('东') || clueTexts.includes('塘')

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
      style={{ background: 'rgba(107, 138, 90, 0.08)', backdropFilter: 'blur(6px)', border: '1px solid rgba(107, 138, 90, 0.2)', borderRadius: 2, padding: 'clamp(10px, 2vw, 14px) clamp(10px, 2.5vw, 16px)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginBottom: 10 }}>
        {currentNodeName}——这可能就是要找的人家
      </div>

      {matchCount > 0 ? (
        <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 2.2vw, 11px)', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>用已有线索对比：</span>
          {hasDirection && <span style={{ fontFamily: 'var(--font-dialogue)', fontSize: 'clamp(11px, 2.8vw, 14px)', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>方向对吗？</span>}
          {hasGate && <span style={{ fontFamily: 'var(--font-dialogue)', fontSize: 'clamp(11px, 2.8vw, 14px)', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>门是什么颜色？</span>}
          {hasMill && <span style={{ fontFamily: 'var(--font-dialogue)', fontSize: 'clamp(11px, 2.8vw, 14px)', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>有没有石磨？</span>}
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-dialogue)', fontSize: 'clamp(11px, 2.8vw, 14px)', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>还没有线索可以比对。</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button onClick={onApproach} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ flex: 1, padding: 'clamp(12px, 3vw, 14px) clamp(12px, 3vw, 16px)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 2, color: '#fff', fontSize: 'clamp(13px, 3.5vw, 16px)', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          走近看看
        </motion.button>
        <motion.button onClick={onCallConfirm} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ flex: 1, padding: 'clamp(12px, 3vw, 14px) clamp(12px, 3vw, 16px)', background: 'rgba(196, 75, 60, 0.15)', border: '1px solid rgba(196, 75, 60, 0.25)', borderRadius: 2, color: '#fff', fontSize: 'clamp(13px, 3.5vw, 16px)', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          打电话确认
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ================================================================== */

function FieldStatusBar({ locationName, steps, weather, resolved }: { locationName: string; steps: number; weather: { id: string; label: string }; resolved: boolean }) {
  const isHot = weather.id === 'hot'
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: 'clamp(8px, 1.5vw, 10px) clamp(12px, 3vw, 20px)', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)', color: '#c0b8a8', gap: 18, fontSize: 'clamp(11px, 2.8vw, 14px)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span><span style={{ color: 'rgba(255,255,255,0.35)' }}>位置</span>{' '}<span style={{ color: '#fff', fontWeight: 600 }}>{locationName}</span></span>
      <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
      <span><span style={{ color: 'rgba(255,255,255,0.35)' }}>步数</span>{' '}<span style={{ color: '#e8e4dc' }}>{steps}</span></span>
      <div style={{ flex: 1 }} />
      {resolved && <span style={{ color: '#6b8a5a', fontSize: 10 }}>✓ 已确认目标</span>}
      <span style={{
        color: isHot ? '#e8a050' : 'rgba(255,255,255,0.3)',
        fontSize: 'clamp(10px, 2.5vw, 12px)', marginLeft: 8, fontWeight: isHot ? 600 : 400,
      }}>
        █村 · {isHot ? '☀ 毒辣日头' : weather.label}
      </span>
    </div>
  )
}

/** 炎热天气 — 屏幕泛白 + 热浪微粒 */
function HeatOverlay() {
  return (
    <>
      {/* 顶部烈日照耀 — 强烈泛白 */}
      <motion.div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '35%',
          background: 'linear-gradient(to bottom, rgba(255,240,210,0.18), rgba(255,230,180,0.06), transparent)',
          zIndex: 2, pointerEvents: 'none',
        }}
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* 地面热浪 */}
      <motion.div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%',
          background: 'linear-gradient(to top, rgba(220,200,160,0.1), transparent)',
          zIndex: 2, pointerEvents: 'none',
        }}
      />
      {/* 热浪扰动 — 利用 SVG feTurbulence */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='heat'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.015 0.025' numOctaves='2' seed='3'%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 0.9 0 0 0 0 0.7 0 0 0 0.04 0' /%3E%3C/animateTransform attributeName='baseFrequency' values='0.015 0.025;0.018 0.03;0.015 0.025' dur='3s' repeatCount='indefinite' type='XML' /%3E%3C/feTurbulence%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23heat)'/%3E%3C/svg%3E")`,
        backgroundSize: 'cover',
        opacity: 0.15,
      }} />
    </>
  )
}

function DirectionChoices({ activePaths, blockedPaths, visited, onMove }: { activePaths: VisiblePath[]; blockedPaths: VisiblePath[]; visited: Set<string>; onMove: (id: string) => void }) {
  const all = [...activePaths, ...blockedPaths]
  if (all.length === 0) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', paddingLeft: 4 }}>你可以往这些方向走</span>
      {all.map((p) => {
        const vis = visited.has(p.nodeId); const bl = p.blocked
        const dirArrow = { '东': '→', '西': '←', '南': '↓', '北': '↑' }[p.direction] ?? '→'
        return (
          <motion.button key={p.nodeId} onClick={() => !bl && onMove(p.nodeId)}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            whileHover={!bl ? { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.12)' } : undefined}
            whileTap={!bl ? { scale: 0.98 } : undefined} transition={{ duration: 0.25 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'clamp(12px, 3vw, 14px) clamp(12px, 3vw, 16px)',
              background: bl ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
              border: `1px solid ${bl ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 2,
              cursor: bl ? 'default' : 'pointer', textAlign: 'left' as const, fontFamily: 'inherit',
              color: bl ? 'rgba(255,255,255,0.3)' : '#fff', opacity: bl ? 0.5 : 1 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: bl ? 'rgba(255,255,255,0.2)' : '#c44b3c', fontWeight: 700, width: 22, textAlign: 'center', flexShrink: 0 }}>{dirArrow}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'clamp(13px, 3.5vw, 16px)', fontWeight: 500, marginBottom: 2 }}>{p.name}{vis && !bl ? <span style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', marginLeft: 6 }}>(去过)</span> : null}</div>
              <div style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}>{bl ? p.blockReason : `${p.distance}${p.npcCount > 0 ? ' · 有人' : ''} · ${p.clueLikelihood}`}</div>
            </div>
            {!bl && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)', color: 'rgba(255,255,255,0.25)' }}>→</span>}
          </motion.button>
        )
      })}
    </div>
  )
}

function NpcInteractionPanel({ npcs, onInteract }: { npcs: NpcInfo[]; onInteract: (id: string) => void }) {
  if (npcs.length === 0) return null; const npc = npcs[0]!
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
      style={{ background: 'rgba(196, 75, 60, 0.12)', backdropFilter: 'blur(6px)', border: '1px solid rgba(196, 75, 60, 0.35)', borderRadius: 2, padding: 'clamp(10px, 2vw, 14px) clamp(10px, 2.5vw, 16px)', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👤</div>
      <div style={{ flex: 1 }}><div style={{ fontSize: 'clamp(13px, 3.5vw, 16px)', fontWeight: 600, color: '#fff', marginBottom: 2 }}>{npc.name} · {npc.occupation}</div><div style={{ fontSize: 'clamp(11px, 2.8vw, 14px)', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}>可以上前询问</div></div>
      <motion.button onClick={() => onInteract(npc.id)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        style={{ background: '#c44b3c', color: '#fff', border: 'none', borderRadius: 2, padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)', fontFamily: 'var(--font-mono)', fontSize: 'clamp(11px, 2.8vw, 14px)', letterSpacing: '0.06em', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>上前询问</motion.button>
    </motion.div>
  )
}

function LandmarkHints({ landmarks }: { landmarks: VisibleLandmark[] }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
      style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 2, padding: 'clamp(8px, 1.5vw, 12px) clamp(8px, 2vw, 14px)', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 8, display: 'block' }}>远处可以看到</span>
      {landmarks.map((lm) => (
        <div key={lm.nodeId} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'clamp(11px, 2.8vw, 14px)', marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>{lm.direction}方</span>
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>{lm.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)', color: 'rgba(255,255,255,0.25)' }}>· {lm.distance}</span>
        </div>
      ))}
    </motion.div>
  )
}

function FieldJournal({ visited, currentNodeId, steps, clues }: { visited: Set<string>; currentNodeId: string; steps: number; clues: ClueRecord[] }) {
  const list = Array.from(visited).slice(-8)
  return (
    <div style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(8px, 1.5vw, 10px) clamp(12px, 3vw, 20px)', fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
      <span style={{ color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>路线：</span>
      {list.map((id, i) => (
        <span key={id} style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
          {i > 0 && <span style={{ color: 'rgba(255,255,255,0.12)' }}>→</span>}
          <span style={{ color: id === currentNodeId ? '#c44b3c' : 'rgba(255,255,255,0.5)', fontWeight: id === currentNodeId ? 600 : 400 }}>{id === currentNodeId ? '●' : ''}</span>
        </span>
      ))}
      {clues.length > 0 && <span style={{ marginLeft: 'auto', color: '#c4944a', whiteSpace: 'nowrap' }}>线索 {clues.length}</span>}
      <span style={{ color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>步{steps}</span>
    </div>
  )
}

/**
 * 耐心耗尽弹窗
 */
function FatigueOverlay({ onDismiss, onGiveUp, steps }: { onDismiss: () => void; onGiveUp: () => void; steps: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 35,
        background: 'rgba(10,8,6,0.7)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{
          maxWidth: 420, padding: '32px 28px',
          background: '#f5f0e8', borderRadius: 2,
          border: '1px solid #c44b3c',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}
      >
        {/* 标题 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 28, height: 2, background: '#c44b3c' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)', color: '#c44b3c', letterSpacing: '0.1em', fontWeight: 600 }}>
            访员笔记
          </span>
        </div>

        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 700,
            color: '#1a1a1a', letterSpacing: '0.04em', margin: '0 0 10px 0',
          }}>
            耐心快要耗尽了
          </h2>
          <p style={{
            fontFamily: 'var(--font-dialogue)', fontSize: 'clamp(14px, 3.5vw, 16px)', lineHeight: 1.9,
            color: '#4a4540', margin: 0,
          }}>
            已经走了 <span style={{ fontFamily: 'var(--font-mono)', color: '#c44b3c', fontWeight: 600 }}>{steps}</span> 步，
            询问了好几个人，
            但目标家庭仍然没有找到。
          </p>
          <p style={{
            fontFamily: 'var(--font-dialogue)', fontSize: 'clamp(14px, 3.5vw, 16px)', lineHeight: 1.9,
            color: '#4a4540', margin: '12px 0 0 0',
          }}>
            在真实的田野调查中，
            访员有时也会遇到类似的情况。
            地址模糊，村民不认识，
            走了很多路却没有结果。
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {/* 继续寻找 */}
          <motion.button
            onClick={onDismiss}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1, padding: '12px 16px',
              background: '#1a1a1a', color: '#e8e4dc',
              border: 'none', borderRadius: 2,
              fontSize: 'clamp(13px, 3.5vw, 16px)', fontWeight: 600,
              fontFamily: 'var(--font-body)', cursor: 'pointer',
            }}
          >
            继续寻找
          </motion.button>

          {/* 结束寻找 */}
          <motion.button
            onClick={onGiveUp}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1, padding: '12px 16px',
              background: 'rgba(196,75,60,0.08)',
              color: '#c44b3c',
              border: '1px solid rgba(196,75,60,0.3)', borderRadius: 2,
              fontSize: 'clamp(13px, 3.5vw, 16px)', fontWeight: 600,
              fontFamily: 'var(--font-body)', cursor: 'pointer',
            }}
          >
            就到这里吧
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
