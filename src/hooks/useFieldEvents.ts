import { useState, useCallback, useRef } from 'react'
import eventsData from '../data/field_events.json'

/* ================================================================
   useFieldEvents — 田野环境事件触发 Hook
   根据位置/步数/随机概率触发事件，不阻断游戏
   ================================================================ */

export interface FieldEvent {
  id: string
  type: 'environmental' | 'physical' | 'social'
  trigger: {
    eligibleNodes: string[]
    probability: number
    minStep: number
    requiresNpc?: boolean
  }
  narrative: {
    title: string
    body: string
    innerThought: string
    afterThought: string
    journal: string
  }
  visual: {
    effect: 'none' | 'shake' | 'bleach' | 'dust'
    intensity: 'none' | 'light' | 'medium'
  }
  duration: number
}

interface RawData {
  events: FieldEvent[]
}

const raw = eventsData as unknown as RawData
const allEvents = raw.events

/** 与事件关联的节点状态（由调用方传入） */
export interface EventContext {
  currentNodeId: string
  stepCount: number
  hasNpc: boolean
  weatherModifier?: number
}

export function useFieldEvents() {
  const [activeEvent, setActiveEvent] = useState<FieldEvent | null>(null)
  const triggeredRef = useRef<Set<string>>(new Set()) // 已触发过的事件 ID
  const cooldownRef = useRef(false)

  /** 尝试在当前节点触发事件 */
  const tryTrigger = useCallback(
    (ctx: EventContext) => {
      if (cooldownRef.current || activeEvent) return null

      const candidates = allEvents.filter((ev) => {
        // 已触发过不再触发
        if (triggeredRef.current.has(ev.id)) return false
        // 节点必须匹配
        if (!ev.trigger.eligibleNodes.includes(ctx.currentNodeId)) return false
        // 步数要求
        if (ctx.stepCount < ev.trigger.minStep) return false
        // NPC 要求
        if (ev.trigger.requiresNpc && !ctx.hasNpc) return false
        return true
      })

      if (candidates.length === 0) return null

      // 按概率随机选择（天气修正）
      const mod = ctx.weatherModifier ?? 1
      for (const ev of candidates) {
        if (Math.random() < ev.trigger.probability * mod) {
          triggeredRef.current.add(ev.id)
          cooldownRef.current = true
          setActiveEvent(ev)
          // 不再自动关闭——用户点击屏幕后才消失
          return ev
        }
      }

      return null
    },
    [activeEvent],
  )

  const dismissEvent = useCallback(() => {
    setActiveEvent(null)
    setTimeout(() => {
      cooldownRef.current = false
    }, 2000)
  }, [])

  return { activeEvent, tryTrigger, dismissEvent }
}
