import { useState, useCallback, useRef, useEffect } from 'react'
import dialogues from '../data/dialogues.json'

/* ================================================================
   useDialogue — 对话编排 Hook
   驱动 dialogues.json 叙事序列逐条播放
   每次只推进一条消息，等待打字完成后才推进下一条
   ================================================================ */

export interface NarrativeItem {
  id: string
  type?: 'phase_label' | 'system' | 'ending'
  speaker?: string
  side?: 'left' | 'right'
  text?: string
  detail?: string
  keywords?: string[]
}

export type ItemKind = 'phase_label' | 'message' | 'system' | 'ending'

function getKind(item: NarrativeItem): ItemKind {
  if (item.type === 'phase_label') return 'phase_label'
  if (item.type === 'system') return 'system'
  if (item.type === 'ending') return 'ending'
  return 'message'
}

const narrative = (dialogues as { narrative: NarrativeItem[] }).narrative

export function useDialogue() {
  const idxRef = useRef(0)
  const lockedRef = useRef(false)
  const [bubbles, setBubbles] = useState<NarrativeItem[]>([])
  const [phaseLabel, setPhaseLabel] = useState<string | null>(null)
  const [systemMsg, setSystemMsg] = useState<{ text: string; detail?: string } | null>(null)
  const [endingKeywords, setEndingKeywords] = useState<string[] | null>(null)
  const [allDone, setAllDone] = useState(false)

  const advance = useCallback(() => {
    if (lockedRef.current) return
    lockedRef.current = true

    const i = idxRef.current
    if (i >= narrative.length) {
      lockedRef.current = false
      return
    }

    const item = narrative[i]!
    const kind = getKind(item)
    idxRef.current = i + 1

    if (kind === 'phase_label') {
      setPhaseLabel(item.text ?? null)
      setSystemMsg(null)
      setBubbles([])
      setTimeout(() => {
        lockedRef.current = false
        advance()
      }, 1000)
      return
    }

    if (kind === 'system') {
      setSystemMsg({ text: item.text ?? '', detail: item.detail })
      setBubbles((prev) => [...prev, item])
      setTimeout(() => {
        lockedRef.current = false
        advance()
      }, 2000)
      return
    }

    if (kind === 'ending') {
      setEndingKeywords(item.keywords ?? null)
      setAllDone(true)
      lockedRef.current = false
      return
    }

    // message — 添加到气泡队列，等待 onBubbleComplete 解锁
    setBubbles((prev) => [...prev, item])
    // lockedRef stays true until onBubbleComplete is called
  }, [])

  /** 当前气泡打字完成后调用，解锁并推进下一条 */
  const onBubbleComplete = useCallback(() => {
    lockedRef.current = false
    setTimeout(() => advance(), 700)
  }, [advance])

  /** 启动 */
  useEffect(() => {
    const timer = setTimeout(() => advance(), 500)
    return () => clearTimeout(timer)
  }, [advance])

  return {
    bubbles,
    phaseLabel,
    systemMsg,
    endingKeywords,
    allDone,
    onBubbleComplete,
  }
}
