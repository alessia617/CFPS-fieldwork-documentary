import { motion, AnimatePresence } from 'framer-motion'
import type { FieldEvent } from '../../hooks/useFieldEvents'

/* ================================================================
   FieldEventOverlay — 田野事件浮层
   纪录片旁白风格：标题 → 正文 → 内心独白 → 田野笔记
   ================================================================ */

export interface FieldEventOverlayProps {
  event: FieldEvent | null
  onDismiss: () => void
}

export function FieldEventOverlay({ event, onDismiss }: FieldEventOverlayProps) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key={event.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          onClick={onDismiss}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          {/* 半透明暗底 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10, 8, 6, 0.55)',
              pointerEvents: 'none',
            }}
          />

          {/* ── 视觉特效 ── */}
          {event.visual.effect === 'shake' && <ShakeEffect />}
          {event.visual.effect === 'bleach' && <BleachEffect intensity={event.visual.intensity} />}

          {/* ── 叙事内容 ── */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            style={{
              position: 'relative',
              maxWidth: 480,
              padding: '0 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* 事件标题 */}
            <TypewriterLine
              text={event.narrative.title}
              delay={0}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 700,
                color: '#e8e4dc',
                letterSpacing: '0.08em',
              }}
            />

            {/* 事件正文 */}
            <TypewriterLine
              text={event.narrative.body}
              delay={800}
              style={{
                fontFamily: 'var(--font-dialogue)',
                fontSize: 15,
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.8,
              }}
            />

            {/* 访员内心 */}
            <TypewriterLine
              text={event.narrative.innerThought}
              delay={2000}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: 'rgba(255,255,255,0.5)',
                fontStyle: 'italic',
              }}
            />

            {/* 纪录片旁白 */}
            <TypewriterLine
              text={event.narrative.afterThought}
              delay={3200}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.06em',
              }}
            />

            {/* 点击任意处继续 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5, duration: 0.8 }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(11px, 2.8vw, 13px)',
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.1em',
                marginTop: 12,
                pointerEvents: 'none',
              }}
            >
              点击任意处继续
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── 打字机逐字 ── */
function TypewriterLine({
  text, delay, style,
}: {
  text: string; delay: number; style: React.CSSProperties
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay / 1000, duration: 0.4 }}
      style={style}
    >
      {text}
    </motion.div>
  )
}

/* ── 狗叫震动效果 ── */
function ShakeEffect() {
  return (
    <motion.div
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(196, 75, 60, 0.04)',
      }}
      animate={{ x: [-4, 4, -3, 3, -2, 1, 0] }}
      transition={{ duration: 0.5, delay: 0.1 }}
    />
  )
}

/* ── 暴晒泛白效果 ── */
function BleachEffect({ intensity }: { intensity: string }) {
  return (
    <motion.div
      style={{
        position: 'absolute', inset: 0,
        background: intensity === 'medium'
          ? 'rgba(255, 250, 235, 0.12)'
          : 'rgba(255, 250, 235, 0.08)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    />
  )
}
