# CafeFlow — talking points (for interviews)

## What it demonstrates
- Full-stack MERN delivery (React + Node/Express + MongoDB)
- Realtime event-driven UX with Socket.IO
- Auth (JWT access + refresh cookie) and RBAC (admin vs staff)
- CRUD (menu), transactional flow (orders), operational dashboard (staff queue)
- Basic testing + CI (GitHub Actions)

## Architecture (high level)
- REST API for CRUD + business actions (create order, update status)
- Socket.IO namespaces:
  - `/staff` requires access token (staff/admin), broadcasts order events
  - `/orders` is public; customers join a room `order:<id>` to receive status updates
- Order items are stored as a snapshot (name, price, qty) to keep historical integrity

## Next improvements (nice follow-ups)
- Add payments (Stripe test mode) and receipts
- Add multi-tenant stores (storeId), per-store menu + staff
- Add QR code generation per table
- Add optimistic UI + offline mode (PWA)
- Add E2E tests (Playwright)
