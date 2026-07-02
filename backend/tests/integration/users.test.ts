import request from "supertest";
import { prisma } from "../../src/lib/prisma";
import { signAuthToken } from "../../src/utils/jwt";
import { hashPassword } from "../../src/utils/password";
import { resetDb } from "../helpers/resetDb";
import { app } from "../helpers/testApp";

async function createUser(role: "ADMIN" | "EDITOR" | "VIEWER", email: string) {
  const user = await prisma.user.create({
    data: {
      name: role,
      email,
      password: await hashPassword("irrelevant-password"),
      role,
    },
  });

  return { user, token: signAuthToken({ id: user.id, role: user.role }) };
}

describe("Users module", () => {
  let adminToken: string;
  let editorToken: string;
  let viewerToken: string;
  let editorId: number;

  beforeEach(async () => {
    await resetDb();

    const admin = await createUser("ADMIN", "admin@rezara.local");
    const editor = await createUser("EDITOR", "editor@rezara.local");
    const viewer = await createUser("VIEWER", "viewer@rezara.local");

    adminToken = admin.token;
    editorToken = editor.token;
    viewerToken = viewer.token;
    editorId = editor.user.id;
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  describe("GET /api/v1/users", () => {
    it("returns 401 without a token", async () => {
      const res = await request(app).get("/api/v1/users");
      expect(res.status).toBe(401);
    });

    it("returns 403 for EDITOR", async () => {
      const res = await request(app).get("/api/v1/users").set("Authorization", `Bearer ${editorToken}`);
      expect(res.status).toBe(403);
    });

    it("returns 403 for VIEWER", async () => {
      const res = await request(app).get("/api/v1/users").set("Authorization", `Bearer ${viewerToken}`);
      expect(res.status).toBe(403);
    });

    it("returns the user list for ADMIN without leaking passwords", async () => {
      const res = await request(app).get("/api/v1/users").set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users).toHaveLength(3);
      for (const user of res.body.users) {
        expect(user.password).toBeUndefined();
      }
    });
  });

  describe("POST /api/v1/users", () => {
    const newUser = { name: "New Editor", email: "new-editor@rezara.local", password: "supersecret1", role: "EDITOR" };

    it("returns 403 for EDITOR", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${editorToken}`)
        .send(newUser);

      expect(res.status).toBe(403);
    });

    it("creates a user for ADMIN and never returns the password", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newUser);

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe(newUser.email);
      expect(res.body.user.password).toBeUndefined();

      const created = await prisma.user.findUnique({ where: { email: newUser.email } });
      expect(created?.password).not.toBe(newUser.password);
    });

    it("rejects a duplicate email with 409", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ...newUser, email: "editor@rezara.local" });

      expect(res.status).toBe(409);
    });

    it("rejects an invalid payload with 400", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "No Email" });

      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /api/v1/users/:id", () => {
    it("returns 403 for VIEWER", async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${editorId}`)
        .set("Authorization", `Bearer ${viewerToken}`)
        .send({ name: "Renamed" });

      expect(res.status).toBe(403);
    });

    it("updates the user for ADMIN", async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${editorId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "VIEWER" });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe("VIEWER");
      expect(res.body.user.password).toBeUndefined();
    });

    it("returns 404 for a non-existent user", async () => {
      const res = await request(app)
        .patch("/api/v1/users/999999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Ghost" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    it("returns 403 for EDITOR", async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${editorId}`)
        .set("Authorization", `Bearer ${editorToken}`);

      expect(res.status).toBe(403);
    });

    it("deletes the user for ADMIN", async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${editorId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(204);

      const found = await prisma.user.findUnique({ where: { id: editorId } });
      expect(found).toBeNull();
    });
  });
});
