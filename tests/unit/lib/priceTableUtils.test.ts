import { describe, expect, it } from "vitest";
import { buildPriceMaps, buildTableData, calculateCellValues } from "@/lib/priceTableUtils";
import { PriceTableRow, StationWithItems } from "@/types/trade";

describe("priceTableUtils", () => {
  describe("buildPriceMaps", () => {
    it("returns empty maps when stations is null", () => {
      const result = buildPriceMaps(null);

      expect(result).toEqual({
        goodsPriceMap: {},
        goodsQuotaMap: {},
        goodsIsRiseMap: {},
        goodsTrendMap: {},
        stationIds: [],
      });
    });

    it("keeps max price per goods and station", () => {
      const stations = [
        {
          stationId: "S1",
          buyItems: [
            { itemId: "item-a", price: 100, quota: 0.9, is_rise: 0, trend: 0 },
            { itemId: "item-a", price: 120, quota: 1.2, is_rise: 1, trend: 1 },
          ],
          sellItems: [],
          sell_price: {},
          buy_price: {},
        },
        {
          stationId: "S2",
          buyItems: [
            { itemId: "item-a", price: 110, quota: 0.8, is_rise: 0, trend: 0 },
          ],
          sellItems: [],
          sell_price: {},
          buy_price: {},
        },
      ] as StationWithItems[];

      const result = buildPriceMaps(stations);

      expect(result.stationIds).toEqual(["S1", "S2"]);
      expect(result.goodsPriceMap["item-a"]["S1"]).toBe(120);
      expect(result.goodsQuotaMap["item-a"]["S1"]).toBe(1.2);
      expect(result.goodsIsRiseMap["item-a"]["S1"]).toBe(1);
      expect(result.goodsTrendMap["item-a"]["S1"]).toBe(1);
      expect(result.goodsPriceMap["item-a"]["S2"]).toBe(110);
    });
  });

  describe("buildTableData", () => {
    it("builds row data with station fields and fallback zeros", () => {
      const rows = buildTableData(
        {
          "item-a": { S1: 120 },
        },
        {
          "item-a": { S1: 1.2 },
        },
        {
          "item-a": { S1: 1 },
        },
        {
          "item-a": { S1: 1 },
        },
        ["S1", "S2"]
      );

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        goodsJp: "item-a",
        S1: 120,
        S1_quota: 1.2,
        S1_is_rise: 1,
        S1_trend: 1,
        S2: 0,
        S2_quota: 0,
        S2_is_rise: 0,
        S2_trend: 0,
      });
    });
  });

  describe("calculateCellValues", () => {
    it("highlights by max price among visible stations when showPercent is false", () => {
      const rowData: PriceTableRow = {
        goodsJp: "item-a",
        S1: 100,
        S1_quota: 0.8,
        S1_trend: 0,
        S2: 120,
        S2_quota: 0.9,
        S2_trend: 1,
        S3: 999,
        S3_quota: 2.0,
        S3_trend: 1,
      };

      const result = calculateCellValues(
        "S2",
        rowData,
        ["S1", "S2", "S3"],
        new Set(["S1", "S2"]),
        false
      );

      expect(result.displayValue).toBe("120");
      expect(result.isHighlighted).toBe(true);
      expect(result.colorClass).toBe("text-red-400");
      expect(result.trend).toBe(1);
      expect(result.quota).toBe(0.9);
    });

    it("highlights by max quota and formats percent when showPercent is true", () => {
      const rowData: PriceTableRow = {
        goodsJp: "item-a",
        S1: 100,
        S1_quota: 1.5,
        S1_trend: 1,
        S2: 120,
        S2_quota: 1.1,
        S2_trend: 0,
      };

      const result = calculateCellValues(
        "S1",
        rowData,
        ["S1", "S2"],
        new Set(["S1", "S2"]),
        true
      );

      expect(result.displayValue).toBe("150%");
      expect(result.isHighlighted).toBe(true);
      expect(result.colorClass).toBe("text-green-400");
    });
  });
});
