const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

function initIo(httpServer, corsOrigin) {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true
    }
  });

  // Staff namespace (requires access token)
  const staff = io.of("/staff");
  staff.use((socket, next) => {
    const token = socket.handshake.auth?.token
      || (socket.handshake.headers?.authorization || "").replace(/^Bearer\s+/i, "");

    if (!token) return next(new Error("Missing token"));

    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      if (!["admin", "staff"].includes(payload.role)) return next(new Error("Forbidden"));
      socket.data.user = { id: payload.sub, role: payload.role };
      return next();
    } catch {
      return next(new Error("Invalid token"));
    }
  });

  staff.on("connection", (socket) => {
    socket.join("staff");
    socket.emit("staffHello", { ok: true, role: socket.data.user.role });
  });

  // Orders namespace (public)
  const orders = io.of("/orders");
  orders.on("connection", (socket) => {
    socket.on("joinOrder", (orderId) => {
      if (typeof orderId === "string" && orderId.length > 5) {
        socket.join(`order:${orderId}`);
      }
    });
  });

  return io;
}

function getIo() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

module.exports = { initIo, getIo };
