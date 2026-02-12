import type { OrderStatus } from "../types";

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span className="status">
      <span className={`dot ${status}`} />
      <span className="pill">{status.replace("_", " ")}</span>
    </span>
  );
}
