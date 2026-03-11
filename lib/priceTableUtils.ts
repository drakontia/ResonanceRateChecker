import { StationWithItems, PriceTableRow } from "@/types/trade";
import { tradeDb } from "@/lib/tradeDb";

export interface PriceMaps {
  goodsPriceMap: Record<string, Record<string, number>>;
  goodsQuotaMap: Record<string, Record<string, number>>;
  goodsIsRiseMap: Record<string, Record<string, number>>;
  goodsTrendMap: Record<string, Record<string, number>>;
  stationIds: string[];
}

/**
 * ステーションデータから価格/割合/トレンドマップを構築
 */
export function buildPriceMaps(stations: StationWithItems[] | null): PriceMaps {
  const goodsPriceMap: Record<string, Record<string, number>> = {};
  const goodsQuotaMap: Record<string, Record<string, number>> = {};
  const goodsIsRiseMap: Record<string, Record<string, number>> = {};
  const goodsTrendMap: Record<string, Record<string, number>> = {};
  const stationIds: Set<string> = new Set();

  if (!stations) {
    return { goodsPriceMap, goodsQuotaMap, goodsIsRiseMap, goodsTrendMap, stationIds: [] };
  }

  for (const station of stations) {
    stationIds.add(station.stationId);
    for (const item of station.buyItems || []) {
      const goodsJp = tradeDb[item.itemId] || item.itemId;
      if (!goodsPriceMap[goodsJp]) {
        goodsPriceMap[goodsJp] = {};
        goodsQuotaMap[goodsJp] = {};
        goodsIsRiseMap[goodsJp] = {};
        goodsTrendMap[goodsJp] = {};
      }
      if (!goodsPriceMap[goodsJp][station.stationId] || goodsPriceMap[goodsJp][station.stationId] < item.price) {
        goodsPriceMap[goodsJp][station.stationId] = item.price;
        goodsQuotaMap[goodsJp][station.stationId] = (item.quota !== undefined ? item.quota : 0);
        goodsIsRiseMap[goodsJp][station.stationId] = (item.is_rise !== undefined ? item.is_rise : 0);
        goodsTrendMap[goodsJp][station.stationId] = (item.trend !== undefined ? item.trend : 0);
      }
    }
  }

  return {
    goodsPriceMap,
    goodsQuotaMap,
    goodsIsRiseMap,
    goodsTrendMap,
    stationIds: Array.from(stationIds),
  };
}

/**
 * 価格マップからテーブル用のデータ行を生成
 */
export function buildTableData(
  goodsPriceMap: Record<string, Record<string, number>>,
  goodsQuotaMap: Record<string, Record<string, number>>,
  goodsIsRiseMap: Record<string, Record<string, number>>,
  goodsTrendMap: Record<string, Record<string, number>>,
  stationIds: string[]
): PriceTableRow[] {
  return Object.keys(goodsPriceMap).map(goodsJp => ({
    goodsJp,
    ...stationIds.reduce((acc, stationId) => {
      acc[stationId] = goodsPriceMap[goodsJp][stationId] || 0;
      acc[`${stationId}_quota`] = goodsQuotaMap[goodsJp]?.[stationId] ?? 0;
      acc[`${stationId}_is_rise`] = goodsIsRiseMap[goodsJp]?.[stationId] ?? 0;
      acc[`${stationId}_trend`] = goodsTrendMap[goodsJp]?.[stationId] ?? 0;
      return acc;
    }, {} as Record<string, number>)
  } as PriceTableRow));
}

/**
 * 表示価値と色クラスを計算するヘルパー
 */
export interface CellRenderValues {
  displayValue: string;
  colorClass: string;
  isHighlighted: boolean;
  trend: number | undefined;
  quota: number | undefined;
}

export function calculateCellValues(
  stationId: string,
  rowData: PriceTableRow,
  stationIds: string[],
  visibleStationIds: Set<string>,
  showPercent: boolean
): CellRenderValues {
  const value = rowData[stationId] as number;
  const quota = rowData[`${stationId}_quota`] as number | undefined;
  const trend = rowData[`${stationId}_trend`] as number | undefined;

  // 表示されている駅の価格と％のみを取得
  const visiblePrices = stationIds
    .filter(id => visibleStationIds.has(id))
    .map(id => rowData[id] as number)
    .filter(price => price > 0);

  const visibleQuotas = stationIds
    .filter(id => visibleStationIds.has(id))
    .map(id => rowData[`${id}_quota`] as number | undefined)
    .filter((q): q is number => q !== undefined && q > 0);

  const maxPrice = Math.max(...visiblePrices, 0);
  const maxQuota = Math.max(...visibleQuotas, 0);

  const isMaxPrice = value > 0 && value === maxPrice;
  const isMaxQuota = quota !== undefined && quota > 0 && quota === maxQuota;

  const colorClass = quota !== undefined ? (quota > 1 ? 'text-green-400' : 'text-red-400') : '';

  const displayValue = showPercent 
    ? (quota !== undefined ? `${(quota * 100).toFixed(0)}%` : '-')
    : (value ? value.toLocaleString() : '-');

  const isHighlighted = showPercent ? isMaxQuota : isMaxPrice;

  return {
    displayValue,
    colorClass,
    isHighlighted,
    trend,
    quota,
  };
}
