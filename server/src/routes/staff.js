const router = require("express").Router();
const { z } = require("zod");
const Order = require("../models/Order");
const { asyncHandler } = require("../utils/asyncHandler");
const { authRequired, roleRequired } = require("../middleware/auth");
const { getIo } = require("../sockets/io");

function toStaffOrder(order) {
  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    table: order.table,
    notes: order.notes,
    status: order.status,
    items: order.items,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
}

router.get(
  "/staff/orders",
  authRequired,
  roleRequired(["admin", "staff"]),
  asyncHandler(async (_req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
    res.json({ orders: orders.map(toStaffOrder) });
  })
);

const UpdateStatusSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "READY", "COMPLETED", "CANCELLED"])
});

router.patch(
  "/staff/orders/:id/status",
  authRequired,
  roleRequired(["admin", "staff"]),
  asyncHandler(async (req, res) => {
    const { status } = UpdateStatusSchema.parse(req.body);
    const order = await Order.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
    if (!order) return res.status(404).json({ message: "Not found" });

    const payload = toStaffOrder(order);
    const io = getIo();

    io.of("/staff").to("staff").emit("orderUpdated", payload);
    io.of("/orders").to(`order:${payload.id}`).emit("orderUpdated", payload);

    res.json({ order: payload });
  })
);

module.exports = router;
