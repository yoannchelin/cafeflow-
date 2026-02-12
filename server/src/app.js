const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const health = require("./routes/health");
const auth = require("./routes/auth");
const menu = require("./routes/menu");
const orders = require("./routes/orders");
const staff = require("./routes/staff");
const { errorHandler } = require("./middleware/errorHandler");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: "200kb" }));
  app.use(morgan(process.env.NODE_ENV === "test" ? "tiny" : "dev"));

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true
    })
  );

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 120
    })
  );

  app.get("/", (_req, res) => res.send("CafeFlow API"));

  app.use("/api", health);
  app.use("/api", auth);
  app.use("/api", menu);
  app.use("/api", orders);
  app.use("/api", staff);

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
