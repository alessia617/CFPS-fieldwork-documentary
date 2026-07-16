import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ChatBubble } from '../../components'
import { useDialogue } from '../../hooks/useDialogue'
import type { NarrativeItem } from '../../hooks/useDialogue'

export interface IntroPhoneProps {
  onComplete: () => void
}

export function IntroPhone({ onComplete }: IntroPhoneProps) {
  const { bubbles, phaseLabel, systemMsg, endingKeywords, allDone, onBubbleComplete } = useDialogue()

  return (
    <FloatLayer
      bubbles={bubbles.filter((b) => b.type !== 'system' && b.type !== 'ending')}
      phaseLabel={phaseLabel}
      systemMsg={systemMsg}
      endingKeywords={endingKeywords}
      allDone={allDone}
      onBubbleComplete={onBubbleComplete}
      onSceneComplete={onComplete}
    />
  )
}

function FloatLayer({
  bubbles, phaseLabel, systemMsg, endingKeywords, allDone, onBubbleComplete, onSceneComplete,
}: {
  bubbles: NarrativeItem[]; phaseLabel: string | null
  systemMsg: { text: string; detail?: string } | null
  endingKeywords: string[] | null; allDone: boolean
  onBubbleComplete: () => void; onSceneComplete: () => void
}) {
  const leftBubbles = bubbles.filter((b) => b.side === 'left')
  const rightBubbles = bubbles.filter((b) => b.side === 'right')

  return (
    <div style={{
      minHeight: '100svh', background: '#f2e8d5',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(12px, 3vh, 24px)',
    }}>
      {/* ── 阶段标签 ── */}
      <AnimatePresence>
        {phaseLabel && (
          <motion.div
            key={phaseLabel}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: 'clamp(6px, 1.5vh, 12px)' }}
          >
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)',
              color: '#7a7570', letterSpacing: '0.1em',
              border: '1px solid #d8d0c4', padding: '3px 12px',
              borderRadius: 2, background: 'rgba(232,224,208,0.4)',
            }}>
              【{phaseLabel}】
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 系统消息 ── */}
      <AnimatePresence>
        {systemMsg && (
          <motion.div
            key={systemMsg.text}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: 'clamp(8px, 2vh, 16px)' }}
          >
            <div style={{
              border: '1.5px solid #6b8a5a',
              padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 18px)',
              background: 'rgba(107,138,90,0.06)', textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)',
                color: '#6b8a5a', fontWeight: 600, letterSpacing: '0.08em',
                marginBottom: systemMsg.detail ? 3 : 0,
              }}>
                ✓ {systemMsg.text}
              </div>
              {systemMsg.detail && (
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 2vw, 11px)',
                  color: '#8aa678', letterSpacing: '0.06em',
                }}>
                  {systemMsg.detail}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 主体：桌面三栏 / 移动端手机居中 — 气泡堆叠在下方 ── */}
      <div className="intro-phone-layout" style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        width: '100%', maxWidth: 1100, gap: 'clamp(4px, 1.5vw, 20px)',
        alignItems: 'start',
      }}>
        {/* 左栏 RESPONDENT — 移动端隐藏 */}
        <div className="intro-side-left" style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 'clamp(20px, 5vh, 80px)' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2vw, 11px)',
            color: '#b0aaa5', letterSpacing: '0.1em', paddingLeft: 8,
            borderLeft: '2px solid #c0b8a8', userSelect: 'none',
          }}>
            RESPONDENT
          </span>
          <AnimatePresence>
            {leftBubbles.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={allDone ? { opacity: 0, transition: { duration: 0.6, delay: 0.1 } } : undefined}
              >
                <ChatBubble text={b.text ?? ''} side="left" onComplete={onBubbleComplete} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 中栏 — 手机 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Phone tilt={6} />
        </div>

        {/* 右栏 INTERVIEWER — 移动端隐藏 */}
        <div className="intro-side-right" style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 'clamp(20px, 5vh, 80px)' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2vw, 11px)',
            color: '#b0aaa5', letterSpacing: '0.1em', paddingRight: 8, textAlign: 'right',
            borderRight: '2px solid #c44b3c', userSelect: 'none',
          }}>
            INTERVIEWER
          </span>
          <AnimatePresence>
            {rightBubbles.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={allDone ? { opacity: 0, transition: { duration: 0.6, delay: 0.1 } } : undefined}
              >
                <ChatBubble text={b.text ?? ''} side="right" onComplete={onBubbleComplete} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── 结尾关键词 ── */}
      <AnimatePresence>
        {endingKeywords && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onAnimationComplete={() => { setTimeout(() => onSceneComplete(), 2500) }}
            transition={{ duration: 1, delay: 1.0 }}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 'clamp(8px, 2vh, 12px)',
              marginTop: 'clamp(12px, 3vh, 20px)',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 700,
              color: '#1a1a1a', letterSpacing: '0.1em',
            }}>
              {endingKeywords[0]}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 18, height: 1, background: '#c44b3c' }} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)',
                color: '#c44b3c', letterSpacing: '0.1em', fontWeight: 600,
              }}>
                {endingKeywords[1]}
              </span>
              <div style={{ width: 18, height: 1, background: '#c44b3c' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 移动端可见的侧边栏隐藏 —— 通过 CSS 媒体查询 */}
      <style>{`
        @media (max-width: 700px) {
          .intro-side-left,
          .intro-side-right {
            display: none !important;
          }
          .intro-phone-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
