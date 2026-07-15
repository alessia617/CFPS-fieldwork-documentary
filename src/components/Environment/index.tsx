import { AnimatePresence, motion } from 'framer-motion'
import { getSceneVisual } from '../../data/sceneVisuals'

/* ================================================================
   Environment — NPR 村庄场景背景

   加载优先级：
   1. public/assets/village/scene_*.webp（真实 NPR 处理照片）
   2. SVG 降级（SVG 滤镜模拟照片质感 — 当前方案）
   3. DocumentaryFilter（暗角 + 胶片颗粒 + 色彩分级）

   注：因企业安全策略阻止外部图库访问，
   当前使用高级 SVG NPR 渲染模拟真实照片经艺术处理后的效果。
   WebP 照片就绪后放入 public/assets/village/ 即可自动替换。
   ================================================================ */

export interface EnvironmentProps {
  nodeId: string
}

export function Environment({ nodeId }: EnvironmentProps) {
  const visual = getSceneVisual(nodeId)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={nodeId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundColor: visual.groundColor,
        }}
      >
        {/* Layer 0: SVG 降级 — 始终渲染，照片加载后自动被覆盖 */}
        <ScenePlaceholder nodeId={nodeId} visual={visual} />

        {/* Layer 1: 真实照片 + CSS 滤镜色彩分级 */}
        <img
          src={visual.imagePath}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            filter: visual.filter,
          }}
        />

        {/* Layer 2: 纪录片滤镜 — 始终叠加 */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
          <DocumentaryFilter />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ================================================================
   ScenePlaceholder — NPR 照片级 SVG 渲染
   使用 SVG 滤波器模拟真实照片的纹理、光影、景深
   ================================================================ */
function ScenePlaceholder({
  nodeId, visual,
}: {
  nodeId: string
  visual: ReturnType<typeof getSceneVisual>
}) {
  return (
    <svg
      viewBox="0 0 1200 675"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    >
      <defs>
        {/* 天空渐变 */}
        <linearGradient id={`sky-${nodeId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8d8e8" />
          <stop offset="60%" stopColor="#e8e0d0" />
          <stop offset="100%" stopColor="#e8e0d0" />
        </linearGradient>
        {/* 灰瓦渐变 */}
        <linearGradient id={`rf-${nodeId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5e5e5e" /><stop offset="100%" stopColor="#3a3a3a" />
        </linearGradient>
        {/* 白墙渐变 — 模拟自然光 */}
        <linearGradient id={`wl-${nodeId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8f4ec" /><stop offset="100%" stopColor="#e8e0d0" />
        </linearGradient>
        {/* 土路渐变 */}
        <linearGradient id={`rd-${nodeId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8b898" /><stop offset="100%" stopColor="#b0a080" />
        </linearGradient>
        {/* 地面纹理滤镜 — 模拟泥土/水泥质感 */}
        <filter id={`ground-tex-${nodeId}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
          <feBlend in="SourceGraphic" in2="gray" mode="multiply" result="textured" />
        </filter>
        {/* 墙壁纹理 — 轻微颗粒感 */}
        <filter id={`wall-tex-${nodeId}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="3" result="n" />
          <feColorMatrix type="saturate" values="0" in="n" result="g" />
          <feComponentTransfer in="g" result="faint">
            <feFuncA type="linear" slope="0.06" />
          </feComponentTransfer>
          <feComposite in="faint" in2="SourceGraphic" operator="over" />
        </filter>
        {/* 远景雾化 — 景深效果 */}
        <filter id={`haze-${nodeId}`}>
          <feGaussianBlur stdDeviation="1.2" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.4" />
          </feComponentTransfer>
        </filter>
        {/* 远山微模糊 */}
        <filter id={`hill-blur-${nodeId}`}>
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
        {/* 树冠纹理 */}
        <filter id={`tree-tex-${nodeId}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="tn" />
          <feColorMatrix type="saturate" values="0" in="tn" result="tg" />
          <feComponentTransfer in="tg" result="tf">
            <feFuncA type="linear" slope="0.12" />
          </feComponentTransfer>
          <feComposite in="tf" in2="SourceGraphic" operator="over" />
        </filter>
        {/* clip */}
        <clipPath id={`sc-${nodeId}`}>
          <rect x="0" y="0" width="1200" height="675" />
        </clipPath>
      </defs>

      {/* ═══ 天空 ═══ */}
      <rect x={0} y={0} width={1200} height={390} fill={`url(#sky-${nodeId})`} />

      {/* 太阳光晕 */}
      <circle cx={850} cy={120} r={80} fill="white" opacity={0.12} />
      <circle cx={850} cy={120} r={140} fill="white" opacity={0.05} />

      {/* 云层 — 柔和自然 */}
      <g opacity={0.25} fill="white" filter={`url(#haze-${nodeId})`}>
        <ellipse cx={250} cy={80} rx={100} ry={22} />
        <ellipse cx={300} cy={70} rx={65} ry={16} />
        <ellipse cx={600} cy={110} rx={85} ry={18} />
        <ellipse cx={1000} cy={60} rx={70} ry={14} />
      </g>

      {/* ═══ 远山丘陵 — 皖南低缓山脊 ═══ */}
      <g opacity={0.25} filter={`url(#hill-blur-${nodeId})`}>
        <path d="M0 385 Q120 320 240 345 Q380 300 520 335 Q660 305 800 330 Q960 310 1100 340 Q1180 350 1200 348 L1200 400 L0 400Z" fill="#8a9878" />
        <path d="M0 395 Q140 360 280 375 Q430 345 580 365 Q730 345 880 370 Q1020 350 1200 365 L1200 410 L0 410Z" fill="#7a8a68" />
      </g>

      {/* ═══ 地面 ═══ */}
      <rect x={0} y={390} width={1200} height={285} fill={`url(#rd-${nodeId})`} filter={`url(#ground-tex-${nodeId})`} />

      {/* 地面自然起伏层次 */}
      <g opacity={0.12}>
        <path d="M0 420 Q300 410 600 425 Q900 415 1200 430 L1200 440 L0 440Z" fill="#a09070" />
        <path d="M0 480 Q400 470 800 485 Q1000 475 1200 490 L1200 500 L0 500Z" fill="#988868" />
      </g>

      {/* ═══ 场景元素 ═══ */}
      <g clipPath={`url(#sc-${nodeId})`}>
        <SceneElements nodeId={nodeId} />
      </g>

      {/* 水印 */}
      <text x={600} y={660} textAnchor="middle"
        fontFamily="var(--font-mono)" fontSize={9}
        fill="#7a7570" opacity={0.2} letterSpacing="0.1em">
        {visual.timeOfDay} · 皖南农村 · 田野调查
      </text>
    </svg>
  )
}

/* ═══ 场景路由器 ═══ */
function SceneElements({ nodeId }: { nodeId: string }) {
  switch (nodeId) {
    case 'entrance':      return <EntranceScene />
    case 'shop':          return <ShopScene />
    case 'committee':     return <CommitteeScene />
    case 'drying_field':  return <DryingFieldScene />
    case 'old_housing':   return <OldHousingScene />
    case 'pond':          return <PondScene />
    case 'farmland':      return <FarmlandScene />
    case 'target_vicinity': return <TargetVicinityScene />
    default:              return null
  }
}

/* ================================================================
   建筑组件 — 皖南民居真实比例
   ================================================================ */

function House({ x, y, w, h, twoStory }: {
  x: number; y: number; w: number; h: number; twoStory?: boolean
}) {
  const wallH = h * 0.72
  return (
    <g>
      {/* 灰瓦坡顶 */}
      <polygon
        points={`${x - 12},${y + wallH} ${x + w / 2},${y} ${x + w + 12},${y + wallH}`}
        fill={`url(#rf-entrance)`} opacity={0.55}
      />
      {/* 白墙 */}
      <rect x={x} y={y + wallH} width={w} height={wallH}
        fill={`url(#wl-entrance)`} opacity={0.65} filter={`url(#wall-tex-entrance)`}
      />
      {twoStory && (
        <rect x={x} y={y + wallH} width={w} height={wallH / 2}
          fill="#ede6da" opacity={0.5}
        />
      )}
      <rect x={x} y={y + wallH} width={w} height={wallH}
        fill="none" stroke="#b8a898" strokeWidth={0.8} opacity={0.35}
      />
      {/* 窗户 — 上下两排 */}
      <rect x={x + w * 0.18} y={y + wallH + wallH * 0.18}
        width={w * 0.16} height={wallH * 0.3} fill="#b8d0e0" opacity={0.22} rx={1} />
      <rect x={x + w * 0.38} y={y + wallH + wallH * 0.18}
        width={w * 0.16} height={wallH * 0.3} fill="#b8d0e0" opacity={0.22} rx={1} />
      <rect x={x + w * 0.62} y={y + wallH + wallH * 0.18}
        width={w * 0.16} height={wallH * 0.3} fill="#b8d0e0" opacity={0.22} rx={1} />
      {twoStory && (
        <>
          <rect x={x + w * 0.18} y={y + wallH * 0.55 + wallH * 0.18}
            width={w * 0.16} height={wallH * 0.3} fill="#b8d0e0" opacity={0.16} rx={1} />
          <rect x={x + w * 0.62} y={y + wallH * 0.55 + wallH * 0.18}
            width={w * 0.16} height={wallH * 0.3} fill="#b8d0e0" opacity={0.16} rx={1} />
        </>
      )}
      {/* 门 */}
      <rect x={x + w * 0.42} y={y + wallH + wallH * 0.48}
        width={w * 0.14} height={wallH * 0.52} fill="#5a4a3a" opacity={0.3} />
    </g>
  )
}

function Wall({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g opacity={0.28}>
      <rect x={x} y={y} width={w} height={6} fill="#b0a090" />
      <rect x={x} y={y + 6} width={w} height={20} fill="#d8c8b8" filter={`url(#wall-tex-entrance)`} />
      <line x1={x} y1={y + 3} x2={x + w} y2={y + 3} stroke="#a09080" strokeWidth={0.5} opacity={0.25} />
    </g>
  )
}

function BambooGrove({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g opacity={0.32} filter={`url(#tree-tex-entrance)`}>
      {Array.from({ length: n }).map((_, i) => {
        const bx = x + i * 16 + (i % 3) * 5
        const bh = 65 + (i % 4) * 22
        return (
          <g key={`b-${i}`}>
            <line x1={bx} y1={y + bh} x2={bx + (i % 3 - 1) * 2} y2={y}
              stroke="#4a5a2a" strokeWidth={2.2} opacity={0.45} />
            <ellipse cx={bx} cy={y + bh * 0.28} rx={2.5} ry={1.2} fill="#3a4a1a" opacity={0.3} />
            <ellipse cx={bx + 5} cy={y + 5} rx={11} ry={5} fill="#6a8a40" opacity={0.28} />
            <ellipse cx={bx - 3} cy={y + 3} rx={9} ry={4} fill="#6a8a40" opacity={0.22} />
          </g>
        )
      })}
    </g>
  )
}

function Tree({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g filter={`url(#tree-tex-entrance)`}>
      <ellipse cx={x} cy={y - size * 0.1} rx={size * 0.55} ry={size * 0.38} fill="#8aaa70" opacity={0.4} />
      <ellipse cx={x - size * 0.08} cy={y} rx={size * 0.42} ry={size * 0.3} fill="#7a9a60" opacity={0.35} />
      <rect x={x - size * 0.05} y={y + size * 0.15} width={size * 0.1} height={size * 0.3} fill="#6a5a3a" rx={2} opacity={0.5} />
    </g>
  )
}

function ElectricPole({ x, y }: { x: number; y: number }) {
  return (
    <g opacity={0.38}>
      <line x1={x} y1={y} x2={x} y2={y + 140} stroke="#7a7a70" strokeWidth={2.5} />
      <line x1={x - 8} y1={y + 10} x2={x + 8} y2={y + 10} stroke="#6a6a60" strokeWidth={1.8} />
      <line x1={x - 14} y1={y + 26} x2={x - 8} y2={y + 10} stroke="#606050" strokeWidth={0.8} />
      <line x1={x + 14} y1={y + 26} x2={x + 8} y2={y + 10} stroke="#606050" strokeWidth={0.8} />
    </g>
  )
}

function PowerLines({ pts }: { pts: string }) {
  return <g opacity={0.16}><polyline points={pts} fill="none" stroke="#505050" strokeWidth={0.7} /></g>
}

/* ================================================================
   八个场景 — 高度细化
   ================================================================ */

function EntranceScene() {
  return (
    <g>
      {/* 水泥村路 — 前宽后窄的透视感 */}
      <polygon points="0,530 380,420 820,420 1200,530 1200,675 0,675" fill="#c8c0b0" opacity={0.4} />
      <polygon points="380,420 390,420 810,420 820,420" fill="#b8b0a0" opacity={0.15} />
      {/* 路缘线 */}
      <line x1={380} y1={422} x2={0} y2={535} stroke="#a09880" strokeWidth={1} opacity={0.2} />
      <line x1={820} y1={422} x2={1200} y2={535} stroke="#a09880" strokeWidth={1} opacity={0.2} />

      {/* 老樟树 */}
      <Tree x={200} y={320} size={160} />

      {/* 石板 */}
      <ellipse cx={230} cy={430} rx={30} ry={10} fill="#a09888" opacity={0.45} />
      <ellipse cx={270} cy={435} rx={24} ry={8} fill="#a09888" opacity={0.35} />

      {/* 村牌 */}
      <g>
        <rect x={530} y={395} width={100} height={45} fill="#e8e0d0" opacity={0.55} rx={2} />
        <rect x={535} y={400} width={90} height={35} fill="#dcd0c0" opacity={0.35} rx={1} />
        <line x1={540} y1={412} x2={620} y2={412} stroke="#c0b0a0" strokeWidth={0.5} opacity={0.4} />
        <line x1={540} y1={420} x2={600} y2={420} stroke="#c0b0a0" strokeWidth={0.5} opacity={0.3} />
      </g>

      {/* 远处白墙灰瓦民居群 */}
      <House x={720} y={330} w={80} h={52} />
      <House x={830} y={338} w={68} h={46} />
      <House x={930} y={332} w={85} h={50} />
      <House x={1050} y={340} w={72} h={48} />

      {/* 电线杆 */}
      <ElectricPole x={480} y={270} />
      <ElectricPole x={1050} y={275} />
      <PowerLines pts="200,350 480,280 1050,285" />

      {/* 竹林 */}
      <BambooGrove x={60} y={340} n={7} />
      {/* 右侧近处竹丛 */}
      <BambooGrove x={1120} y={360} n={3} />
    </g>
  )
}

function ShopScene() {
  return (
    <g>
      {/* 水泥路 */}
      <polygon points="0,480 380,420 820,420 1200,480 1200,675 0,675" fill="#c8c0b0" opacity={0.38} />

      {/* 小卖部主体 — 临路砖房 */}
      <House x={400} y={280} w={180} h={115} />
      {/* 褪色招牌 — 红底褪色 */}
      <rect x={440} y={292} width={100} height={24} fill="#c44b3c" opacity={0.3} rx={2} />
      {/* 卷帘门入口 */}
      <rect x={460} y={315} width={70} height={80} fill="#4a4540" opacity={0.28} />
      <line x1={495} y1={315} x2={495} y2={395} stroke="#3a3530" strokeWidth={0.5} opacity={0.3} />
      {/* 门头遮阳棚 */}
      <rect x={430} y={310} width={130} height={6} fill="#8a7a5a" opacity={0.2} />
      {/* 窗户 + 货架阴影 */}
      <rect x={420} y={335} width={30} height={45} fill="#d8d0c4" opacity={0.2} />
      <rect x={610} y={335} width={30} height={45} fill="#d8d0c4" opacity={0.2} />

      {/* 门口杂物 — 饮料箱堆 */}
      <rect x={415} y={395} width={26} height={14} fill="#c0b090" opacity={0.3} />
      <rect x={443} y={397} width={24} height={12} fill="#b8a888" opacity={0.25} />

      {/* 竹椅 */}
      <rect x={600} y={390} width={20} height={5} fill="#8a7a5a" opacity={0.28} />
      <rect x={598} y={395} width={4} height={12} fill="#7a6a4a" opacity={0.2} />
      <rect x={616} y={395} width={4} height={12} fill="#7a6a4a" opacity={0.2} />

      {/* 远房群 */}
      <House x={120} y={360} w={60} h={45} />
      <House x={210} y={355} w={72} h={48} />
      <House x={900} y={350} w={80} h={50} />
      <House x={1020} y={345} w={68} h={46} />

      <ElectricPole x={500} y={255} />
      <PowerLines pts="200,300 500,265 1000,275" />
    </g>
  )
}

function CommitteeScene() {
  return (
    <g>
      <polygon points="0,480 1200,470 1200,675 0,675" fill="#c8c0b0" opacity={0.3} />

      {/* 两层办公楼 */}
      <g opacity={0.5}>
        <House x={420} y={240} w={230} h={155} twoStory />
        {/* 门上方的小雨棚 */}
        <rect x={530} y={370} width={40} height={5} fill="#8a7a6a" opacity={0.2} />
        {/* 门口牌子 */}
        <rect x={435} y={255} width={55} height={16} fill="#c8b898" opacity={0.35} rx={1} />
        <rect x={498} y={255} width={45} height={16} fill="#c8b898" opacity={0.28} rx={1} />
        {/* 地面台阶 */}
        <rect x={540} y={397} width={30} height={5} fill="#b8a898" opacity={0.2} />
      </g>

      {/* 院子里停的面包车 */}
      <rect x={720} y={388} width={72} height={24} fill="#c8ccd0" opacity={0.22} rx={3} />
      <rect x={728} y={380} width={36} height={12} fill="#bcc0c8" opacity={0.16} rx={2} />
      <circle cx={738} cy={414} r={7} fill="#5a5a5a" opacity={0.16} />
      <circle cx={776} cy={414} r={7} fill="#5a5a5a" opacity={0.16} />

      {/* 远房 */}
      <House x={80} y={365} w={58} h={42} />
      <House x={1040} y={355} w={74} h={48} />
      <ElectricPole x={1050} y={250} />
    </g>
  )
}

function DryingFieldScene() {
  return (
    <g>
      {/* 水泥晒场 — 大片空地 */}
      <rect x={120} y={370} width={960} height={210} fill="#d8d0c0" opacity={0.3} />
      <rect x={120} y={370} width={960} height={210} fill="none" stroke="#c4b8a8" strokeWidth={1} opacity={0.18} />

      {/* 谷物摊晒 */}
      <rect x={300} y={420} width={450} height={55} fill="#c4a44a" opacity={0.14} rx={3} />
      {/* 推耙痕迹 */}
      <line x1={320} y1={440} x2={730} y2={435} stroke="#b09030" strokeWidth={0.5} opacity={0.15} />
      <line x1={320} y1={455} x2={730} y2={450} stroke="#b09030" strokeWidth={0.5} opacity={0.12} />

      {/* 秸秆堆 — 圆锥形 */}
      <ellipse cx={220} cy={550} rx={48} ry={18} fill="#b8a060" opacity={0.22} />
      <polygon points="195,540 220,490 245,540" fill="#b8a060" opacity={0.15} />
      <ellipse cx={860} cy={545} rx={40} ry={15} fill="#b8a060" opacity={0.18} />
      <polygon points="838,535 860,492 882,535" fill="#b8a060" opacity={0.12} />

      {/* 石桌 + 竹椅 */}
      <rect x={550} y={505} width={45} height={7} fill="#b0a090" opacity={0.25} rx={2} />
      <rect x={542} y={512} width={6} height={13} fill="#8a7a5a" opacity={0.16} rx={1} />
      <rect x={600} y={512} width={6} height={13} fill="#8a7a5a" opacity={0.16} rx={1} />

      {/* 周屋 */}
      <House x={40} y={335} w={72} h={50} />
      <House x={155} y={340} w={68} h={48} />
      <House x={980} y={330} w={80} h={52} />
      <House x={1095} y={338} w={65} h={46} />
      <ElectricPole x={1050} y={240} />
    </g>
  )
}

function OldHousingScene() {
  return (
    <g>
      {/* 密集瓦房 — 窄巷交错 */}
      <House x={90} y={320} w={105} h={72} />
      <House x={230} y={310} w={100} h={76} />
      <House x={370} y={315} w={112} h={70} />
      <House x={520} y={305} w={108} h={78} />
      <House x={670} y={318} w={105} h={72} />
      <House x={810} y={308} w={115} h={74} />
      <House x={970} y={320} w={110} h={70} />
      <House x={1110} y={312} w={85} h={66} />

      {/* 窄巷 — 阴影 */}
      <rect x={195} y={385} width={16} height={115} fill="#7a6a5a" opacity={0.1} />
      <rect x={335} y={380} width={14} height={120} fill="#7a6a5a" opacity={0.1} />
      <rect x={485} y={378} width={16} height={125} fill="#7a6a5a" opacity={0.08} />
      <rect x={635} y={385} width={14} height={118} fill="#7a6a5a" opacity={0.1} />
      <rect x={785} y={380} width={15} height={122} fill="#7a6a5a" opacity={0.08} />
      <rect x={930} y={388} width={14} height={112} fill="#7a6a5a" opacity={0.1} />

      {/* 土路 */}
      <rect x={0} y={470} width={1200} height={205} fill="#b8a890" opacity={0.3} filter={`url(#ground-tex-entrance)`} />

      {/* 围墙片段 */}
      <Wall x={20} y={365} w={50} />
      <Wall x={600} y={370} w={65} />
      <Wall x={1030} y={365} w={60} />
    </g>
  )
}

function PondScene() {
  return (
    <g>
      {/* 水面 — 椭圆池塘 */}
      <ellipse cx={600} cy={450} rx={270} ry={80} fill="#8a9a88" opacity={0.32} />
      <ellipse cx={600} cy={450} rx={235} ry={66} fill="#9aaa98" opacity={0.24} />
      {/* 水光 — 阳光反射 */}
      <ellipse cx={510} cy={430} rx={70} ry={9} fill="white" opacity={0.08} />
      <ellipse cx={700} cy={455} rx={50} ry={6} fill="white" opacity={0.06} />
      {/* 浮萍 */}
      <circle cx={440} cy={460} r={15} fill="#7a9a50" opacity={0.12} />
      <circle cx={670} cy={438} r={12} fill="#7a9a50" opacity={0.1} />
      <circle cx={550} cy={475} r={17} fill="#7a9a50" opacity={0.08} />

      {/* 柳树 — 塘边 */}
      <line x1={300} y1={375} x2={300} y2={460} stroke="#6a5a3a" strokeWidth={4} opacity={0.35} />
      <ellipse cx={295} cy={362} rx={36} ry={26} fill="#8aaa70" opacity={0.32} />
      <ellipse cx={315} cy={372} rx={26} ry={20} fill="#8aaa70" opacity={0.24} />

      {/* 塘埂小路 */}
      <path d="M280,490 Q600,525 920,495" fill="none" stroke="#b0a090" strokeWidth={2.5} opacity={0.2} />

      {/* 竹林+远房 */}
      <BambooGrove x={800} y={365} n={5} />
      <BambooGrove x={100} y={385} n={4} />
      <House x={40} y={355} w={58} h={44} />
      <House x={1050} y={348} w={72} h={48} />
    </g>
  )
}

function FarmlandScene() {
  return (
    <g>
      {/* 稻田 — 多层次拼接 */}
      <rect x={0} y={325} width={320} height={150} fill="#9aaa60" opacity={0.2} />
      <rect x={350} y={315} width={380} height={140} fill="#90a050" opacity={0.22} />
      <rect x={770} y={330} width={430} height={145} fill="#9aaa60" opacity={0.18} />
      <rect x={0} y={495} width={420} height={130} fill="#90a050" opacity={0.2} />
      <rect x={450} y={485} width={360} height={140} fill="#9aaa60" opacity={0.18} />
      <rect x={850} y={495} width={350} height={125} fill="#90a050" opacity={0.16} />

      {/* 田埂 — 泥土路 */}
      <line x1={0} y1={490} x2={1200} y2={485} stroke="#a09078" strokeWidth={1.5} opacity={0.2} />
      <line x1={320} y1={325} x2={310} y2={625} stroke="#a09078" strokeWidth={1.2} opacity={0.18} />
      <line x1={750} y1={315} x2={740} y2={625} stroke="#a09078" strokeWidth={1.2} opacity={0.18} />

      {/* 远山 — 丘陵轮廓 */}
      <g filter={`url(#hill-blur-entrance)`} opacity={0.2}>
        <path d="M0 300 Q200 265 400 282 Q600 258 800 272 Q1000 260 1200 278 L1200 325 L0 325Z" fill="#8a9870" />
      </g>

      {/* 电线杆 */}
      <ElectricPole x={200} y={240} />
      <ElectricPole x={1000} y={250} />
      <PowerLines pts="200,250 600,248 1000,260" />

      {/* 远房 */}
      <House x={50} y={370} w={50} h={38} />
      <House x={1120} y={365} w={56} h={40} />
    </g>
  )
}

function TargetVicinityScene() {
  return (
    <g>
      {/* 安静小巷 */}
      <polygon points="0,470 1200,460 1200,675 0,675" fill="#c8c0b0" opacity={0.25} />

      {/* 目标房屋 — 普通农户，不特殊 */}
      <g opacity={0.52}>
        {/* 灰瓦坡顶 */}
        <polygon points="385,280 500,220 625,280" fill={`url(#rf-entrance)`} opacity={0.55} />
        {/* 白墙 */}
        <rect x={400} y={280} width={210} height={125} fill={`url(#wl-entrance)`} opacity={0.65} filter={`url(#wall-tex-entrance)`} />
        <rect x={400} y={280} width={210} height={125} fill="none" stroke="#b8a898" strokeWidth={0.8} opacity={0.35} />
        {/* 窗户 */}
        <rect x={425} y={300} width={30} height={28} fill="#e8e0d0" opacity={0.22} />
        <rect x={425} y={304} width={24} height={20} fill="#b8d0e0" opacity={0.15} rx={1} />
        <rect x={550} y={300} width={30} height={28} fill="#e8e0d0" opacity={0.22} />
        <rect x={550} y={304} width={24} height={20} fill="#b8d0e0" opacity={0.15} rx={1} />
        {/* 虚掩木门 — 关键细节 */}
        <rect x={485} y={325} width={34} height={80} fill="#5a4a3a" opacity={0.4} />
        <line x1={492} y1={325} x2={492} y2={405} stroke="#4a3a2a" strokeWidth={1.2} opacity={0.3} />
        {/* 褪色对联 — 红色的最后痕迹 */}
        <rect x={481} y={323} width={2.5} height={82} fill="#c44b3c" opacity={0.08} />
        <rect x={520} y={323} width={2.5} height={82} fill="#c44b3c" opacity={0.08} />
      </g>

      {/* 石磨 — 标志物 */}
      <ellipse cx={645} cy={440} rx={18} ry={8} fill="#b0a090" opacity={0.32} />
      <ellipse cx={645} cy={437} rx={6} ry={3} fill="#8a7a6a" opacity={0.2} />

      {/* 围墙 */}
      <Wall x={380} y={410} w={320} />

      {/* 邻居房屋 */}
      <House x={80} y={345} w={74} h={50} />
      <House x={940} y={338} w={82} h={52} />
      <BambooGrove x={1100} y={325} n={4} />
    </g>
  )
}

/* ================================================================
   DocumentaryFilter — 纪录片后期处理
   ================================================================ */
function DocumentaryFilter() {
  return (
    <>
      {/* 暗角 — 柔和压暗边缘，聚焦中央视野 */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(30,25,15,0.2) 70%, rgba(30,25,15,0.4) 100%)',
      }} />
      {/* 胶片颗粒 — 模拟旧胶片质感 */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.05'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '200px 200px',
      }} />
      {/* 暖色色彩分级 — 午后阳光暖偏移 */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'rgba(220, 190, 140, 0.06)', mixBlendMode: 'overlay' as const,
      }} />
      {/* 二次暖调 — 柔光层 */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'rgba(240, 210, 150, 0.03)',
      }} />
      {/* 顶部天空压暗 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '16%', pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(20,18,14,0.12), transparent)',
      }} />
      {/* 底部地面压暗 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '10%', pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(20,18,14,0.08), transparent)',
      }} />
    </>
  )
}
