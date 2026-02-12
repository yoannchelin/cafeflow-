import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import api from "../lib/api";
import type { MenuItem, Order, OrderItem } from "../types";
import { centsToAud } from "../components/Money";
import { StatusPill } from "../components/Status";

type MenuResponse = { items: MenuItem[] };
type CreateOrderResponse = { order: Order };

export function CustomerOrderPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [table, setTable] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await api.get<MenuResponse>("/api/menu");
        setMenu(res.data.items);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? "Failed to load menu");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const byCat: Record<string, MenuItem[]> = {};
    for (const item of menu) {
      const cat = item.category || "General";
      byCat[cat] = byCat[cat] || [];
      byCat[cat].push(item);
    }
    return Object.entries(byCat).sort((a, b) => a[0].localeCompare(b[0]));
  }, [menu]);

  const cartItems: OrderItem[] = useMemo(() => {
    const byId = new Map(menu.map((m) => [m._id, m]));
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const m = byId.get(id)!;
        return { menuItemId: id, name: m.name, priceCents: m.priceCents, qty };
      });
  }, [cart, menu]);

  const total = useMemo(() => cartItems.reduce((s, i) => s + i.priceCents * i.qty, 0), [cartItems]);

  function inc(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }
  function dec(id: string) {
    setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) - 1) }));
  }

  async function placeOrder() {
    setError(null);
    if (!cartItems.length) return setError("Add at least one item");
    setPlacing(true);
    try {
      const payload = {
        table,
        notes,
        items: cartItems.map((i) => ({ menuItemId: i.menuItemId, qty: i.qty }))
      };
      const res = await api.post<CreateOrderResponse>("/api/orders", payload);
      setOrder(res.data.order);

      // realtime status updates
      const s = io(import.meta.env.VITE_API_URL + "/orders");
      s.emit("joinOrder", res.data.order.id);
      s.on("orderUpdated", (updated: Order) => setOrder(updated));
      setSocket(s);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  if (loading) {
    return <div className="card">Loading menu…</div>;
  }

  if (order) {
    return (
      <div className="grid">
        <div className="card">
          <div className="h1">Order #{order.orderNumber}</div>
          <div className="h2">
            <StatusPill status={order.status} />
          </div>

          <div className="list">
            {order.items.map((i) => (
              <div key={i.menuItemId} className="item">
                <div>
                  <div className="item-title">{i.name}</div>
                  <div className="muted">{centsToAud(i.priceCents)} × {i.qty}</div>
                </div>
                <div className="pill">{centsToAud(i.priceCents * i.qty)}</div>
              </div>
            ))}
          </div>

          <hr />
          <div className="kv">
            <div className="muted">Total</div>
            <div className="total">{centsToAud(order.items.reduce((s, i) => s + i.priceCents * i.qty, 0))}</div>
          </div>

          <hr />
          <small className="muted">
            This page listens to live events from Socket.IO (orders namespace).
          </small>
        </div>

        <div className="card">
          <div className="h1">Track</div>
          <div className="h2">Live status updates</div>
          <div className="list">
            <div className="item">
              <div>
                <div className="item-title">Order ID</div>
                <div className="muted">{order.id}</div>
              </div>
              <div className="pill">Copy</div>
            </div>
          </div>

          <hr />
          <button className="danger" onClick={() => { setOrder(null); setCart({}); setTable(""); setNotes(""); socket?.disconnect(); }}>
            New order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="h1">Order</div>
        <div className="h2">Scan → pick items → pay at counter (demo)</div>

        {error && (
          <div className="card" style={{ borderColor: "rgba(255,93,93,0.35)" }}>
            {error}
          </div>
        )}

        <div className="field">
          <label>Table (optional)</label>
          <input value={table} onChange={(e) => setTable(e.target.value)} placeholder="e.g. 12" />
        </div>

        <div className="field">
          <label>Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. oat milk, no sugar…" />
        </div>

        <div className="list">
          {grouped.map(([cat, items]) => (
            <div key={cat} className="card">
              <div className="item-title">{cat}</div>
              <div className="list" style={{ marginTop: 10 }}>
                {items.map((m) => (
                  <div key={m._id} className="item">
                    <div>
                      <div className="item-title">{m.name}</div>
                      <div className="muted">{m.description}</div>
                      <div className="muted">{centsToAud(m.priceCents)}</div>
                    </div>
                    <div className="row" style={{ alignItems: "center" }}>
                      <button onClick={() => dec(m._id)}>-</button>
                      <div className="pill">{cart[m._id] || 0}</div>
                      <button onClick={() => inc(m._id)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="h1">Cart</div>
        <div className="h2">Review before placing</div>

        <div className="list">
          {cartItems.length === 0 ? (
            <div className="muted">No items yet.</div>
          ) : (
            cartItems.map((i) => (
              <div key={i.menuItemId} className="item">
                <div>
                  <div className="item-title">{i.name}</div>
                  <div className="muted">{centsToAud(i.priceCents)} × {i.qty}</div>
                </div>
                <div className="pill">{centsToAud(i.priceCents * i.qty)}</div>
              </div>
            ))
          )}
        </div>

        <hr />
        <div className="kv">
          <div className="muted">Total</div>
          <div className="total">{centsToAud(total)}</div>
        </div>

        <hr />
        <button className="primary" onClick={placeOrder} disabled={placing || cartItems.length === 0}>
          {placing ? "Placing…" : "Place order"}
        </button>

        <hr />
        <small className="muted">
          Uses POST /api/orders and subscribes to realtime updates.
        </small>
      </div>
    </div>
  );
}
