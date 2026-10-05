'use client'

import {useEffect, useState} from 'react'
import {Star} from 'lucide-react'
import {getXp, levelFor} from '../lib/questLog'
import {createClient} from '../lib/supabase/client'
import {getServerLog} from '../lib/serverQuestLog'

/** Header XP display — listens for quest-log updates (local or server). */
export function XpBar() {
  const [xp, setXp] = useState(0)
  useEffect(() => {
    let cancelled = false
    const read = async () => {
      try {
        const supabase = createClient()
        const {
          data: {session},
        } = await supabase.auth.getSession()
        if (cancelled) return
        if (session) {
          const log = await getServerLog()
          if (cancelled) return
          setXp(log?.xp ?? 0)
        } else {
          setXp(getXp())
        }
      } catch {
        if (!cancelled) setXp(getXp())
      }
    }
    read()
    const on = () => {
      read()
    }
    window.addEventListener('grantquest:xp', on)
    window.addEventListener('storage', on)
    return () => {
      cancelled = true
      window.removeEventListener('grantquest:xp', on)
      window.removeEventListener('storage', on)
    }
  }, [])
  const level = levelFor(xp)
  const intoLevel = xp % 100
  return (
    <div className="xpbar" title={`${xp} XP total`}>
      <span>
        <Star size={13} aria-hidden="true" /> Lv {level}
      </span>
      <div className="track">
        <div className="fill" style={{width: `${intoLevel}%`}} />
      </div>
      <span>{xp} XP</span>
    </div>
  )
}
