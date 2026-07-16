import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ChatBubble } from '../../components'
import { useDialogue } from '../../hooks/useDialogue'

export interface IntroPhoneProps { onComplete: () => void }

export function IntroPhone({ onComplete }: IntroPhoneProps) {
  const { bubbles, phaseLabel, systemMsg, endingKeywords, allDone, onBubbleComplete } = useDialogue()
  const dialogs = bubbles.filter(b => b.type !== 'system' && b.type !== 'ending')

  /* ── 响应式断点：≥640px 桌面 / <640px 手机 ── */
  const [isWide, setIsWide] = useState(() => window.innerWidth >= 640)
  useEffect(() => {
    const onResize = () => setIsWide(window.innerWidth >= 640)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const leftBubbles = dialogs.filter(b => b.side === 'left')
  const rightBubbles = dialogs.filter(b => b.side === 'right')

  /* ── 系统消息 ── */
  const sysMsgBlock = systemMsg ? (
    <div style={{
      borderBottom: '1px solid #d8d0c4', padding: '8px 14px',
      textAlign: 'center', fontFamily: 'var(--font-mono)',
      fontSize: 'clamp(10px, 2.5vw, 12px)',
    }}>
      <span style={{ color: '#6b8a5a', fontWeight: 600, letterSpacing: '0.08em' }}>
        ✓ {systemMsg.text}
      </span>
      {systemMsg.detail && (
        <div style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: '#8aa678' }}>
          {systemMsg.detail}
        </div>
      )}
    </div>
  ) : null

  return (
    <div style={{
      minHeight: '100svh', background: '#f2e8d5',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(12px, 2vh, 20px)',
    }}>
      <AnimatePresence>
        {phaseLabel && (
          <motion.div key={phaseLabel} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }} style={{ marginBottom: 8, zIndex: 5 }}>
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

      {/* ═══ 桌面（≥640px）：三栏 — 左气泡 + 45°手机 + 右气泡 ═══ */}
      {isWide && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', width: '100%', maxWidth: 1100, gap: 12 }}>
          <div style={{ flex: '1 1 0', minWidth: 0, paddingTop: 60, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#b0aaa5', letterSpacing: '0.1em', paddingLeft: 8, borderLeft: '2px solid #c0b8a8', userSelect: 'none', marginBottom: 4 }}>RESPONDENT</span>
            {leftBubbles.map(b => (
              <motion.div key={b.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={allDone ? { opacity: 0, transition: { duration: 0.6, delay: 0.1 } } : undefined}>
                <ChatBubble text={b.text ?? ''} side="left" onComplete={onBubbleComplete} />
              </motion.div>
            ))}
          </div>
          <div style={{ flexShrink: 0 }}>
            {sysMsgBlock && <div style={{ marginBottom: 10 }}>{sysMsgBlock}</div>}
            <Phone />
          </div>
          <div style={{ flex: '1 1 0', minWidth: 0, paddingTop: 60, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#b0aaa5', letterSpacing: '0.1em', paddingRight: 8, textAlign: 'right', borderRight: '2px solid #c44b3c', userSelect: 'none', marginBottom: 4 }}>INTERVIEWER</span>
            {rightBubbles.map(b => (
              <motion.div key={b.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={allDone ? { opacity: 0, transition: { duration: 0.6, delay: 0.1 } } : undefined}>
                <ChatBubble text={b.text ?? ''} side="right" onComplete={onBubbleComplete} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 移动端（<640px）：无外框全屏聊天 ═══ */}
      {!isWide && (
        <Phone>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderBottom: '1px solid #e0d8c8', background: '#faf7f0', flexShrink: 0,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8e0d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>👤</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>CFPS 受访者</div>
                <div style={{ fontSize: 10, color: '#7a7570', fontFamily: 'var(--font-mono)' }}>██省 · ██村</div>
              </div>
            </div>
            {sysMsgBlock}
            <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(8px, 2vh, 14px) clamp(10px, 3vw, 16px)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dialogs.map((b) => (
                <motion.div key={b.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <ChatBubble text={b.text ?? ''} side={b.side ?? 'left'} onComplete={onBubbleComplete} />
                </motion.div>
              ))}
            </div>
          </div>
        </Phone>
      )}

      {/* 结尾关键词 */}
      <AnimatePresence>
        {endingKeywords && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onAnimationComplete={() => { setTimeout(() => onComplete(), 2500) }}
            transition={{ duration: 1, delay: 1.0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(8px, 2vh, 12px)', marginTop: 'clamp(12px, 3vh, 20px)' }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.1em' }}>{endingKeywords[0]}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 18, height: 1, background: '#c44b3c' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)', color: '#c44b3c', letterSpacing: '0.1em', fontWeight: 600 }}>{endingKeywords[1]}</span>
              <div style={{ width: 18, height: 1, background: '#c44b3c' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
