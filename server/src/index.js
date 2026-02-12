require("dotenv").config();
const http = require("http");

const { createApp } = require("./app");
const { connectDb } = require("./db");
const { initIo } = require("./sockets/io");

async function main() {
  const port = Number(process.env.PORT || 8080);

  await connectDb(process.env.MONGODB_URI);
  const app = createApp();
  const server = http.createServer(app);

  initIo(server, process.env.CORS_ORIGIN);

  server.listen(port, () => {
    console.log(`CafeFlow API listening on :${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
