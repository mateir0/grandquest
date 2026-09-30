'use client'

import {useEffect, useState} from 'react'
import {Star} from 'lucide-react'
import {getXp, levelFor} from '../lib/questLog'

/** Header XP display — listens for quest-log updates. */
export function XpBar() {
  const [xp, setXp] = useState(0)
  useEffect(() => {
    setXp(getXp())
    const on = () => setXp(getXp())
    window.addEventListener('grantquest:xp', on)
    window.addEventListener('storage', on)
    return () => {
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
