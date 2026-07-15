import { useState, useCallback, useMemo } from 'react'
import npcDialogues from '../data/npc_dialogues.json'

/* ================================================================
   useNpcDialogue — NPC 询问对话 Hook
   管理对话树遍历、选项分支、信任度、线索获取
   ================================================================ */

export interface NpcNode {
  speaker: 'npc' | 'player'
  text: string
  dialectNote?: string
  dialectClue?: string
  next?: string | null
  options?: NpcOption[]
  action?: NpcAction
}

interface NpcOption {
  label: string
  next: string
  condition?: string
}

interface NpcAction {
  type: string
  clue?: string
  trustDelta?: number
}

interface NpcDialogueTree {
  name: string
  occupation: string
  dialectLevel?: number
  nodes: Record<string, NpcNode>
  startNode: string
}

type NpcDialoguesData = Record<string, NpcDialogueTree>
const data = npcDialogues as unknown as NpcDialoguesData

export interface NpcConversationState {
  npcName: string
  npcOccupation: string
  currentNode: NpcNode
  options: NpcOption[]
  trust: number
  clueObtained: string | null
  isEnded: boolean
}

export function useNpcDialogue(npcId: string) {
  const tree = data[npcId]
  if (!tree) throw new Error(`Unknown NPC: ${npcId}`)

  const [nodeId, setNodeId] = useState(tree.startNode)
  const [trust, setTrust] = useState(50)
  const [clueObtained, setClueObtained] = useState<string | null>(null)
  const [appliedActions, setAppliedActions] = useState<Set<string>>(new Set())

  const nodeMap = useMemo(() => tree.nodes, [tree])

  const currentNode = useMemo((): NpcNode => {
    return nodeMap[nodeId] ?? fallbackNode
  }, [nodeId, nodeMap])

  const options = useMemo((): NpcOption[] => {
    return currentNode.options ?? []
  }, [currentNode])

  const isEnded = currentNode.next === null && options.length === 0

  /** 推进到下一节点（线性推进） */
  const advance = useCallback(() => {
    if (currentNode.options && currentNode.options.length > 0) {
      // 有选项时不自动推进，等玩家选择
      return
    }

    const nextId = currentNode.next
    if (!nextId || !nodeMap[nextId]) {
      // 对话结束
      return
    }

    const nextNode = nodeMap[nextId]!

    // 执行 action
    if (nextNode.action && !appliedActions.has(nextId)) {
      setAppliedActions((p) => new Set([...p, nextId]))
      const a = nextNode.action
      if (a.clue) setClueObtained(a.clue)
      if (a.trustDelta) setTrust((t) => Math.max(0, Math.min(100, t + (a.trustDelta ?? 0))))
    }

    setNodeId(nextId)
  }, [currentNode, nodeMap, appliedActions])

  /** 玩家选择分支选项 */
  const chooseOption = useCallback(
    (option: NpcOption) => {
      const nextId = option.next
      if (!nextId || !nodeMap[nextId]) return

      const nextNode = nodeMap[nextId]!

      // 执行 action
      if (nextNode.action && !appliedActions.has(nextId)) {
        setAppliedActions((p) => new Set([...p, nextId]))
        const a = nextNode.action
        if (a.clue) setClueObtained(a.clue)
        if (a.trustDelta) setTrust((t) => Math.max(0, Math.min(100, t + (a.trustDelta ?? 0))))
      }

      setNodeId(nextId)
    },
    [nodeMap, appliedActions],
  )

  return {
    npcName: tree.name,
    npcOccupation: tree.occupation,
    dialectLevel: tree.dialectLevel ?? 0,
    currentNode,
    options,
    trust,
    clueObtained,
    isEnded,
    advance,
    chooseOption,
  }
}

const fallbackNode: NpcNode = {
  speaker: 'npc',
  text: '……',
  next: null,
}
