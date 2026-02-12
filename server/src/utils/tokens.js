const jwt = require("jsonwebtoken");

function signAccessToken({ userId, role }, secret) {
  return jwt.sign({ sub: userId, role }, secret, { expiresIn: "15m" });
}

function signRefreshToken({ userId, role }, secret) {
  return jwt.sign({ sub: userId, role, type: "refresh" }, secret, { expiresIn: "30d" });
}

function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}

module.exports = { signAccessToken, signRefreshToken, verifyToken };
