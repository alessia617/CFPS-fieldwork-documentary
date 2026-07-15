import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { getExplorationSnapshot } from '../../hooks/useVillageExploration'

/* ================================================================
   Scene ∞ — Ending《寻找完成》
   互动纪录片结尾 · 田野调查报告
   构成主义档案排版 + 田野笔记 + 纪录片致谢
   ================================================================ */

const FIELD_NOTES = [
  '第一次询问时，村民说：「你到了问一下就知道了。」\n但真正找到目标家庭，花费了比预想更多的时间。',
  '农村空间并不是地图上的一个点。\n它由道路、房屋、人与人的关系共同组成。',
  '寻找的过程本身就是一次田野调查。\n每一次问路、每一次等待，都是对另一个世界的一次靠近。',
  '门牌号是存在的，但没有人记得。\n地图上是有的，但定位不到。\n找到的正确方式只有一个——走到村里，开口问人。',
  '数据并非自动产生。\n它来自访员的脚印、询问和等待。\n来自人与人之间的一次次相遇。',
  '在陌生村庄，每一个线索都是一段关系。\n你要问。要等。要相信陌生人。',
]

export interface EndingProps {
  onRestart: () => void
}

export function Ending({ onRestart }: EndingProps) {
  const snapshot = useMemo(() => getExplorationSnapshot(), [])

  const steps = snapshot.steps
  const clues = snapshot.clues
  const visitedCount = snapshot.visited?.size ?? 0
  const npcInteract = 3 // 会话数估算
  const dialectUses = 3 - 0 // 简单估算

  const fieldNote = useMemo(() => FIELD_NOTES[Math.floor(Math.random() * FIELD_NOTES.length)]!, [])
  const distance = Math.round(steps * 80 + Math.random() * 200)
  const minutes = Math.round(steps * 1.5 + 5)

  return (
    <div style={{
      minHeight: '100svh', background: '#f2e8d5',
      fontFamily: 'var(--font-body)', overflowY: 'auto',
    }}>
      {/* ═══ 纸质纹理 ═══ */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '200px 200px',
      }} />

      {/* ═══ 构成主义几何 ═══ */}
      <svg style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
        viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <circle cx="120" cy="140" r="120" fill="none" stroke="#c44b3c" strokeWidth="2" opacity="0.35" />
        <circle cx="120" cy="140" r="110" fill="none" stroke="#c44b3c" strokeWidth="1" opacity="0.2" />
        <line x1="60" y1="840" x2="580" y2="840" stroke="#1a1a1a" strokeWidth="1" opacity="0.2" />
        <line x1="60" y1="856" x2="420" y2="856" stroke="#c44b3c" strokeWidth="2" opacity="0.3" />
        <rect x="50" y="780" width="28" height="28" fill="#1a1a1a" opacity="0.6" />
        <line x1="1360" y1="100" x2="1360" y2="800" stroke="#c0b8a8" strokeWidth="1" opacity="0.2" />
        <polygon points="830,180 860,180 845,205" fill="#c44b3c" opacity="0.45" />
      </svg>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 'clamp(320px, 92vw, 680px)', margin: '0 auto', padding: 'clamp(28px, 6vh, 48px) clamp(14px, 4vw, 28px) clamp(48px, 10vh, 80px)' }}>

        {/* ═══════════════════════════════
            第一部分 — 标题
            ═══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{ marginBottom: 48 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ width: 36, height: 2, background: '#c44b3c' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 11px)', color: '#c44b3c', letterSpacing: '0.14em' }}>
              FIELD REPORT
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,6vw,52px)',
            fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.02em',
            margin: '0 0 8px 0', lineHeight: 1.1,
          }}>
            寻找完成
          </h1>
          <p style={{
            fontFamily: 'var(--font-dialogue)', fontSize: 'clamp(15px, 4vw, 18px)', color: '#4a4540',
            lineHeight: 1.8, margin: '12px 0 0 0',
          }}>
            一户家庭，一份数据，一次相遇。
          </p>
        </motion.div>

        {/* ═══════════════════════════════
            第二部分 — 田野报告
            ═══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ marginBottom: 48 }}
        >
          <SectionHeader title="Field Report" subtitle="本次寻找记录" />

          <div style={{
            border: '1px solid #c0b8a8', padding: 'clamp(14px, 3vw, 20px) clamp(14px, 3.5vw, 24px)',
            background: 'rgba(250,247,240,0.5)',
          }}>
            <ReportRow label="调查地点" value="██省 ██市 ██村" />
            <ReportRow label="寻找耗时" value={`约 ${minutes} 分钟`} />
            <ReportRow label="移动距离" value={`约 ${distance} 米`} />
            <ReportRow label="走访家庭" value={`${visitedCount} 户`} />
            <ReportRow label="询问村民" value={`${npcInteract} 人`} />
            <ReportRow label="电话确认" value={`${Math.max(1, clues.length)} 次`} />
            <ReportRow label="获得线索" value={`${clues.length} 条`} />
            <ReportRow label="方言辅助" value={`使用 ${dialectUses} 次`} isLast />
          </div>
        </motion.div>

        {/* ═══════════════════════════════
            第三部分 — 寻找轨迹
            ═══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ marginBottom: 48 }}
        >
          <SectionHeader title="Route" subtitle="寻找轨迹" />

          <div style={{ padding: '0 8px' }}>
            {/* 已访路线摘要 */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '4px 8px',
              fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 11px)', color: '#7a7570',
              letterSpacing: '0.04em', lineHeight: 1.8,
            }}>
              {Array.from(snapshot.visited ?? []).slice(0, 12).map((id, i) => (
                <span key={id}>
                  {i > 0 && <span style={{ color: '#c0b8a8', margin: '0 4px' }}>→</span>}
                  <span style={{ color: i === (snapshot.visited?.size ?? 0) - 1 ? '#c44b3c' : '#4a4540' }}>
                    {id === 'entrance' ? '村口' :
                     id === 'shop' ? '小卖部' :
                     id === 'committee' ? '村委会' :
                     id === 'drying_field' ? '晒谷场' :
                     id === 'pond' ? '池塘' :
                     id === 'farmland_west' ? '西边农田' :
                     id === 'old_housing' ? '老住宅区' :
                     id === 'east_housing' ? '东头砖房' :
                     id === 'new_housing' ? '巷口白楼' :
                     id === 'west_old_area' ? '西边老屋' :
                     id === 'target_near' ? '小巷尽头' :
                     id === 'farmland_east' ? '东边农田' :
                     id}
                  </span>
                </span>
              ))}
            </div>
            <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 2.2vw, 10px)', color: '#b0aaa5', letterSpacing: '0.06em' }}>
              步数 {steps} · 已访 {visitedCount} 处
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════
            第四部分 — 田野笔记
            ═══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{ marginBottom: 48 }}
        >
          <SectionHeader title="Field Notes" subtitle="田野笔记" />

          <div style={{
            borderLeft: '2px solid #c44b3c',
            paddingLeft: 16,
          }}>
            <p style={{
              fontFamily: 'var(--font-dialogue)', fontSize: 'clamp(14px, 3.8vw, 17px)',
              color: '#4a4540', lineHeight: 2,
              margin: 0, whiteSpace: 'pre-line',
            }}>
              {fieldNote}
            </p>
          </div>
        </motion.div>

        {/* ═══════════════════════════════
            第五部分 — 数据背后的劳动
            ═══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{ marginBottom: 56 }}
        >
          <div style={{
            border: '1px solid #d8d0c4',
            padding: 'clamp(18px, 4vw, 28px) clamp(14px, 3.5vw, 24px)',
            textAlign: 'center',
            background: 'rgba(250,247,240,0.4)',
          }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 4.5vw, 20px)',
              fontWeight: 700, color: '#1a1a1a',
              letterSpacing: '0.04em', margin: '0 0 16px 0',
            }}>
              最终进入数据库的一条记录，
              <br />
              背后是一名访员在田野中的移动、询问和确认。
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '16px 0' }}>
              <span style={{ width: 24, height: 1, background: '#c44b3c' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(11px, 2.8vw, 13px)', color: '#7a7570', letterSpacing: '0.08em' }}>
                数据并非自动产生
              </span>
              <span style={{ width: 24, height: 1, background: '#c44b3c' }} />
            </div>
            <p style={{
              fontFamily: 'var(--font-dialogue)', fontSize: 'clamp(14px, 3.5vw, 16px)',
              color: '#4a4540', lineHeight: 1.9, margin: 0,
            }}>
              它来自人与人之间的一次次相遇。
            </p>
          </div>
        </motion.div>

        {/* ═══════════════════════════════
            第六部分 — 按钮
            ═══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <motion.button
            onClick={onRestart}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: 'clamp(14px, 3vw, 18px) clamp(20px, 5vw, 36px)',
              background: '#1a1a1a', color: '#e8e4dc',
              border: 'none', fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 600,
              fontFamily: 'var(--font-body)', cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            重新体验一次寻找
          </motion.button>
        </motion.div>

        {/* ═══════════════════════════════
            彩蛋 — 纪录片致谢
            ═══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.5 }}
          style={{ marginTop: 64, textAlign: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ width: 16, height: 1, background: '#c0b8a8' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 2.2vw, 10px)', color: '#c0b8a8', letterSpacing: '0.1em' }}>
              ABOUT
            </span>
            <span style={{ width: 16, height: 1, background: '#c0b8a8' }} />
          </div>
          <p style={{
            fontFamily: 'var(--font-dialogue)', fontSize: 12,
            color: '#b0aaa5', lineHeight: 1.8, margin: '0 0 6px 0',
          }}>
            本次模拟基于 CFPS 实际访员田野经验设计。
          </p>
          <p style={{
            fontFamily: 'var(--font-dialogue)', fontSize: 12,
            color: '#b0aaa5', lineHeight: 1.8, margin: 0,
          }}>
            感谢每一位参与社会调查的访员。
          </p>
        </motion.div>

        {/* 空白留底 */}
        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}

/* ── 区块标题 ── */
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 12 }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 11px)', color: '#c44b3c',
        letterSpacing: '0.12em', fontWeight: 600,
      }}>
        {title}
      </span>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 700,
        color: '#1a1a1a', letterSpacing: '0.04em',
      }}>
        {subtitle}
      </span>
    </div>
  )
}

/* ── 报告行 ── */
function ReportRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '8px 0', borderBottom: isLast ? 'none' : '1px solid #e0d8c8',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(11px, 2.8vw, 13px)', color: '#7a7570', letterSpacing: '0.04em' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 600, color: '#1a1a1a' }}>
        {value}
      </span>
    </div>
  )
}
