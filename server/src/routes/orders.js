const router = require("express").Router();
const { z } = require("zod");
const { nanoid } = require("nanoid");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const { asyncHandler } = require("../utils/asyncHandler");
const { getIo } = require("../sockets/io");

const CreateOrderSchema = z.object({
  table: z.string().max(20).optional().default(""),
  notes: z.string().max(300).optional().default(""),
  items: z.array(
    z.object({
      menuItemId: z.string().min(10),
      qty: z.number().int().min(1).max(20)
    })
  ).min(1)
});

function toPublicOrder(order) {
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

router.post(
  "/orders",
  asyncHandler(async (req, res) => {
    const data = CreateOrderSchema.parse(req.body);

    const ids = data.items.map((i) => i.menuItemId);
    const menu = await MenuItem.find({ _id: { $in: ids }, isAvailable: true });
    const menuById = new Map(menu.map((m) => [m._id.toString(), m]));

    const snapshotItems = data.items.map((i) => {
      const m = menuById.get(i.menuItemId);
      if (!m) {
        const err = new Error("Menu item unavailable");
        err.statusCode = 400;
        throw err;
      }
      return {
        menuItemId: m._id,
        name: m.name,
        priceCents: m.priceCents,
        qty: i.qty
      };
    });

    const orderNumber = nanoid(7).toUpperCase();
    const order = await Order.create({
      orderNumber,
      table: data.table,
      notes: data.notes,
      items: snapshotItems
    });

    // Notify staff in realtime
    const io = getIo();
    const payload = toPublicOrder(order);
    io.of("/staff").to("staff").emit("orderCreated", payload);

    return res.status(201).json({ order: payload });
  })
);

router.get(
  "/orders/:id",
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Not found" });
    return res.json({ order: toPublicOrder(order) });
  })
);

module.exports = router;
