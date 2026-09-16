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

      {open ? (
        <>
          <button type="button" className="brand" onClick={onGoHome}>
            Karibu
          </button>
          <nav className="site-nav" aria-label="Main">
            <button
              type="button"
              className={current === "landing" || current === "home" ? "nav-btn active" : "nav-btn"}
              onClick={onGoHome}
            >
              Home
            </button>
            {onLogout ? (
              <button type="button" className="nav-btn" onClick={onLogout}>
                Log out
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className={current === "login" ? "nav-btn active" : "nav-btn"}
                  onClick={onGoToLogin}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className={current === "register" ? "nav-btn active" : "nav-btn"}
                  onClick={onGoToRegister}
                >
                  Register
                </button>
              </>
            )}
          </nav>
        </>
      ) : null}
    </aside>
  );
}