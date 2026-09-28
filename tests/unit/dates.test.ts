import { describe, test, expect } from "vitest";
import { formatRange } from "../../src/lib/dates";

describe("formatRange", () => {
  test("month precision with present", () => {
    expect(formatRange("2024-12", "present")).toBe("Dec 2024 – Present");
  });
  test("month precision closed range", () => {
    expect(formatRange("2022-08", "2024-11")).toBe("Aug 2022 – Nov 2024");
  });
  test("year precision", () => {
    expect(formatRange("2020", "2022")).toBe("2020 – 2022");
  });
  test("single year when no end", () => {
    expect(formatRange("2026")).toBe("2026");
  });
  test("rejects malformed input", () => {
    expect(() => formatRange("Dec 2024")).toThrow(/invalid date/i);
    expect(() => formatRange("2024-13")).toThrow(/invalid date/i);
  });
});
