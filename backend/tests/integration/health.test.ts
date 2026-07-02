import request from "supertest";
import { app } from "../helpers/testApp";

describe("GET /api/v1/health", () => {
  it("returns 200 with an ok status", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.uptime).toBe("number");
  });
});

describe("unknown route", () => {
  it("returns 404", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.error.message).toContain("Route not found");
  });
});
