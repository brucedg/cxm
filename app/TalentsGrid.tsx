'use client'

import { useState, useEffect } from 'react'
import * as icons from 'lucide-react'

type Talent = {
  id: number
  title: string
  description: string
  tag: string
  icon: string
  sort_order: number
}

function getIcon(name: string) {
  return (icons as any)[name] || icons.Star
}

export function TalentsGrid() {
  const [talents, setTalents] = useState<Talent[]>([])

  useEffect(() => {
    fetch('/api/talents').then(r => r.json()).then(setTalents).catch(() => {})
  }, [])

  if (talents.length === 0) return null

  return (
    <section className="v2-expertise" id="services">
      <div className="v2-expertise-left">
        <h2>Eight disciplines.<br />One <span className="accent">practice.</span></h2>
        <p>We don&apos;t subcontract what we can&apos;t do. Everything we offer is something
        we&apos;ve done for real clients, under real pressure, with real results.</p>
      </div>
      <div className="v2-expertise-right">
        {talents.map(t => {
          const Icon = getIcon(t.icon)
          return (
            <div key={t.id} className="v2-exp-card">
              <div className="v2-exp-icon">
                <Icon size={20} color="#fff" strokeWidth={1.5} />
              </div>
              <h3>{t.title}</h3>
              <p>{t.description}</p>
              <span className="v2-exp-tag">{t.tag}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
