import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

export type Commodity = {
  price: number;   // 価格
  is_rise: number;   // 価格変動傾向
  quota: number;     // 価格変動係数
  is_rare: number;   // 特産品
  ti: Timestamp;        // 価格の最後更新時間
  stock: number;     // 在庫数
  not_num: number;   // 不使用
  trend: number;        // 不使用
  trade_num: number;   // 不使用
}

export type Station = {
  sell_price: Record<string, Commodity>; // 売値
  buy_price: Record<string, Commodity>;  // 買値
  recyclable?: [string];           // 素材会回収
  dev_degree?: number;             // 都市発展度
}

export interface StationResponse {
  stations: Record<string, Station>;
}

// 個別のステーション情報を取得する際の型
export interface StationWithId extends Station {
  id: string;  // ステーションID
}

// 商品情報を拡張した型（商品IDを含む）
export interface CommodityWithId extends Commodity {
  id: string;           // 商品ID
  type: 'sell' | 'buy'; // 売値か買値かの区別
}

// 価格比較用の型
export interface PriceComparison {
  commodityId: string;
  sellStations: Array<{
    stationId: string;
    price: number;
    stock?: number;
    quota: number;
    trend: number;
  }>;
  buyStations: Array<{
    stationId: string;
    price: number;
    quota: number;
    trend: number;
  }>;
}

// フィルタリング用の型
export interface CommodityFilter {
  minPrice?: number;
  maxPrice?: number;
  trend?: number;
  isRare?: boolean;
  hasStock?: boolean;
  minStock?: number;
}

export interface StationFilter {
  hasRecyclable?: boolean;
  minDevDegree?: number;
  maxDevDegree?: number;
}

// Database types - now as Record (object) structures
export type CityDb = Record<string, string>;  // { "83000001": "シュグリシティ", ... }
export type TradeDb = Record<string, string>; // { "84700063": "カーマイン・メイミリメシ", ... }
export type GoodsDb = Record<string, string>; // { "82900001": "No.7 BEER", ... }

export interface GroupedTrade {
  goods_jp: string;
  trades: Trade[];
}

export interface StationWithItems extends Station {
  stationId: string;
  buyItems: any[];
  sellItems: any[];
}

export interface PriceTableRow {
  goodsJp: string;
  [stationId: string]: string | number;
}
