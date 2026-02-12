const router = require("express").Router();
const { z } = require("zod");
const MenuItem = require("../models/MenuItem");
const { asyncHandler } = require("../utils/asyncHandler");
const { authRequired, roleRequired } = require("../middleware/auth");

const MenuItemSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(""),
  category: z.string().optional().default("General"),
  priceCents: z.number().int().min(0),
  imageUrl: z.string().optional().default(""),
  isAvailable: z.boolean().optional().default(true)
});

// Public menu
router.get(
  "/menu",
  asyncHandler(async (_req, res) => {
    const items = await MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 });
    res.json({ items });
  })
);

// Admin CRUD
router.get(
  "/admin/menu",
  authRequired,
  roleRequired(["admin"]),
  asyncHandler(async (_req, res) => {
    const items = await MenuItem.find().sort({ category: 1, name: 1 });
    res.json({ items });
  })
);

router.post(
  "/admin/menu",
  authRequired,
  roleRequired(["admin"]),
  asyncHandler(async (req, res) => {
    const data = MenuItemSchema.parse(req.body);
    const item = await MenuItem.create(data);
    res.status(201).json({ item });
  })
);

router.put(
  "/admin/menu/:id",
  authRequired,
  roleRequired(["admin"]),
  asyncHandler(async (req, res) => {
    const data = MenuItemSchema.partial().parse(req.body);
    const item = await MenuItem.findByIdAndUpdate(req.params.id, { $set: data }, { new: true });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ item });
  })
);

router.delete(
  "/admin/menu/:id",
  authRequired,
  roleRequired(["admin"]),
  asyncHandler(async (req, res) => {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  })
);

module.exports = router;
