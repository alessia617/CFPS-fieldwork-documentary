import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

/* ================================================================
   Phone — 桌面 45° 展览模式 / 移动端全屏沉浸聊天
   ================================================================ */

export interface PhoneProps {
  children?: ReactNode
}

export function Phone({ children }: PhoneProps) {

  return (
    <>
      {/* ═══ 桌面：45° 悬浮手机 (≥640px) ═══ */}
      <motion.div
        className="phone-desktop"
        initial={{ rotate: 8, scale: 0.88, opacity: 0, y: 30 }}
        animate={{ rotate: 8, scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.15, ease: 'easeOut' }}
        style={{ margin: '0 auto' }}
      >
        <div style={{
          width: 280,
          background: '#26211c',
          borderRadius: 28,
          padding: 10,
          margin: '0 auto',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        }}>
          <div style={{
            width: 44, height: 3, background: '#1a1510',
            borderRadius: 2, margin: '4px auto 8px',
          }} />
          <div style={{
            background: '#f5f0e8', borderRadius: 20, overflow: 'hidden',
            display: 'flex', flexDirection: 'column', height: 460,
          }}>
            <StatusBar />
            {children ?? <CallScreen />}
          </div>
        </div>
        <div style={{
          width: 220, height: 12, margin: '10px auto 0',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </motion.div>

      {/* ═══ 移动端：无外框全屏聊天 (<640px) ═══ */}
      <motion.div
        className="phone-mobile"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        style={{
          width: '100%', height: '100svh',
          background: '#f5f0e8',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <StatusBar />
        {children ?? <CallScreen />}
      </motion.div>

      <style>{`
        @media (min-width: 640px) { .phone-mobile { display: none !important; } }
        @media (max-width: 639px) { .phone-desktop { display: none !important; } }
      `}</style>
    </>
  )
}

/* ── 状态栏 ── */
function StatusBar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px 4px', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#7a7570' }}>
      <span>10:14</span>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        <svg width="12" height="9" viewBox="0 0 14 11" fill="none">
          <rect x="0" y="3" width="2" height="8" rx="0.5" fill="#7a7570" />
          <rect x="3" y="1.5" width="2" height="9.5" rx="0.5" fill="#7a7570" />
          <rect x="6" y="0" width="2" height="11" rx="0.5" fill="#7a7570" />
          <rect x="9" y="2" width="2" height="9" rx="0.5" fill="#d8d0c4" />
        </svg>
        <span>中国移动</span>
        <div style={{ width: 18, height: 8, border: '1px solid #7a7570', borderRadius: 2, position: 'relative' }}>
          <div style={{ width: 12, height: 4, background: '#6b8a5a', borderRadius: 1, position: 'absolute', right: 1, top: 1 }} />
        </div>
      </div>
    </div>
  )
}

/* ── 通话中界面 ── */
export function CallScreen() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, paddingBottom: 20 }}>
      <motion.div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e8e0d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        👤
      </motion.div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', opacity: 0.7 }}>CFPS 受访者</div>
        <div style={{ fontSize: 11, color: '#7a7570', opacity: 0.5, marginTop: 2 }}>██省 · ██村</div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6b8a5a', display: 'flex', alignItems: 'center', gap: 6 }}>
        <motion.span style={{ width: 5, height: 5, borderRadius: '50%', background: '#6b8a5a', display: 'inline-block' }}
          animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
        语音通话转文字 · 进行中
      </div>
    </div>
  )
}
