export default function GuestNav({
  current,
  open,
  onToggle,
  onGoHome,
  onGoToLogin,
  onGoToRegister,
  onLogout,
}) {
  return (
    <aside className={open ? "sidebar open" : "sidebar"}>
      <button
        type="button"
        className="nav-toggle"
        onClick={onToggle}
        aria-expanded={open}
      >
        {open ? "Close" : "Menu"}
      </button>

      <div className="sidebar-panel" aria-hidden={!open}>
        <button type="button" className="brand" onClick={onGoHome} tabIndex={open ? 0 : -1}>
          Karibu
        </button>
        <nav className="site-nav" aria-label="Main">
          <button
            type="button"
            className={current === "landing" || current === "home" ? "nav-btn active" : "nav-btn"}
            onClick={onGoHome}
            tabIndex={open ? 0 : -1}
          >
            Home
          </button>
          {onLogout ? (
            <button type="button" className="nav-btn" onClick={onLogout} tabIndex={open ? 0 : -1}>
              Log out
            </button>
          ) : (
            <>
              <button
                type="button"
                className={current === "login" ? "nav-btn active" : "nav-btn"}
                onClick={onGoToLogin}
                tabIndex={open ? 0 : -1}
              >
                Log in
              </button>
              <button
                type="button"
                className={current === "register" ? "nav-btn active" : "nav-btn"}
                onClick={onGoToRegister}
                tabIndex={open ? 0 : -1}
              >
                Register
              </button>
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}