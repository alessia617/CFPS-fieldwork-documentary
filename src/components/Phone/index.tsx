import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

/* ================================================================
   Phone — 通话中的手机外观
   屏幕上显示"正在通话"，气泡溢出到外部
   ================================================================ */

export interface PhoneProps {
  /** 屏幕内部子内容（可选） */
  children?: ReactNode
  /** 倾斜角度 */
  tilt?: number
}

export function Phone({ children }: PhoneProps) {
  return (
    <motion.div
      initial={{ rotate: 15, scale: 0.75, opacity: 0, y: 40 }}
      animate={{ rotate: 0, scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 1.0, delay: 0.2, type: 'spring', stiffness: 70, damping: 14 }}
      style={{ margin: '0 auto' }}
    >
      {/* 手机外壳 — 移动端 80vw max, 桌面 290px fixed, 轻阴影 */}
      <div
        style={{
          width: 'min(80vw, 290px)',
          background: '#26211c',
          borderRadius: 28,
          padding: 10,
          boxShadow:
            '0 3px 12px rgba(0,0,0,0.20), 0 1px 4px rgba(0,0,0,0.12)',
          position: 'relative',
          margin: '0 auto',
        }}
      >
        {/* 侧边物理按钮 */}
        <SideButton right={-2} top={90} height={42} />
        <SideButton left={-2} top={80} height={26} />
        <SideButton left={-2} top={114} height={26} />

        {/* 顶部听筒 */}
        <div
          style={{
            width: 44,
            height: 3,
            background: '#1a1510',
            borderRadius: 2,
            margin: '4px auto 8px',
          }}
        />

        {/* 屏幕 */}
        <div
          style={{
            background: '#f5f0e8',
            borderRadius: 20,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: 'clamp(380px, 88vh, 460px)',
          }}
        >
          {/* 顶部状态栏 */}
          <StatusBar />

          {/* 通话界面 或 子内容 */}
          {children ?? <CallScreen />}
        </div>
      </div>

      {/* 地面阴影 */}
      <div
        style={{
          width: 'min(80%, 240px)',
          height: 16,
          margin: '12px auto 0',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
    </motion.div>
  )
}

/* ── 状态栏 ── */
function StatusBar() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px 4px',
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        color: '#7a7570',
      }}
    >
      <span>10:14</span>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        <SignalBars />
        <span>中国移动</span>
        <BatteryIcon />
      </div>
    </div>
  )
}

function SignalBars() {
  return (
    <svg width="12" height="9" viewBox="0 0 14 11" fill="none">
      <rect x="0" y="3" width="2" height="8" rx="0.5" fill="#7a7570" />
      <rect x="3" y="1.5" width="2" height="9.5" rx="0.5" fill="#7a7570" />
      <rect x="6" y="0" width="2" height="11" rx="0.5" fill="#7a7570" />
      <rect x="9" y="2" width="2" height="9" rx="0.5" fill="#d8d0c4" />
    </svg>
  )
}

function BatteryIcon() {
  return (
    <div
      style={{
        width: 18,
        height: 8,
        border: '1px solid #7a7570',
        borderRadius: 2,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: 12,
          height: 4,
          background: '#6b8a5a',
          borderRadius: 1,
          position: 'absolute',
          right: 1,
          top: 1,
        }}
      />
    </div>
  )
}

/* ── 通话中界面 ── */
export function CallScreen() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingBottom: 24,
      }}
    >
      {/* 头像 */}
      <motion.div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#e8e0d0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        👤
      </motion.div>

      {/* 受访者信息 */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: 2,
            opacity: 0.6,
          }}
        >
          CFPS 受访者
        </div>
        <div
          style={{
            fontSize: 11,
            color: '#7a7570',
            opacity: 0.5,
          }}
        >
          ██省 · ██村
        </div>
      </div>

      {/* 通话计时 */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#6b8a5a',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <motion.span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#6b8a5a',
            display: 'inline-block',
          }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        语音通话转文字 · 进行中
      </div>

      {/* 操作按钮区 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
          marginTop: 10,
          padding: '0 20px',
        }}
      >
        {/* 静音 */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: '#e8e0d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7a7570" strokeWidth="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        </div>

        {/* 挂断 */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#c44b3c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(135deg)',
            boxShadow: '0 2px 10px rgba(196, 75, 60, 0.35)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>

        {/* 扬声器 */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: '#e8e0d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7a7570" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        </div>
      </div>
    </div>
  )
}

/* ── 侧边按钮 ── */
function SideButton({ left, right, top, height }: {
  left?: number; right?: number; top: number; height: number
}) {
  return (
    <div
      style={{
        position: 'absolute',
        ...(left !== undefined ? { left } : { right }),
        top,
        width: 2,
        height,
        background: '#1a1510',
        borderRadius: left !== undefined ? '2px 0 0 2px' : '0 2px 2px 0',
      }}
    />
  )
}
