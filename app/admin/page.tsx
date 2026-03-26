'use client'

import { useState, useEffect, useRef } from 'react'
import { AdminHeader } from './AdminHeader'
import { HeroAdmin } from './HeroAdmin'
import { ContactAdmin } from './ContactAdmin'
import { SocialAdmin } from './SocialAdmin'
import { TalentsAdmin } from './TalentsAdmin'
import { BrandsAdmin } from './BrandsAdmin'

type Panel = 'hero' | 'talents' | 'brands' | 'contact' | 'social'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [panel, setPanel] = useState<Panel>('hero')
  const [loginError, setLoginError] = useState('')
  const checkedStorage = useRef(false)

  useEffect(() => {
    if (checkedStorage.current) return
    checkedStorage.current = true
    const stored = sessionStorage.getItem('cxm-admin')
    if (stored) {
      // Validate stored password is still valid
      const header = `Basic ${btoa(`admin:${stored}`)}`
      fetch('/api/cloudinary', { headers: { Authorization: header } })
        .then(res => {
          if (res.ok) { setPassword(stored); setAuthed(true) }
          else sessionStorage.removeItem('cxm-admin')
        })
        .catch(() => sessionStorage.removeItem('cxm-admin'))
    }
  }, [])

  const authHeader = `Basic ${btoa(`admin:${password}`)}`

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      const header = `Basic ${btoa(`admin:${password}`)}`
      const res = await fetch('/api/cloudinary', { headers: { Authorization: header } })
      if (!res.ok) { setLoginError('Incorrect password'); return }
      sessionStorage.setItem('cxm-admin', password)
      setAuthed(true)
    } catch { setLoginError('Connection error') }
  }

  if (!authed) {
    return (
      <section style={{ paddingTop: '7rem', minHeight: '100vh', background: '#fafaf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={login} style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '1.5rem' }}>Admin Login</h2>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            style={{ padding: '.75rem 1rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '1rem', width: 280, marginBottom: '1rem', display: 'block' }}
          />
          {loginError && <p style={{ color: '#c00', fontSize: '.9rem', marginBottom: '1rem' }}>{loginError}</p>}
          <button type="submit" style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 4, padding: '.75rem 2rem', fontSize: '.9rem', fontWeight: 600, cursor: 'pointer', width: 280 }}>Login</button>
        </form>
      </section>
    )
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '.5rem 1.2rem', borderRadius: 4, border: 'none',
    background: active ? '#111' : '#f0f0ee',
    color: active ? '#fff' : '#666',
    fontSize: '.85rem', fontWeight: 600, cursor: 'pointer',
    transition: 'background .2s, color .2s',
  })

  return (
    <section style={{ paddingTop: '7rem', minHeight: '100vh', background: '#fafaf8' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem 4rem' }}>
        <AdminHeader breadcrumb={panel === 'hero' ? 'Hero Content' : panel === 'talents' ? 'Talents' : panel === 'brands' ? 'Brands' : panel === 'contact' ? 'Contact Details' : 'Social Channels'} />

        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setPanel('hero')} style={tabStyle(panel === 'hero')}>Hero Content</button>
          <button onClick={() => setPanel('talents')} style={tabStyle(panel === 'talents')}>Talents</button>
          <button onClick={() => setPanel('brands')} style={tabStyle(panel === 'brands')}>Brands</button>
          <button onClick={() => setPanel('contact')} style={tabStyle(panel === 'contact')}>Contact Details</button>
          <button onClick={() => setPanel('social')} style={tabStyle(panel === 'social')}>Social Channels</button>
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={() => { sessionStorage.removeItem('cxm-admin'); setAuthed(false); setPassword('') }}
              style={{ background: 'none', border: '1px solid #ddd', borderRadius: 4, padding: '.4rem 1rem', fontSize: '.82rem', color: '#999', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e8e8e4', margin: '0 0 1.5rem' }} />

        {panel === 'hero' && <HeroAdmin authHeader={authHeader} />}
        {panel === 'talents' && <TalentsAdmin authHeader={authHeader} />}
        {panel === 'brands' && <BrandsAdmin authHeader={authHeader} />}
        {panel === 'contact' && <ContactAdmin authHeader={authHeader} />}
        {panel === 'social' && <SocialAdmin authHeader={authHeader} />}
      </div>
    </section>
  )
}
