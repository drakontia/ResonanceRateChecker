import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

export interface Commodity {
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

export interface Station {
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

export interface Trade {
  id: string;
  city_cn: string;
  city_jp: string;
  trade_type: string;
  goods_cn: string;
  goods_jp: string;
}

export interface GroupedTrade {
  goods_jp: string;
  trades: Trade[];
}
