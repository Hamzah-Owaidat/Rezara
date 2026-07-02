import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("env", () => {
  it("uses provided values when valid URLs are set", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    process.env.BACKEND_API_URL = "https://api.example.com/api/v1";
    process.env.NEXT_PUBLIC_MEDIA_ORIGIN = "https://media.example.com";

    const { env } = await import("@/lib/env");

    expect(env.NEXT_PUBLIC_SITE_URL).toBe("https://example.com");
    expect(env.BACKEND_API_URL).toBe("https://api.example.com/api/v1");
    expect(env.NEXT_PUBLIC_MEDIA_ORIGIN).toBe("https://media.example.com");
  });

  it("falls back to localhost defaults when env vars are unset", async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.BACKEND_API_URL;
    delete process.env.NEXT_PUBLIC_MEDIA_ORIGIN;

    const { env } = await import("@/lib/env");

    expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
    expect(env.BACKEND_API_URL).toBe("http://localhost:4000/api/v1");
    expect(env.NEXT_PUBLIC_MEDIA_ORIGIN).toBe("http://localhost:4000");
  });

  it("throws when a provided value is not a valid URL", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SITE_URL = "not-a-url";

    await expect(import("@/lib/env")).rejects.toThrow();
  });
});
