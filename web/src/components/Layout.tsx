import { Link, useLocation, useNavigate } from "react-router-dom";
import { getSession } from "../lib/auth";
import { logout } from "../lib/api";

export function Layout({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const nav = useNavigate();
  const session = getSession();

  async function onLogout() {
    await logout();
    nav("/login");
  }

  return (
    <div className="container">
      <div className="nav">
        <div className="nav-left">
          <div className="brand">CafeFlow</div>
          <span className="badge">Realtime ordering</span>
        </div>

        <div className="nav-links">
          <Link to="/order" aria-current={loc.pathname === "/order" ? "page" : undefined}>Order</Link>
          <Link to="/staff" aria-current={loc.pathname === "/staff" ? "page" : undefined}>Staff</Link>
          <Link to="/admin/menu" aria-current={loc.pathname.startsWith("/admin") ? "page" : undefined}>Admin</Link>
          {!session.token ? (
            <Link to="/login">Login</Link>
          ) : (
            <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }}>Logout</a>
          )}
        </div>
      </div>

      <div style={{ height: 16 }} />
      {children}
      <div style={{ height: 40 }} />
      <small className="muted">
        Demo project — React + Node + MongoDB + Socket.IO
      </small>
    </div>
  );
}
