import { useState, useCallback, useMemo, useRef } from 'react'
import routesJson from '../data/routes.json'

/* ================================================================
   useVillageExploration v3 — 真实农村空间探索
   - 25+ 节点 VillageGraph
   - 随机目标 + 随机 NPC 位置 + 随机阻断
   - 线索系统（概率而非确定性）
   - 天气系统
   - 无效节点（空院子、山坡等）
   - 玩家只看到当前第一人称视图
   ================================================================ */

const SEED = Date.now()
let _rng = SEED
function rng(): number {
  _rng = (_rng * 16807 + 0) % 2147483647
  return _rng / 2147483647
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]!
}

/* ── 原始数据类型 ── */
interface RawNode {
  id: string; name: string; type: string; area: string; description: string
  x: number; y: number
  neighbors: string[]
  npcPool?: string[]; cluePool?: string[]; clueProbability?: number
  visual: string
}
interface RawData {
  nodes: RawNode[]
  startNode: string
  npcDefs: Record<string, { name: string; occupation: string; dialectLevel: number; dialogueRoot: string }>
  clueReliability: { defaultReliability: number; highReliabilityNodes: Record<string, number>; lowReliabilityNodes: Record<string, number> }
  weather: { types: Array<{ id: string; label: string; weight: number; eventModifier: number }> }
  randomization: { blockProbability: number; blockablePairs: string[][]; blockReasons: string[] }
}
const raw = routesJson as unknown as RawData

/* ── 导出类型 ── */
export interface VillageNode {
  id: string; name: string; type: string; area: string; description: string
  x: number; y: number
  neighbors: string[]
  npcsHere: NpcInfo[]
  activeClue: string | null
  clueProbability: number
  visual: string
}
export interface NpcInfo {
  id: string; name: string; occupation: string; dialectLevel: number
}
export interface VisiblePath {
  nodeId: string; name: string; direction: string; distance: string
  npcCount: number; clueLikelihood: string
  blocked: boolean; blockReason?: string; visited: boolean
}
export interface VisibleLandmark {
  nodeId: string; name: string; direction: string; distance: string; visited: boolean
}
export interface ClueRecord {
  text: string; reliability: number; source: string
}
export interface NodeView {
  currentNode: VillageNode; paths: VisiblePath[]
  landmarks: VisibleLandmark[]
}

/* ── 工具 ── */
function getDir(f: { x: number; y: number }, t: { x: number; y: number }): string {
  const dx = t.x - f.x; const dy = t.y - f.y
  const a = Math.atan2(dy, dx)
  if (a > -0.75 && a <= 0.75) return '东'; if (a > 0.75 && a <= 2.25) return '南'
  if (a > 2.25 || a <= -2.25) return '西'; return '北'
}
function getDist(f: { x: number; y: number }, t: { x: number; y: number }): string {
  const d = Math.sqrt((t.x - f.x) ** 2 + (t.y - f.y) ** 2)
  if (d < 0.06) return '就在旁边'; if (d < 0.12) return '很近'
  if (d < 0.22) return '走一小段路'; return '比较远'
}
function clueLikelihood(p: number): string {
  if (p >= 0.7) return '很可能有线索'; if (p >= 0.4) return '可能有线索'
  if (p >= 0.15) return '不太可能有线索'; return '没有线索'
}

let _persistSteps = 0
let _persistClues: ClueRecord[] = []
let _persistVisited: Set<string> | null = null

