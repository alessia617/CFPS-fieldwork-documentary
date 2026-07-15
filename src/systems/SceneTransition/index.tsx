import { type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { TransitionType } from '../SceneStateMachine'

/* ================================================================
   SceneTransition — 统一转场动画
   ================================================================ */

interface SceneTransitionProps {
  children: ReactNode
  sceneKey: string
  transitionType: TransitionType
}

/** variant 查找表 */
function getVariant(type: TransitionType) {
  switch (type) {
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.5, ease: 'easeInOut' as const },
      }
    case 'fadeSlow':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 1.0, ease: 'easeInOut' as const },
      }
    case 'slideLeft':
      return {
        initial: { opacity: 0, x: 80 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -80 },
        transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] as const },
      }
    case 'slideRight':
      return {
        initial: { opacity: 0, x: -80 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 80 },
        transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] as const },
      }
    case 'zoomIn':
      return {
        initial: { opacity: 0, scale: 0.85 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.1 },
        transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] as const },
      }
    case 'zoomOut':
      return {
        initial: { opacity: 0, scale: 1.1 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.85 },
        transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] as const },
      }
    case 'phoneEnter':
      return {
        initial: { opacity: 0, y: 60, scale: 0.85 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
        transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
      }
    case 'phoneExit':
      return {
        initial: { opacity: 0, y: 40, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -30, scale: 0.9 },
        transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
      }
  }
}

export function SceneTransition({
  children,
  sceneKey,
  transitionType,
}: SceneTransitionProps) {
  const v = getVariant(transitionType)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sceneKey}
        initial={v.initial}
        animate={v.animate}
        exit={v.exit}
        transition={v.transition}
        style={{ width: '100%', minHeight: '100svh' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
