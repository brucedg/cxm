const services = [
  {
    icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 17.5h7M17.5 14v7"/></svg>,
    title: 'CXM & UI Architecture',
    desc: 'Experience frameworks and design systems that scale with your ambitions.',
    tag: 'Strategy + Build',
  },
  {
    icon: <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    title: 'App Architecture & POCs',
    desc: 'Fast, reliable proof-of-concept development. Test ideas without betting the farm.',
    tag: 'Dev + Prototype',
  },
  {
    icon: <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
    title: 'Rapid Marketing Sites',
    desc: 'Campaign-ready landing pages and marketing sites built at pace, without cutting corners.',
    tag: 'Web + CRO',
  },
  {
    icon: <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    title: 'GA4 Analytics',
    desc: 'Proper measurement architecture. Tag strategy, event taxonomy, dashboards, and insights.',
    tag: 'Data + Insight',
  },
  {
    icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
    title: 'Animation & Interactivity',
    desc: 'Motion design and micro-interactions that enhance rather than decorate.',
    tag: 'Motion + UX',
  },
  {
    icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="5" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="3" y="12" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="5" rx="1"/></svg>,
    title: 'CMS Services',
    desc: 'Any CMS, built and rescued. Platform transformations, content migrations, and emergency recoveries done properly.',
    tag: 'CMS + Migration',
  },
]

const marqueeItems = [
  'CXM Strategy', 'UI Architecture', 'App & POC Development',
  'Rapid Marketing Sites', 'GA4 Analytics', 'Animation & Motion',
  'CMS & Migrations', 'CMS Rescue',
]

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
      <section className="v2-expertise" id="services">
        <div className="v2-expertise-left">
          <h2>Eight disciplines.<br />One <span className="accent">practice.</span></h2>
          <p>We don&apos;t subcontract what we can&apos;t do. Everything we offer is something
          we&apos;ve done for real clients, under real pressure, with real results.</p>
        </div>
        <div className="v2-expertise-right">
          {services.map((s) => (
            <div key={s.title} className="v2-exp-card">
              <div className="v2-exp-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="v2-exp-tag">{s.tag}</span>
            </div>
          ))}
        </div>
      </section>

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
