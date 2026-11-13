import { describe, expect, it } from "vitest";
import { formatTimeAgo } from "@/lib/relativeTime";

describe("formatTimeAgo", () => {
  const nowSeconds = 1_800_000_000;

  it("formats elapsed Unix seconds as whole minutes", () => {
    expect(formatTimeAgo(nowSeconds - 32 * 60 - 59, nowSeconds)).toBe("32分前");
  });

  it("shows just now for timestamps less than a minute old", () => {
    expect(formatTimeAgo(nowSeconds - 59, nowSeconds)).toBe("ただ今");
  });

  it("does not display invalid, missing, or future timestamps", () => {
    expect(formatTimeAgo(undefined, nowSeconds)).toBeNull();
    expect(formatTimeAgo(Number.NaN, nowSeconds)).toBeNull();
    expect(formatTimeAgo(-1, nowSeconds)).toBeNull();
    expect(formatTimeAgo(nowSeconds + 1, nowSeconds)).toBeNull();
  });
});
