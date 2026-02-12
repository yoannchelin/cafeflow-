const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff"], default: "staff" },
    refreshTokenHash: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
