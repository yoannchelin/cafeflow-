import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";

export function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("staff@cafeflow.dev");
  const [password, setPassword] = useState("Staff123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      nav(res.user.role === "admin" ? "/admin/menu" : "/staff");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="h1">Staff login</div>
        <div className="h2">JWT + refresh cookies (demo)</div>

        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && (
            <div className="card" style={{ borderColor: "rgba(255,93,93,0.35)" }}>
              {error}
            </div>
          )}

          <div className="row">
            <button className="primary" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="h1">Seeded accounts</div>
        <div className="list">
          <div className="item">
            <div>
              <div className="item-title">Admin</div>
              <div className="muted">admin@cafeflow.dev</div>
            </div>
            <div className="pill">Admin123!</div>
          </div>

          <div className="item">
            <div>
              <div className="item-title">Staff</div>
              <div className="muted">staff@cafeflow.dev</div>
            </div>
            <div className="pill">Staff123!</div>
          </div>
        </div>

        <hr />
        <small className="muted">
          Tip: In production, you would use an IdP (Auth0/Cognito) or rotate secrets + store refresh tokens securely.
        </small>
      </div>
    </div>
  );
}
