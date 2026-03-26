export function Nav() {
  return (
    <nav className="v2-nav">
      <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <img src="/images/logo-original.png" alt="CXM.NZ" style={{ height: 32 }} />
      </a>
      <div className="v2-nav-links">
        <a href="/#services">Services</a>
        <a href="/#approach">Approach</a>
        <a href="/#about">About</a>
        <a className="v2-nav-cta" href="/#contact">Start a project</a>
      </div>
    </nav>
  )
}
