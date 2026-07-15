import { AnimatePresence, motion } from 'framer-motion'
import { ChatBubble } from '../ChatBubble'
import { useDialogue } from '../../hooks/useDialogue'

/* ================================================================
   Dialogue — 对话组件（内部渲染版）
   使用 useDialogue hook，在组件内部自行布局气泡
   适用于需要将对话放在固定容器内的场景
   ================================================================ */

export function Dialogue() {
  const {
    bubbles,
    phaseLabel,
    systemMsg,
    endingKeywords,
    allDone,
    onBubbleComplete,
  } = useDialogue()

  return (
    <div
      style={{
        padding: '14px 14px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        background: '#f5f0e8',
        position: 'relative',
        minHeight: 440,
      }}
    >
      <AnimatePresence>
        {phaseLabel && (
          <motion.div
            key={phaseLabel}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '2px 0 4px',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#7a7570',
              letterSpacing: '0.12em',
              border: '1px solid #d8d0c4',
              padding: '3px 12px',
              borderRadius: 2,
              background: 'rgba(232, 224, 208, 0.4)',
            }}>
              【{phaseLabel}】
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {systemMsg && (
          <motion.div
            key={systemMsg.text}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '6px 0',
              margin: '2px 0',
            }}
          >
            <div style={{
              border: '1.5px solid #6b8a5a',
              padding: '8px 18px',
              background: 'rgba(107, 138, 90, 0.05)',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: '#6b8a5a',
                fontWeight: 600,
                letterSpacing: '0.08em',
                marginBottom: systemMsg.detail ? 4 : 0,
              }}>
                ✓ {systemMsg.text}
              </div>
              {systemMsg.detail && (
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: '#8aa678',
                  letterSpacing: '0.06em',
                }}>
                  {systemMsg.detail}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bubbles
          .filter((b) => b.type !== 'system' && b.type !== 'ending')
          .map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={allDone ? { opacity: 0, transition: { duration: 0.8, delay: 0.2 } } : undefined}
            >
              <ChatBubble
                text={b.text ?? ''}
                side={b.side ?? 'left'}
                onComplete={onBubbleComplete}
              />
            </motion.div>
          ))}
      </AnimatePresence>

      <AnimatePresence>
        {endingKeywords && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              padding: '30px 0',
              position: 'absolute',
              bottom: 24,
              left: 0,
              right: 0,
            }}
          >
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 700,
              color: '#1a1a1a',
              letterSpacing: '0.1em',
            }}>
              {endingKeywords[0]}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 24, height: 1, background: '#c44b3c' }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: '#c44b3c',
                letterSpacing: '0.12em',
                fontWeight: 600,
              }}>
                {endingKeywords[1]}
              </span>
              <div style={{ width: 24, height: 1, background: '#c44b3c' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
