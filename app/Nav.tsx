export function Nav() {
  return (
    <nav className="v2-nav">
      <a href="/" className="v2-logo" style={{ textDecoration: 'none' }}>CXM<span>.NZ</span></a>
      <div className="v2-nav-links">
        <a href="/#services">Services</a>
        <a href="/#approach">Approach</a>
        <a href="/#about">About</a>
        <a className="v2-nav-cta" href="/#contact">Start a project</a>
      </div>
    </nav>
  )
}