export function useVillageExploration() {
  /* ── 一次性随机初始化 ── */
  const init = useRef<{
    nodeMap: Map<string, RawNode>; blocked: Set<string>
    targetId: string; weather: { id: string; label: string; eventModifier: number }
  } | null>(null)

  if (!init.current) {
    const nodeMap = new Map(raw.nodes.map((n) => [n.id, n]))
    // 随机选一个住宅节点作为目标（排除空节点）
    const residential = raw.nodes.filter((n) => n.type === 'residential')
    const targetId = pick(residential).id
    // 天气
    const totalW = raw.weather.types.reduce((s, t) => s + t.weight, 0)
    let wr = rng() * totalW
    let weather = raw.weather.types[0]!
    for (const w of raw.weather.types) { wr -= w.weight; if (wr <= 0) { weather = w; break } }
    // 阻断
    const blocked = new Set<string>()
    for (const [a, b] of raw.randomization.blockablePairs) {
      if (rng() < raw.randomization.blockProbability) {
        blocked.add(`${a}->${b}`); blocked.add(`${b}->${a}`)
      }
    }
    init.current = { nodeMap, blocked, targetId, weather }
  }
  const { blocked, targetId, weather } = init.current

  /* ── 附加 NPC 数据到节点 ── */
  const enrichedMap = useMemo(() => {
    const m = new Map<string, VillageNode>()
    for (const rn of raw.nodes) {
      const npcsHere: NpcInfo[] = []
      if (rn.npcPool) {
        for (const nid of rn.npcPool) {
          const def = raw.npcDefs[nid]
          if (def) npcsHere.push({ id: nid, name: def.name, occupation: def.occupation, dialectLevel: def.dialectLevel })
        }
      }
      // 随机线索
      let activeClue: string | null = null
      if (rn.cluePool && rn.cluePool.length > 0 && rn.clueProbability && rn.clueProbability > 0) {
        activeClue = pick(rn.cluePool)
      }
      m.set(rn.id, {
        id: rn.id, name: rn.name, type: rn.type, area: rn.area,
        description: rn.description, x: rn.x, y: rn.y,
        neighbors: rn.neighbors, npcsHere, activeClue,
        clueProbability: rn.clueProbability ?? 0,
        visual: rn.visual,
      })
    }
    return m
  }, [])

  /* ── 状态（模块级持久化，跨场景不丢失） ── */
  const [currentNodeId, setCursor] = useState(raw.startNode)
  const [visited, setVisited] = useState<Set<string>>(() => _persistVisited ?? new Set([raw.startNode]))
  const [steps, setSteps] = useState(() => _persistSteps)
  const [arrived, setArrived] = useState(false)
  const [clues, setClues] = useState(() => _persistClues)
  const [resolved, setResolved] = useState(false)
  const visitCounts = useRef<Map<string, number>>(new Map())

  // 同步到模块级变量
  _persistSteps = steps
  _persistClues = clues
  _persistVisited = visited

  const getNode = useCallback((id: string) => enrichedMap.get(id)!, [enrichedMap])

  /** 当前节点是不是一个可能的目标（住宅节点） */
  const isCandidate = useMemo(() => {
    const cur = getNode(currentNodeId)
    return cur.type === 'residential'
  }, [currentNodeId, getNode])

  /** 走近查看 / 打电话确认 —— 返回 true 如果这就是目标 */
  const verifyNode = useCallback((): boolean => {
    if (currentNodeId === targetId) {
      setResolved(true)
      return true
    }
    return false
  }, [currentNodeId, targetId])

  /* ── 当前视图 ── */
  const currentView = useMemo((): NodeView => {
    const cur = getNode(currentNodeId)

    // 邻接路径（双向查找：cur.neighbors + 反向连边）
    const adjSet = new Set(cur.neighbors)
    for (const rn of raw.nodes) {
      if (rn.neighbors.includes(currentNodeId) && !adjSet.has(rn.id)) {
        adjSet.add(rn.id)
      }
    }
    const paths: VisiblePath[] = [...adjSet].map((nid) => {
      const nb = getNode(nid)
      const bkKey = `${currentNodeId}->${nid}`
      const isBlocked = blocked.has(bkKey)
      return {
        nodeId: nid, name: nb.name,
        direction: getDir(cur, nb), distance: getDist(cur, nb),
        npcCount: nb.npcsHere?.length ?? 0,
        clueLikelihood: clueLikelihood(nb.clueProbability ?? (nb as RawNode).clueProbability ?? 0),
        blocked: isBlocked,
        blockReason: isBlocked ? pick(raw.randomization.blockReasons) : undefined,
        visited: visited.has(nid),
      }
    })

    // 远处地标（邻居的邻居，不含自身+直接邻居）
    const indirect = new Set<string>()
    for (const nid of adjSet) {
      for (const nn of getNode(nid).neighbors) {
        if (nn !== currentNodeId && !adjSet.has(nn)) indirect.add(nn)
      }
    }
    const landmarks: VisibleLandmark[] = []
    for (const id of indirect) {
      const n = getNode(id)
      landmarks.push({
        nodeId: id, name: visited.has(id) ? n.name : '一处隐约的房屋',
        direction: getDir(cur, n), distance: getDist(cur, n), visited: visited.has(id),
      })
    }

    return { currentNode: cur, paths, landmarks: landmarks.slice(0, 4) }
  }, [currentNodeId, getNode, blocked, visited])

  /* ── 移动 ── */
  const moveTo = useCallback(
    (dest: string) => {
      const cur = getNode(currentNodeId)
      const tgt = getNode(dest)
      // 双向检查：cur→dest 或 dest→cur
      const connected = cur.neighbors.includes(dest) || tgt.neighbors.includes(currentNodeId)
      if (!connected) return
      if (blocked.has(`${currentNodeId}->${dest}`)) return

      // 收集线索
      if (tgt.activeClue) {
        const relRaw = raw.clueReliability
        let rel = relRaw.defaultReliability
        if (tgt.id in relRaw.highReliabilityNodes) rel = relRaw.highReliabilityNodes[tgt.id]!
        else if (tgt.id in relRaw.lowReliabilityNodes) rel = relRaw.lowReliabilityNodes[tgt.id]!
        const alreadyHave = clues.some((c) => c.text === tgt.activeClue)
        if (!alreadyHave) {
          setClues((prev) => [...prev, { text: tgt.activeClue!, reliability: rel, source: tgt.name }])
        }
      }

      // 访问计数
      visitCounts.current.set(dest, (visitCounts.current.get(dest) ?? 0) + 1)

      setCursor(dest)
      setVisited((p) => new Set([...p, dest]))
      setSteps((s) => s + 1)
      setArrived(true)
      setTimeout(() => setArrived(false), 2500)
    },
    [currentNodeId, blocked, getNode, clues],
  )

  return {
    currentView, currentNodeId, visited, steps, arrived, clues, moveTo,
    targetId, weather, resolved,
    isCandidate, verifyNode,
    getNode,
  }
}

/** 获取跨场景持久化的探索数据快照（供 Ending 等场景读取） */
export function getExplorationSnapshot() {
  return { steps: _persistSteps, clues: _persistClues, visited: _persistVisited }
}

/** 重置模块级持久化状态（重新开始） */
export function resetExplorationState() {
  _persistSteps = 0
  _persistClues = []
  _persistVisited = null
}
