import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================
   Scene 1 — Thinking 思考转场
   访员挂断电话后的内心叙事：
   地址片段 → 受访者回响 → 田野现实 → 决定出发
   ================================================================ */

export interface ThinkingProps {
  onComplete: () => void
}

export function Thinking({ onComplete }: ThinkingProps) {
  const [phase, setPhase] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const schedule = [1800, 3600, 5800, 8000, 10500]

    const next = schedule.find((t) => t > phase * 1000)
    if (next === undefined) return

    timerRef.current = setTimeout(() => {
      setPhase((p) => p + 1)
    }, next - phase * 1000)

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [phase])

  // 最后阶段结束后自动跳转
  useEffect(() => {
    if (phase >= 4) {
      timerRef.current = setTimeout(() => onComplete(), 2500)
      return () => {
        if (timerRef.current !== null) clearTimeout(timerRef.current)
      }
    }
  }, [phase, onComplete])

  return (
    <div
      style={{
        minHeight: '100svh',
        background: '#141210',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 背景网格 — 暗示测绘/规划 */}
      <GridLines />

      {/* ── Phase 0: 地址碎片 ── */}
      <AnimatePresence>
        {phase >= 0 && (
          <motion.div
            key="village-name"
            initial={{ opacity: 0, scale: 1.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 10vw, 64px)',
              fontWeight: 700,
              color: '#e8e4dc',
              letterSpacing: '0.2em',
              marginBottom: 16,
            }}
          >
            █村
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase 1: 地址信息不足 ── */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            key="address-insufficient"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}
          >
            <div style={{ width: 40, height: 1, background: '#c44b3c' }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: '#c44b3c',
              letterSpacing: '0.14em',
              fontWeight: 600,
            }}>
              地址信息不足
            </span>
            <div style={{ width: 40, height: 1, background: '#c44b3c' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase 2: 受访者的回响 ── */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            key="respondent-echo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              marginBottom: 40,
            }}
          >
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#7a7570',
              letterSpacing: '0.1em',
            }}>
              通话记录 · 最后一句
            </span>
            <div style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '14px 22px',
              background: 'rgba(255,255,255,0.03)',
              maxWidth: 380,
              textAlign: 'center',
            }}>
              <p style={{
                fontFamily: 'var(--font-dialogue)',
                fontSize: 17,
                color: '#c0b8a8',
                lineHeight: 1.8,
                margin: 0,
              }}>
                "你到了直接问就知道了。"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase 3: 田野现实 — 纪录片旁白 ── */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            key="field-reality"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              marginBottom: 40,
              maxWidth: 440,
              textAlign: 'center',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}>
              <div style={{ width: 16, height: 1, background: 'rgba(255,255,255,0.15)' }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: '#7a7570',
                letterSpacing: '0.08em',
              }}>
                田野笔记
              </span>
              <div style={{ width: 16, height: 1, background: 'rgba(255,255,255,0.15)' }} />
            </div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: '#9a9590',
              lineHeight: 1.9,
              margin: 0,
            }}>
              农村的地址系统与城市不同。<br />
              门牌号确实有，但居民很少记得自己家是几号，<br />
              编号也时有变动。在地图 App 上搜一个门牌号，<br />
              往往定位不到任何地方。<br />
              <span style={{ color: '#c0b8a8' }}>
                唯一的定位方式，是走到村里，开口问人。
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase 4: 决定 — 亲自寻找 ── */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div
            key="decision"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 700,
              color: '#e8e4dc',
              letterSpacing: '0.12em',
            }}>
              亲自寻找
            </span>
            <div style={{
              width: 60,
              height: 1,
              background: '#c44b3c',
              marginTop: 4,
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部进度指示 */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 40,
          display: 'flex',
          gap: 8,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            style={{
              width: 20,
              height: 1.5,
              background: i <= phase ? '#c44b3c' : 'rgba(255,255,255,0.1)',
            }}
            animate={i === phase ? { opacity: [0.4, 1, 0.4] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        ))}
      </motion.div>
    </div>
  )
}

/* ── 背景测绘网格 ── */
function GridLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      opacity="0.06"
    >
      <defs>
        <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#ffffff" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* 交叉点强调 — 随机散布的圆点 */}
      {[
        [120, 350], [400, 200], [680, 500], [920, 280],
        [1100, 420], [280, 600], [760, 680], [540, 400],
        [1300, 560], [160, 480], [1000, 640], [860, 140],
        [440, 720], [720, 340], [1160, 220],
      ].map(([cx, cy], i) => (
        <motion.circle
          key={i}
          cx={cx} cy={cy} r={2}
          fill="#ffffff"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.6, delay: 0.8 + i * 0.08 }}
        />
      ))}
    </svg>
  )
}
