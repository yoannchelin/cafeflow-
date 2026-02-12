const { verifyToken } = require("../utils/tokens");

function authRequired(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing access token" });

  try {
    const payload = verifyToken(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired access token" });
  }
}

function roleRequired(roles) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    return next();
  };
}

module.exports = { authRequired, roleRequired };
