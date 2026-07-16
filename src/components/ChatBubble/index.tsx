import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export interface ChatBubbleProps {
  text: string
  side: 'left' | 'right'
  onComplete?: () => void
  typingSpeed?: number
}

export function ChatBubble({ text, side, onComplete, typingSpeed = 40 }: ChatBubbleProps) {
  const [displayedChars, setDisplayedChars] = useState(0)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => { setDisplayedChars(0); completedRef.current = false }, [text])

  useEffect(() => {
    if (displayedChars >= text.length) {
      if (!completedRef.current) {
        completedRef.current = true
        const timer = setTimeout(() => onCompleteRef.current?.(), 300)
        return () => clearTimeout(timer)
      }
      return
    }
    const timer = setTimeout(() => setDisplayedChars(p => p + 1), typingSpeed)
    return () => clearTimeout(timer)
  }, [displayedChars, text.length, typingSpeed])

  const isMine = side === 'right'

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div style={{
        maxWidth: '82%',
        padding: '10px 14px',
        background: isMine ? '#2c2c2c' : '#ffffff',
        color: isMine ? '#e8e4dc' : '#1a1a1a',
        borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        fontSize: 'clamp(14px, 3.5vw, 15px)',
        lineHeight: 1.75,
        fontFamily: isMine ? 'var(--font-body)' : 'var(--font-dialogue)',
        boxShadow: isMine ? '0 1px 3px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.04)',
        wordBreak: 'break-word',
        border: isMine ? 'none' : '1px solid #ede6da',
        overflowWrap: 'anywhere',
      }}>
        {text.slice(0, displayedChars)}
        {displayedChars < text.length && (
          <span style={{
            display: 'inline-block', width: 2, height: 14,
            background: isMine ? '#c44b3c' : '#c0b8a8',
            marginLeft: 1, verticalAlign: 'text-bottom',
            animation: 'blink-cursor 0.8s step-end infinite',
          }} />
        )}
      </div>
    </motion.div>
  )
}
