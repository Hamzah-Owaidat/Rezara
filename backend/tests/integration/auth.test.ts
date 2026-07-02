import request from "supertest";
import { prisma } from "../../src/lib/prisma";
import { hashPassword } from "../../src/utils/password";
import { resetDb } from "../helpers/resetDb";
import { app } from "../helpers/testApp";

describe("Auth", () => {
  const email = "test@rezara.local";
  const password = "correct-horse-battery-staple";

  beforeEach(async () => {
    await resetDb();
    await prisma.user.create({
      data: {
        name: "Test User",
        email,
        password: await hashPassword(password),
        role: "VIEWER",
      },
    });
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  describe("POST /api/v1/auth/login", () => {
    it("returns a token and user for correct credentials", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({ email, password });

      expect(res.status).toBe(200);
      expect(typeof res.body.token).toBe("string");
      expect(res.body.user.email).toBe(email);
      expect(res.body.user.password).toBeUndefined();
    });

    it("rejects an unknown email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "nope@rezara.local", password });

      expect(res.status).toBe(401);
    });

    it("rejects an incorrect password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email, password: "wrong-password" });

      expect(res.status).toBe(401);
    });

    it("rejects a malformed request body", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({ email: "not-an-email" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("returns 401 without a token", async () => {
      const res = await request(app).get("/api/v1/auth/me");

      expect(res.status).toBe(401);
    });

    it("returns 401 with a garbage token", async () => {
      const res = await request(app).get("/api/v1/auth/me").set("Authorization", "Bearer garbage");

      expect(res.status).toBe(401);
    });

    it("returns the current user with a valid token", async () => {
      const loginRes = await request(app).post("/api/v1/auth/login").send({ email, password });
      const token = loginRes.body.token;

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(email);
      expect(res.body.user.password).toBeUndefined();
    });
  });
});
