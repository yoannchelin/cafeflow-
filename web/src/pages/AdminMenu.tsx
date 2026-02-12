import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { getSession } from "../lib/auth";
import type { MenuItem } from "../types";
import { centsToAud } from "../components/Money";
import { Link } from "react-router-dom";

type MenuResponse = { items: MenuItem[] };

export function AdminMenuPage() {
  const session = getSession();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Coffee");
  const [priceCents, setPriceCents] = useState(500);
  const [description, setDescription] = useState("");

  const isAdmin = session.role === "admin";

  const grouped = useMemo(() => {
    const byCat: Record<string, MenuItem[]> = {};
    for (const i of items) {
      const cat = i.category || "General";
      byCat[cat] = byCat[cat] || [];
      byCat[cat].push(i);
    }
    return Object.entries(byCat).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  async function load() {
    setError(null);
    try {
      const res = await api.get<MenuResponse>("/api/admin/menu");
      setItems(res.data.items);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load admin menu");
    }
  }

  useEffect(() => {
    if (!session.token) return;
    if (!isAdmin) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token]);

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/admin/menu", {
        name,
        category,
        priceCents: Number(priceCents),
        description,
        isAvailable: true
      });
      setName("");
      setDescription("");
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create item");
    }
  }

  async function toggleAvailability(id: string, isAvailable: boolean) {
    setError(null);
    try {
      await api.put(`/api/admin/menu/${id}`, { isAvailable });
      setItems((prev) => prev.map((p) => (p._id === id ? { ...p, isAvailable } : p)));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to update item");
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      await api.delete(`/api/admin/menu/${id}`);
      setItems((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to delete item");
    }
  }

  if (!session.token) {
    return (
      <div className="card">
        <div className="h1">Admin menu</div>
        <div className="h2">Login required</div>
        <Link to="/login"><button className="primary">Go to login</button></Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="card">
        <div className="h1">Admin menu</div>
        <div className="h2">Admin access required</div>
        <small className="muted">Login as admin@cafeflow.dev</small>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="h1">Menu management</div>
        <div className="h2">Admin CRUD</div>

        {error && (
          <div className="card" style={{ borderColor: "rgba(255,93,93,0.35)" }}>
            {error}
          </div>
        )}

        <hr />

        {grouped.map(([cat, list]) => (
          <div key={cat} className="card" style={{ marginBottom: 12 }}>
            <div className="item-title">{cat}</div>
            <div className="list" style={{ marginTop: 10 }}>
              {list.map((m) => (
                <div key={m._id} className="item">
                  <div>
                    <div className="item-title">{m.name} {!m.isAvailable ? <span className="pill">Hidden</span> : null}</div>
                    <div className="muted">{m.description}</div>
                    <div className="muted">{centsToAud(m.priceCents)}</div>
                  </div>

                  <div className="row" style={{ alignItems: "center" }}>
                    <button onClick={() => toggleAvailability(m._id, !m.isAvailable)}>
                      {m.isAvailable ? "Hide" : "Show"}
                    </button>
                    <button className="danger" onClick={() => remove(m._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="h1">Add item</div>
        <div className="h2">Create new menu item</div>

        <form onSubmit={createItem}>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cappuccino" />
          </div>
          <div className="field">
            <label>Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="field">
            <label>Price (cents)</label>
            <input type="number" value={priceCents} onChange={(e) => setPriceCents(Number(e.target.value))} />
            <small className="muted">Example: 520 = {centsToAud(520)}</small>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <button className="primary" disabled={!name.trim()}>Create</button>
        </form>

        <hr />
        <small className="muted">
          Tip: Recruiters love seeing role-based CRUD + validation.
        </small>
      </div>
    </div>
  );
}
