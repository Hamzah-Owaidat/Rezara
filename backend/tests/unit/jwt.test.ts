import { signAuthToken, verifyAuthToken } from "../../src/utils/jwt";

describe("jwt utils", () => {
  it("signs a token and verifies it back to the original payload", () => {
    const token = signAuthToken({ id: 1, role: "ADMIN" });
    const payload = verifyAuthToken(token);

    expect(payload.id).toBe(1);
    expect(payload.role).toBe("ADMIN");
  });

  it("throws when verifying a malformed token", () => {
    expect(() => verifyAuthToken("not-a-real-token")).toThrow();
  });
});
