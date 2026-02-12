import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import api from "../lib/api";
import { getSession } from "../lib/auth";
import type { Order, OrderStatus } from "../types";
import { StatusPill } from "../components/Status";
import { centsToAud } from "../components/Money";
import { Link } from "react-router-dom";

type StaffOrdersResponse = { orders: Order[] };

const STATUS_FLOW: OrderStatus[] = ["NEW", "IN_PROGRESS", "READY", "COMPLETED", "CANCELLED"];

export function StaffPage() {
  const session = getSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    if (filter === "ALL") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  useEffect(() => {
    if (!session.token) return;

    (async () => {
      setError(null);
      try {
        const res = await api.get<StaffOrdersResponse>("/api/staff/orders");
        setOrders(res.data.orders);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? "Failed to load staff orders");
      }
    })();

    const s = io(import.meta.env.VITE_API_URL + "/staff", {
      auth: { token: session.token }
    });

    s.on("orderCreated", (o: Order) => {
      setOrders((prev) => [o, ...prev].slice(0, 50));
    });

    s.on("orderUpdated", (o: Order) => {
      setOrders((prev) => prev.map((p) => (p.id === o.id ? o : p)));
    });

    s.on("connect_error", (e) => setError(e.message));

    setSocket(s);

    return () => {
      s.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    setError(null);
    try {
      const res = await api.patch<{ order: Order }>(`/api/staff/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((p) => (p.id === orderId ? res.data.order : p)));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to update status");
    }
  }

  if (!session.token) {
    return (
      <div className="card">
        <div className="h1">Staff dashboard</div>
        <div className="h2">Login required</div>
        <Link to="/login"><button className="primary">Go to login</button></Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="h1">Staff dashboard</div>
          <div className="h2">Live queue via Socket.IO</div>
          <small className="muted">
            Connected: {socket?.connected ? "yes" : "no"} • {session.email ?? ""}
          </small>
        </div>

        <div className="row">
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="ALL">All</option>
            {STATUS_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: "rgba(255,93,93,0.35)" }}>
          {error}
        </div>
      )}

      <hr />

      <div className="list">
        {filtered.map((o) => (
          <div key={o.id} className="item" style={{ flexDirection: "column" as const }}>
            <div className="row" style={{ justifyContent: "space-between", width: "100%" }}>
              <div>
                <div className="item-title">#{o.orderNumber} {o.table ? `• Table ${o.table}` : ""}</div>
                <div className="muted">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <StatusPill status={o.status} />
            </div>

            <div className="list" style={{ marginTop: 10 }}>
              {o.items.map((i) => (
                <div key={i.menuItemId} className="kv">
                  <div className="muted">{i.qty}× {i.name}</div>
                  <div className="muted">{centsToAud(i.priceCents * i.qty)}</div>
                </div>
              ))}
              {o.notes ? <div className="muted">Notes: {o.notes}</div> : null}
              <div className="kv">
                <div className="muted">Total</div>
                <div className="total">{centsToAud(o.items.reduce((s, i) => s + i.priceCents * i.qty, 0))}</div>
              </div>
            </div>

            <div className="row" style={{ marginTop: 10 }}>
              <button onClick={() => updateStatus(o.id, "IN_PROGRESS")}>In progress</button>
              <button onClick={() => updateStatus(o.id, "READY")}>Ready</button>
              <button onClick={() => updateStatus(o.id, "COMPLETED")}>Completed</button>
              <button className="danger" onClick={() => updateStatus(o.id, "CANCELLED")}>Cancel</button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="muted">No orders yet.</div>
        )}
      </div>
    </div>
  );
}
