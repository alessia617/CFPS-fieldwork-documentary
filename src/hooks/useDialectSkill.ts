import { useState, useCallback } from 'react'

/* ================================================================
   useDialectSkill — 方言辅助技能
   访员利用自己的方言理解能力帮助沟通
   每局 3 次，用完即止，不影响游戏推进
   ================================================================ */

export function useDialectSkill() {
  const [remaining, setRemaining] = useState(3)
  const [justUsed, setJustUsed] = useState(false)

  const canUse = remaining > 0

  const activate = useCallback(() => {
    if (remaining <= 0) return false
    setRemaining((r) => r - 1)
    setJustUsed(true)
    setTimeout(() => setJustUsed(false), 2500)
    return true
  }, [remaining])

  return { remaining, maxUses: 3, canUse, justUsed, activate }
}
