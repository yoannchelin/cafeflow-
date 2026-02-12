const router = require("express").Router();
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const { z } = require("zod");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");
const { signAccessToken, signRefreshToken, verifyToken } = require("../utils/tokens");

router.use(cookieParser());

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

function cookieOptions() {
  const secure = String(process.env.COOKIE_SECURE || "false") === "true";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/api/auth/refresh",
    maxAge: 1000 * 60 * 60 * 24 * 30 // 30d
  };
}

router.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role }, process.env.JWT_ACCESS_SECRET);
    const refreshToken = signRefreshToken({ userId: user._id.toString(), role: user.role }, process.env.JWT_REFRESH_SECRET);

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie("rf", refreshToken, cookieOptions());
    return res.json({ accessToken, user: { email: user.email, role: user.role } });
  })
);

router.post(
  "/auth/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.rf;
    if (!token) return res.status(401).json({ message: "Missing refresh token" });

    let payload;
    try {
      payload = verifyToken(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid/expired refresh token" });
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.refreshTokenHash) return res.status(401).json({ message: "Refresh denied" });

    const ok = await bcrypt.compare(token, user.refreshTokenHash);
    if (!ok) return res.status(401).json({ message: "Refresh denied" });

    const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role }, process.env.JWT_ACCESS_SECRET);
    return res.json({ accessToken, user: { email: user.email, role: user.role } });
  })
);

router.post(
  "/auth/logout",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.rf;
    if (token) {
      try {
        const payload = verifyToken(token, process.env.JWT_REFRESH_SECRET);
        await User.updateOne({ _id: payload.sub }, { $set: { refreshTokenHash: null } });
      } catch {
        // ignore
      }
    }
    res.clearCookie("rf", { path: "/api/auth/refresh" });
    return res.json({ ok: true });
  })
);

module.exports = router;
