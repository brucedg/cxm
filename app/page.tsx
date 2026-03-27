import { getDb } from '@/lib/db'
import { TalentsGrid } from './TalentsGrid'
import { BrandGrid } from './BrandGrid'

export const dynamic = 'force-dynamic'

async function getSettings() {
  try {
    const sql = getDb()
    const rows = await sql`SELECT key, value FROM settings WHERE key IN ('hero', 'contact', 'social_channels')`
    const map: Record<string, any> = {}
    for (const r of rows) map[r.key] = r.value
    return {
      hero: map.hero as { tagline: string; title: string; titleLight: string; titleAccent: string; titleEnd: string; description: string; ctas: { text: string; url: string; style: string }[]; disciplines: string[]; backgroundImage?: string } | undefined,
      contact: map.contact as { email: string; location: string; availability: string; responseTime: string } | undefined,
      social: (map.social_channels || []) as { name: string; url: string }[],
    }
  } catch { return { hero: undefined, contact: undefined, social: [] } }
}

const defaultHero = {
  tagline: 'Digital Consultancy',
  title: 'We build',
  titleLight: 'the digital',
  titleAccent: 'infrastructure',
  titleEnd: 'of great brands.',
  description: 'CXM brings twenty-plus years of hands-on expertise across CX strategy, UI engineering, analytics architecture, and CMS platform work. Expert thinking, without the overhead.',
  ctas: [
    { text: 'View our services', url: '#services', style: 'primary' },
    { text: 'Talk to us', url: '#contact', style: 'secondary' },
  ],
  disciplines: ['CXM', 'UI/UX', 'Analytics', 'CMS', 'Motion', 'POC Dev'],
  backgroundImage: '',
}

const defaultContact = {
  email: 'hello@cxm.nz',
  location: 'New Zealand · Remote-capable',
  availability: 'Currently taking projects',
  responseTime: 'Within 24 hours',
}

const marqueeItems = [
  'CXM Strategy', 'UI Architecture', 'App & POC Development',
  'Rapid Marketing Sites', 'GA4 Analytics', 'Animation & Motion',
  'CMS & Migrations', 'CMS Rescue',
]

export default async function Home() {
  const { hero: dbHero, contact: dbContact } = await getSettings()
  const hero = dbHero || defaultHero
  const contact = dbContact || defaultContact

  return (
    <div className="v2" style={{ background: '#fafaf8', color: '#111', fontFamily: "'DM Sans', sans-serif" }}>

      {/* HERO */}
      <section className="v2-hero" style={hero.backgroundImage ? { background: `url(${hero.backgroundImage}) center/cover no-repeat` } : undefined}>
        <div>
          <div className="v2-tag">{hero.tagline}</div>
          <div className="v2-hero-inner">
          <div>
            <h1>
              <span className="title-line">{hero.title}</span>
              <span className="light">{hero.titleLight}</span>
              <span className="accent">{hero.titleAccent}</span>
              <span className="end">{hero.titleEnd}</span>
            </h1>
          </div>
          <div>
            <p className="v2-hero-desc">{hero.description}</p>
            <div className="v2-ctas">
              {hero.ctas.map((cta, i) => (
                <a key={i} className={`v2-cta-${cta.style}`} href={cta.url}>{cta.text}</a>
              ))}
            </div>
            <BrandGrid />
          </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="v2-marquee-bar">
        <div className="v2-marquee-inner">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i}>
              <span>{item}</span>
              <span className="dot"> · </span>
            </span>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <TalentsGrid />

      {/* ABOUT / PROFILE */}
      <section className="v2-profile" id="about">
        <div>
          <h2>Deep expertise.<br /><span className="accent">No</span> middle layers.</h2>
          <p>When you engage CXM, you&apos;re working directly with the person who&apos;s spent
          two decades getting this right. No account managers. No juniors doing the
          actual work. Just someone who&apos;s been in the room long enough to know what matters.</p>
          <p>That experience shapes everything: how we scope projects, how we talk to
          clients, and how we deliver outcomes that hold up over time.</p>
          <a className="v2-cta-primary" style={{ marginTop: '32px', display: 'inline-block' }} href="#contact">
            Our approach →
          </a>
        </div>
        <div className="v2-profile-stats">
          {[
            { num: '20+', label: 'Years experience' },
            { num: '150+', label: 'Projects delivered' },
            { num: '8', label: 'Disciplines' },
            { num: 'NZ', label: 'Based globally' },
          ].map((s) => (
            <div key={s.label} className="v2-profile-stat">
              <div className="v2-profile-stat-num">{s.num}</div>
              <div className="v2-profile-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="v2-contact" id="contact">
        <div>
          <h2>Let&apos;s build<br />something <span className="accent">together.</span></h2>
          <p>We take on a limited number of engagements at a time. If your project
          sounds like a good fit, reach out — even a short conversation usually tells
          us both what we need to know.</p>
        </div>
        <div>
          {[
            { label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
            { label: 'Location', value: contact.location, href: '#' },
            { label: 'Availability', value: contact.availability, href: '#contact' },
            { label: 'Response time', value: contact.responseTime, href: '#' },
          ].map((item) => (
            <div key={item.label} className="v2-contact-item">
              <label>{item.label}</label>
              <a href={item.href}>{item.value}</a>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="v2-footer">
        <p>© 2025 CXM.NZ — Digital Consultancy</p>
        <p>CXM · UI · Analytics · CMS · Motion</p>
      </footer>

    </div>
  )
}
