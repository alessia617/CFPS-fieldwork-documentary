import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNpcDialogue } from '../../hooks/useNpcDialogue'
import { useDialectSkill } from '../../hooks/useDialectSkill'

/* ================================================================
   Scene 4 — NPCInteraction 询问村民
   第一人称对话 + 方言技能辅助
   ================================================================ */

export interface NPCInteractionProps {
  npcId: string | null
  onBack: () => void
}

export function NPCInteraction({ npcId, onBack }: NPCInteractionProps) {
  if (!npcId) {
    return (
      <div style={{
        minHeight: '100svh', background: '#141210',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#7a7570', fontFamily: 'var(--font-mono)', fontSize: 'clamp(14px, 3.5vw, 16px)',
      }}>
        没有可对话的 NPC
      </div>
    )
  }

  return <NPCDialogue npcId={npcId} onBack={onBack} />
}

function NPCDialogue({ npcId, onBack }: { npcId: string; onBack: () => void }) {
  const {
    npcName,
    npcOccupation,
    dialectLevel,
    currentNode,
    options,
    clueObtained,
    isEnded,
    advance,
    chooseOption,
  } = useNpcDialogue(npcId)

  const { remaining, canUse, activate } = useDialectSkill()
  const [dialectRevealed, setDialectRevealed] = useState(false)

  const isNpc = currentNode.speaker === 'npc'
  const handleUseSkill = () => {
    if (activate()) {
      setDialectRevealed(true)
    }
  }

  // 切换节点时重置方言揭示
  const handleAdvance = () => {
    setDialectRevealed(false)
    advance()
  }
  const handleChooseOption = (opt: { label: string; next: string }) => {
    setDialectRevealed(false)
    chooseOption(opt)
  }

  return (
    <div style={{
      minHeight: '100svh', background: '#f2e8d5',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-body)',
    }}>
      {/* ── 顶部 ── */}
      <NpcHeader
        name={npcName}
        occupation={npcOccupation}
        dialectLevel={dialectLevel}
        skillRemaining={remaining}
        canUseSkill={canUse && dialectLevel >= 40}
        onUseSkill={handleUseSkill}
        onBack={onBack}
      />

      {/* ── 主体：对话区 ── */}
      <div style={{
        flex: 1, overflow: 'auto',
        display: 'flex', flexDirection: 'column',
        padding: '24px 22px 32px', gap: 18,
        maxWidth: 'clamp(320px, 90vw, 580px)', margin: '0 auto', width: '100%',
      }}>
        {/* 对话气泡 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNode.text.slice(0, 20)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <ChatBubble
              speaker={isNpc ? npcName : '访员'}
              text={currentNode.text}
              side={isNpc ? 'left' : 'right'}
              dialectNote={currentNode.dialectNote}
            />
          </motion.div>
        </AnimatePresence>

        {/* 方言技能揭示的补充信息 */}
        <AnimatePresence>
          {dialectRevealed && currentNode.dialectClue && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                background: 'rgba(196, 75, 60, 0.06)',
                border: '1px dashed rgba(196, 75, 60, 0.25)',
                borderRadius: 2,
                padding: '10px 14px',
                alignSelf: 'flex-start',
                maxWidth: '85%',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                color: '#c44b3c', letterSpacing: '0.1em',
                display: 'block', marginBottom: 4,
              }}>
                仔细听……
              </span>
              <span style={{
                fontFamily: 'var(--font-dialogue)', fontSize: 'clamp(13px, 3.3vw, 16px)',
                color: '#4a4540', lineHeight: 1.6,
              }}>
                {currentNode.dialectClue}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 笔记 */}
        <AnimatePresence>
          {clueObtained && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                borderLeft: '2px solid #c4944a',
                paddingLeft: 12, marginTop: 6,
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)',
                color: '#c4944a', letterSpacing: '0.08em',
                display: 'block', marginBottom: 2,
              }}>
                笔记
              </span>
              <span style={{
                fontFamily: 'var(--font-dialogue)', fontSize: 'clamp(13px, 3.3vw, 16px)',
                color: '#4a4540', lineHeight: 1.6,
              }}>
                "{clueObtained}"
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 底部 ── */}
      <div style={{
        borderTop: '1px solid #d8d0c4',
        background: '#faf7f0',
        padding: '16px 22px',
        display: 'flex', flexDirection: 'column', gap: 8,
        maxWidth: 'clamp(320px, 90vw, 580px)', margin: '0 auto', width: '100%',
      }}>
        {options.length > 0 ? (
          options.map((opt) => (
            <motion.button
              key={opt.label}
              onClick={() => handleChooseOption(opt)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: 'clamp(12px, 3vw, 14px) clamp(14px, 3.5vw, 18px)',
                background: '#fff',
                border: '1px solid #c44b3c',
                borderRadius: 2,
                textAlign: 'left',
                fontSize: 'clamp(14px, 3.5vw, 16px)', color: '#1a1a1a',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              {opt.label}
            </motion.button>
          ))
        ) : isEnded ? (
          <motion.button
            onClick={onBack}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '12px',
              background: '#1a1a1a',
              color: '#e8e4dc',
              border: 'none', borderRadius: 2,
              fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            返回村庄
          </motion.button>
        ) : (
          <motion.button
            onClick={handleAdvance}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '12px',
              background: '#4a4540',
              color: '#e8e4dc',
              border: 'none', borderRadius: 2,
              fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            继续
          </motion.button>
        )}
      </div>
    </div>
  )
}

