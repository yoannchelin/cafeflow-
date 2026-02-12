const router = require("express").Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "cafeflow-api", time: new Date().toISOString() });
});

module.exports = router;
