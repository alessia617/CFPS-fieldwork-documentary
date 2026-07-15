import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/* ================================================================
   ChatBubble — 单条对话气泡
   打字机逐字效果 · 访员深色/受访者浅色
   ================================================================ */

export interface ChatBubbleProps {
  text: string
  side: 'left' | 'right'
  onComplete?: () => void
  typingSpeed?: number
}

export function ChatBubble({
  text,
  side,
  onComplete,
  typingSpeed = 40,
}: ChatBubbleProps) {
  const [displayedChars, setDisplayedChars] = useState(0)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    setDisplayedChars(0)
    completedRef.current = false
  }, [text])

  useEffect(() => {
    if (displayedChars >= text.length) {
      if (!completedRef.current) {
        completedRef.current = true
        const timer = setTimeout(() => onCompleteRef.current?.(), 300)
        return () => clearTimeout(timer)
      }
      return
    }

    const timer = setTimeout(() => {
      setDisplayedChars((prev) => prev + 1)
    }, typingSpeed)

    return () => clearTimeout(timer)
  }, [displayedChars, text.length, typingSpeed])

  const isInterviewer = side === 'right'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* 气泡 */}
      <div
        style={{
          padding: '10px 14px',
          background: isInterviewer ? '#2c2c2c' : '#ffffff',
          color: isInterviewer ? '#e8e4dc' : '#1a1a1a',
          borderRadius: isInterviewer ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
          fontSize: 'clamp(14px, 4vw, 16px)',
          lineHeight: 1.8,
          fontFamily: isInterviewer ? 'var(--font-body)' : 'var(--font-dialogue)',
          boxShadow: isInterviewer
            ? '0 2px 6px rgba(0,0,0,0.15)'
            : '0 1px 4px rgba(0,0,0,0.06)',
          wordBreak: 'break-word',
          border: isInterviewer ? 'none' : '1px solid #e8e0d0',
        }}
      >
        {text.slice(0, displayedChars)}
        {displayedChars < text.length && (
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: 15,
              background: isInterviewer ? '#c44b3c' : '#c0b8a8',
              marginLeft: 1,
              verticalAlign: 'text-bottom',
              animation: 'blink-cursor 0.8s step-end infinite',
            }}
          />
        )}
      </div>
    </motion.div>
  )
}
