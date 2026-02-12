const request = require("supertest");
const { createApp } = require("../src/app");

describe("GET /api/health", () => {
  it("returns ok", async () => {
    process.env.CORS_ORIGIN = "http://localhost";
    const app = createApp();
    const res = await request(app).get("/api/health").expect(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.service).toBe("cafeflow-api");
  });
});
