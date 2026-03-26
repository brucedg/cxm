const marqueeItems = [
  'CXM Strategy', 'UI Architecture', 'App & POC Development',
  'Rapid Marketing Sites', 'GA4 Analytics', 'Animation & Motion',
  'CMS & Migrations', 'CMS Rescue',
]

import { TalentsGrid } from './TalentsGrid'

export default function Home() {
  return (
    <div className="v2" style={{ background: '#fafaf8', color: '#111', fontFamily: "'DM Sans', sans-serif" }}>

      {/* HERO */}
      <section className="v2-hero">
        <div className="v2-hero-inner">
          <div>
            <div className="v2-tag">Senior Digital Consultancy</div>
            <h1>
              We build<br />
              <span className="light">the digital</span><br />
              <span className="accent">infrastructure</span><br />
              of great brands.
            </h1>
          </div>
          <div>
            <p className="v2-hero-desc">
              CXM brings twenty-plus years of hands-on expertise across CX strategy,
              UI engineering, analytics architecture, and CMS platform work. Senior
              thinking, without the senior overhead.
            </p>
            <div className="v2-ctas">
              <a className="v2-cta-primary" href="#services">View our services</a>
              <a className="v2-cta-secondary" href="#contact">Talk to us</a>
            </div>
            <div className="v2-clients-strip">
              <p>Disciplines we practise</p>
              <div className="clients">
                {['CXM','UI/UX','Analytics','CMS','Motion','POC Dev'].map(d => (
                  <span key={d} className="client-tag">{d}</span>
                ))}
              </div>
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
          <h2>Senior expertise.<br /><span className="accent">No</span> middle layers.</h2>
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
            { label: 'Email', value: 'hello@cxm.nz', href: 'mailto:hello@cxm.nz' },
            { label: 'Location', value: 'New Zealand · Remote-capable', href: '#' },
            { label: 'Availability', value: 'Currently taking projects', href: '#contact' },
            { label: 'Response time', value: 'Within 24 hours', href: '#' },
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
        <p>© 2025 CXM.NZ — Senior Digital Consultancy</p>
        <p>CXM · UI · Analytics · CMS · Motion</p>
      </footer>

    </div>
  )
}