/* ================================================================
   NpcHeader — 顶部 NPC 头像 + 方言技能按钮
   ================================================================ */
function NpcHeader({
  name, occupation, dialectLevel,
  skillRemaining, canUseSkill, onUseSkill, onBack,
}: {
  name: string; occupation: string; dialectLevel: number
  skillRemaining: number; canUseSkill: boolean
  onUseSkill: () => void; onBack: () => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 20px',
      background: '#fff', borderBottom: '1px solid #d8d0c4',
    }}>
      <button
        onClick={onBack}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: 16, color: '#4a4540',
          cursor: 'pointer', border: 'none', background: 'none',
          padding: '4px 8px',
        }}
      >
        ←
      </button>

      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: '#e8e0d0', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>
        👤
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 'clamp(14px, 3.8vw, 17px)', fontWeight: 600, color: '#1a1a1a' }}>
          {name}
        </div>
        <div style={{ fontSize: 'clamp(11px, 2.8vw, 13px)', color: '#7a7570', fontFamily: 'var(--font-mono)' }}>
          {occupation}
          {dialectLevel >= 60 && ' · 口音较重'}
        </div>
      </div>

      {/* 方言技能按钮 */}
      {canUseSkill && (
        <motion.button
          onClick={onUseSkill}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 12px',
            background: 'rgba(196, 75, 60, 0.08)',
            border: '1px solid rgba(196, 75, 60, 0.3)',
            borderRadius: 2,
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(10px, 2.5vw, 12px)', color: '#c44b3c',
            letterSpacing: '0.06em', fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: 13 }}>👂</span>
          方言辅助 ({skillRemaining})
        </motion.button>
      )}

      {/* 技能已用完 — 仅在高方言时显示 */}
      {!canUseSkill && dialectLevel >= 60 && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2.5vw, 12px)',
          color: '#b0aaa5', letterSpacing: '0.04em',
        }}>
          方言技能已用完
        </span>
      )}
    </div>
  )
}

/* ================================================================
   ChatBubble
   ================================================================ */
function ChatBubble({
  speaker, text, side, dialectNote,
}: {
  speaker: string; text: string; side: 'left' | 'right'
  dialectNote?: string
}) {
  const isNpc = side === 'left'
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isNpc ? 'flex-start' : 'flex-end',
    }}>
      <span style={{
        fontSize: 'clamp(10px, 2.5vw, 12px)', fontFamily: 'var(--font-mono)',
        color: '#b0aaa5', letterSpacing: '0.06em',
        marginBottom: 4, paddingLeft: isNpc ? 6 : 0,
        paddingRight: isNpc ? 0 : 6, userSelect: 'none',
      }}>
        {speaker}
      </span>
      <div style={{
        maxWidth: '88%', padding: 'clamp(12px, 3vw, 14px) clamp(14px, 3.5vw, 18px)',
        background: isNpc ? '#fff' : '#2c2c2c',
        color: isNpc ? '#1a1a1a' : '#e8e4dc',
        borderRadius: isNpc ? '12px 12px 12px 3px' : '12px 12px 3px 12px',
        fontSize: 'clamp(14px, 3.5vw, 16px)', lineHeight: 1.8,
        fontFamily: isNpc ? 'var(--font-dialogue)' : 'var(--font-body)',
        boxShadow: isNpc ? '0 1px 3px rgba(0,0,0,0.06)' : '0 1px 4px rgba(0,0,0,0.15)',
        border: isNpc ? '1px solid #e8e0d0' : 'none',
        wordBreak: 'break-word',
      }}>
        {text}
      </div>
      {dialectNote && (
        <span style={{
          fontSize: 'clamp(10px, 2.5vw, 12px)', fontFamily: 'var(--font-mono)',
          color: '#b0aaa5', fontStyle: 'italic',
          marginTop: 3, paddingLeft: 6,
        }}>
          * {dialectNote}
        </span>
      )}
    </div>
  )
}
