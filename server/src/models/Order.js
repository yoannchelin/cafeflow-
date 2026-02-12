const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    name: { type: String, required: true },
    priceCents: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    table: { type: String, default: "" },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["NEW", "IN_PROGRESS", "READY", "COMPLETED", "CANCELLED"],
      default: "NEW"
    },
    items: { type: [OrderItemSchema], required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
