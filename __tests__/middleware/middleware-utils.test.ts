import { describe, it, expect } from "vitest";
import { classifyRoute } from "@/middleware-utils";

// ── Tests ───────────────────────────────────────────────────

describe("classifyRoute", () => {
  // ── isPublic ─────────────────────────────────────────────

  describe("public routes (no auth required)", () => {
    it("classifies /login as public", () => {
      expect(classifyRoute("/login").isPublic).toBe(true);
    });

    it("classifies /auth/callback as public", () => {
      expect(classifyRoute("/auth/callback").isPublic).toBe(true);
    });

    it("classifies /demo as public", () => {
      expect(classifyRoute("/demo").isPublic).toBe(true);
    });

    it("classifies /demo/grilla as public", () => {
      expect(classifyRoute("/demo/grilla").isPublic).toBe(true);
    });

    it("classifies /demo/agenda as public", () => {
      expect(classifyRoute("/demo/agenda").isPublic).toBe(true);
    });

    it("classifies /grilla as NOT public", () => {
      expect(classifyRoute("/grilla").isPublic).toBe(false);
    });

    it("classifies / as NOT public", () => {
      expect(classifyRoute("/").isPublic).toBe(false);
    });
  });

  // ── isOnboarding ─────────────────────────────────────────

  describe("onboarding route", () => {
    it("classifies /onboarding as isOnboarding", () => {
      expect(classifyRoute("/onboarding").isOnboarding).toBe(true);
    });

    it("classifies /grilla as NOT isOnboarding", () => {
      expect(classifyRoute("/grilla").isOnboarding).toBe(false);
    });
  });

  // ── isAdmin ──────────────────────────────────────────────

  describe("admin routes", () => {
    it("classifies /admin as isAdmin", () => {
      expect(classifyRoute("/admin").isAdmin).toBe(true);
    });

    it("classifies /admin/users as isAdmin", () => {
      expect(classifyRoute("/admin/users").isAdmin).toBe(true);
    });

    it("classifies /grilla as NOT isAdmin", () => {
      expect(classifyRoute("/grilla").isAdmin).toBe(false);
    });
  });
});
