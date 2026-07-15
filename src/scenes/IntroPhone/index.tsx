import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ChatBubble } from '../../components'
import { useDialogue } from '../../hooks/useDialogue'
import type { NarrativeItem } from '../../hooks/useDialogue'

/* ================================================================
   Scene 0 — IntroPhone《预约确认》
   三栏居中：RESPONDENT | 通话手机 | INTERVIEWER
   ================================================================ */

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

/* ================================================================
   FloatLayer — 三栏居中
   ================================================================ */
function FloatLayer({
  bubbles,
  phaseLabel,
  systemMsg,
  endingKeywords,
  allDone,
  onBubbleComplete,
  onSceneComplete,
}: {
  bubbles: NarrativeItem[]
  phaseLabel: string | null
  systemMsg: { text: string; detail?: string } | null
  endingKeywords: string[] | null
  allDone: boolean
  onBubbleComplete: () => void
  onSceneComplete: () => void
}) {
  const leftBubbles = bubbles.filter((b) => b.side === 'left')
  const rightBubbles = bubbles.filter((b) => b.side === 'right')

  return (
    <div className="absolute inset-0 flex items-start justify-center" style={{ paddingTop: '60px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 290px 1fr',
          width: '100%',
          maxWidth: 1100,
          gap: 0,
        }}
      >
        {/* ═══ 左栏 — RESPONDENT ═══ */}
        <div style={{ paddingRight: 20, paddingTop: 80 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10, color: '#b0aaa5', letterSpacing: '0.1em',
            marginBottom: 14, paddingLeft: 8,
            borderLeft: '2px solid #c0b8a8', userSelect: 'none',
          }}>
            RESPONDENT
          </div>

          <AnimatePresence>
            {phaseLabel && (
              <motion.div
                key={phaseLabel}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                style={{ marginBottom: 14 }}
              >
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10, color: '#7a7570', letterSpacing: '0.1em',
                  border: '1px solid #d8d0c4', padding: '2px 10px',
                  borderRadius: 2, background: 'rgba(232, 224, 208, 0.4)',
                }}>
                  【{phaseLabel}】
                </span>
              </motion.div>
            )}

            {leftBubbles.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={allDone ? { opacity: 0, transition: { duration: 0.6, delay: 0.1 } } : undefined}
                style={{ marginBottom: 16 }}
              >
                <ChatBubble
                  text={b.text ?? ''}
                  side="left"
                  onComplete={onBubbleComplete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ═══ 中栏 — 手机 + 系统消息 ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 30 }}>
          <AnimatePresence>
            {systemMsg && (
              <motion.div
                key={systemMsg.text}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ marginBottom: 16 }}
              >
                <div style={{
                  border: '1.5px solid #6b8a5a',
                  padding: '7px 16px',
                  background: 'rgba(107, 138, 90, 0.06)',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, color: '#6b8a5a', fontWeight: 600,
                    letterSpacing: '0.08em',
                    marginBottom: systemMsg.detail ? 3 : 0,
                  }}>
                    ✓ {systemMsg.text}
                  </div>
                  {systemMsg.detail && (
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10, color: '#8aa678', letterSpacing: '0.06em',
                    }}>
                      {systemMsg.detail}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Phone tilt={6} />

          <AnimatePresence>
            {endingKeywords && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onAnimationComplete={() => {
                  setTimeout(() => onSceneComplete(), 2500)
                }}
                transition={{ duration: 1, delay: 1.0 }}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 12, marginTop: 20,
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 24, fontWeight: 700, color: '#1a1a1a',
                  letterSpacing: '0.1em',
                }}>
                  {endingKeywords[0]}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 18, height: 1, background: '#c44b3c' }} />
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, color: '#c44b3c',
                    letterSpacing: '0.1em', fontWeight: 600,
                  }}>
                    {endingKeywords[1]}
                  </span>
                  <div style={{ width: 18, height: 1, background: '#c44b3c' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ 右栏 — INTERVIEWER ═══ */}
        <div style={{ paddingLeft: 20, paddingTop: 80 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10, color: '#b0aaa5', letterSpacing: '0.1em',
            marginBottom: 14, paddingRight: 8, textAlign: 'right',
            borderRight: '2px solid #c44b3c', userSelect: 'none',
          }}>
            INTERVIEWER
          </div>

          <AnimatePresence>
            {rightBubbles.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={allDone ? { opacity: 0, transition: { duration: 0.6, delay: 0.1 } } : undefined}
                style={{ marginBottom: 16 }}
              >
                <ChatBubble
                  text={b.text ?? ''}
                  side="right"
                  onComplete={onBubbleComplete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
