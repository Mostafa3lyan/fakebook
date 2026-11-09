import { describe, it, expect } from "vitest";
import { formatTime, formatTimeAgo } from "@/lib/utils/date";

describe("Frontend Date Utilities", () => {
  describe("formatTime", () => {
    it("should return empty string for null/undefined", () => {
      expect(formatTime(undefined)).toBe("");
      expect(formatTime("")).toBe("");
    });

    it("should format a valid ISO timestamp into time string", () => {
      const formatted = formatTime("2026-05-15T14:30:00.000Z");
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe("string");
    });
  });

  describe("formatTimeAgo", () => {
    it("should return 'Recently' for empty or invalid input", () => {
      expect(formatTimeAgo("")).toBe("Recently");
      expect(formatTimeAgo(undefined)).toBe("Recently");
    });

    it("should return 'Just now' for recent timestamp", () => {
      const now = new Date().toISOString();
      expect(formatTimeAgo(now)).toBe("Just now");
    });

    it("should return compact minutes and hours (e.g. 10m, 2h) for past timestamp", () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      expect(formatTimeAgo(tenMinutesAgo)).toBe("10m");

      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      expect(formatTimeAgo(twoHoursAgo)).toBe("2h");
    });
  });
});
