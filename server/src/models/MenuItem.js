const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    category: { type: String, default: "General", trim: true },
    priceCents: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", MenuItemSchema);
