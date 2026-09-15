import { describe, expect, it } from "vitest";
import { mapPriceToPlan, PLANS } from "@/lib/stripe";

describe("mapPriceToPlan", () => {
  it("maps only the configured price ids and never guesses", () => {
    const starter = PLANS.STARTER.monthlyPriceId;
    if (starter) expect(mapPriceToPlan(starter)).toBe("STARTER");
    expect(mapPriceToPlan("price_1SxK9zLmNoPq")).toBeNull();
    expect(mapPriceToPlan("price_pro_looks_like_pro")).toBeNull();
    expect(mapPriceToPlan(undefined)).toBeNull();
  });
});
