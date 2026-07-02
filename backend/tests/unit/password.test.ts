import { comparePassword, hashPassword } from "../../src/utils/password";

describe("password utils", () => {
  it("hashes a password and can verify it against the hash", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");

    expect(hash).not.toBe("correct-horse-battery-staple");
    await expect(comparePassword("correct-horse-battery-staple", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password against a hash", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");

    await expect(comparePassword("wrong-password", hash)).resolves.toBe(false);
  });
});
