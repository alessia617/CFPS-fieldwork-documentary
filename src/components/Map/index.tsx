import { motion } from 'framer-motion'

/* ================================================================
   VillageMap — SVG 村庄节点网络
   手绘档案感：节点圆点 + 路径连线 + 位置标注
   ================================================================ */

export interface VillageNode {
  id: string
  name: string
  description: string
  x: number  // 0-1 相对坐标
  y: number  // 0-1 相对坐标
  npcs: string[]
}

export interface MapProps {
  nodes: VillageNode[]
  edges: [string, string][]
  currentNodeId: string
  visitedIds: Set<string>
  onNodeClick: (nodeId: string) => void
  /** 相邻可到达的节点 */
  reachableIds: Set<string>
}

export function VillageMap({
  nodes,
  edges,
  currentNodeId,
  visitedIds,
  onNodeClick,
  reachableIds,
}: MapProps) {
  const padX = 60
  const padY = 55
  const svgW = 440
  const svgH = 520
  const innerW = svgW - padX * 2
  const innerH = svgH - padY * 2

  const toSvg = (rx: number, ry: number) => ({
    x: padX + rx * innerW,
    y: padY + ry * innerH,
  })

  const nodeLookup = new Map<string, VillageNode>(nodes.map((n) => [n.id, n]))

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{
        width: '100%',
        height: '100%',
        fontFamily: 'var(--font-mono)',
        overflow: 'visible',
      }}
    >
      {/* ── 背景网格暗纹 ── */}
      <defs>
        <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d8d0c4" strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width={svgW} height={svgH} fill="url(#mapGrid)" opacity="0.5" />

      {/* ── 边 ── */}
      {edges.map(([from, to]) => {
        const f = nodeLookup.get(from)
        const t = nodeLookup.get(to)
        if (!f || !t) return null
        const p1 = toSvg(f.x, f.y)
        const p2 = toSvg(t.x, t.y)

        const isOnPath =
          visitedIds.has(from) || visitedIds.has(to) ||
          from === currentNodeId || to === currentNodeId

        return (
          <motion.line
            key={`${from}-${to}`}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={isOnPath ? '#a09888' : '#d8d0c4'}
            strokeWidth={isOnPath ? 1.8 : 1}
            strokeDasharray={isOnPath ? undefined : '5,4'}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        )
      })}

      {/* ── 节点 ── */}
      {nodes.map((node) => {
        const pos = toSvg(node.x, node.y)
        const isCurrent = node.id === currentNodeId
        const isVisited = visitedIds.has(node.id)
        const isReachable = reachableIds.has(node.id)
        const isTarget = node.id === 'target_house'
        const r = isCurrent ? 18 : isTarget ? 14 : 11

        return (
          <g key={node.id}>
            {/* 可到达的指示环 */}
            {isReachable && !isCurrent && (
              <motion.circle
                cx={pos.x} cy={pos.y} r={r + 8}
                fill="none"
                stroke="#c44b3c"
                strokeWidth={1}
                opacity={0.5}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                style={{ cursor: 'pointer' }}
                onClick={() => onNodeClick(node.id)}
              />
            )}

            {/* 当前节点脉冲 */}
            {isCurrent && (
              <motion.circle
                cx={pos.x} cy={pos.y} r={r + 6}
                fill="none"
                stroke="#c44b3c"
                strokeWidth={2}
                animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.25, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* 主体圆 */}
            <motion.circle
              cx={pos.x} cy={pos.y} r={r}
              fill={isCurrent ? '#c44b3c' : isVisited ? '#4a4540' : isTarget ? '#1a1a1a' : '#c0b8a8'}
              stroke={isCurrent ? '#9e372b' : isVisited ? '#2c2c2c' : '#a09888'}
              strokeWidth={1.5}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{ cursor: isReachable ? 'pointer' : 'default' }}
              onClick={() => isReachable && onNodeClick(node.id)}
            />

            {/* 目标标记 ✕ */}
            {isTarget && (
              <g>
                <line
                  x1={pos.x - 5} y1={pos.y - 5}
                  x2={pos.x + 5} y2={pos.y + 5}
                  stroke="white" strokeWidth={1.5}
                />
                <line
                  x1={pos.x + 5} y1={pos.y - 5}
                  x2={pos.x - 5} y2={pos.y + 5}
                  stroke="white" strokeWidth={1.5}
                />
              </g>
            )}

            {/* 标签 */}
            {(isCurrent || isVisited || isTarget) && (
              <motion.text
                x={pos.x}
                y={pos.y + r + 16}
                textAnchor="middle"
                fill={isCurrent ? '#c44b3c' : isTarget ? '#1a1a1a' : '#4a4540'}
                fontSize={11}
                fontWeight={isCurrent ? 600 : 400}
                letterSpacing="0.06em"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                {node.name}
              </motion.text>
            )}

            {/* 未探索的节点用 ? 表示 */}
            {!isCurrent && !isVisited && !isTarget && (
              <text
                x={pos.x} y={pos.y + r + 16}
                textAnchor="middle"
                fill="#c0b8a8"
                fontSize={10}
                letterSpacing="0.1em"
              >
                ?
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
