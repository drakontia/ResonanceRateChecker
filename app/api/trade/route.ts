import { cacheTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.TRADE_API_URL || "https://dummy.com/trade/";
  
  cacheTag('trade')
  const res = await fetch(url, {
    next: {
      revalidate: 3600, // 1時間キャッシュ
    },
  });
  
  const fetchTime = new Date();

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch trade data" }, { status: 500 });
  }

  const data = await res.json();

  // 指定されたIDの要素を削除
  const excludeIds = process.env.NEXT_PUBLIC_EXCLUDE_STATION_IDS?.replaceAll('\n', '').split(',') || [];
  if (data.stations) {
    for (const id of excludeIds) {
      if (data.stations[id]) {
        delete data.stations[id];
      }
    }

    // 指定されたCommodity IDを削除
    const excludeCommodityIds = process.env.NEXT_PUBLIC_EXCLUDE_COMMODITY_IDS?.replaceAll('\n', '').split(',') || [];
    for (const station of Object.values(data.stations)) {
      for (const commodityId of excludeCommodityIds) {
        if ((station as any).buy_price?.[commodityId]) {
          delete (station as any).buy_price[commodityId];
        }
        if ((station as any).sell_price?.[commodityId]) {
          delete (station as any).sell_price[commodityId];
        }
      }
    }
  }

  const stations = Object.entries(data.stations).map(
    ([stationId, station]: [string, any]) => {
      const sellItems = Object.entries(station.sell_price || {}).map(
        ([itemId, d]) => ({
          type: "sell",
          stationId,
          itemId,
          ...d,
        })
      );

      const buyItems = Object.entries(station.buy_price || {}).map(
        ([itemId, d]) => ({
          type: "buy",
          stationId,
          itemId,
          ...d,
        })
      );

      return {
        stationId,
        dev_degree: station.dev_degree,
        recyclable: station.recyclable,
        sellItems: [...sellItems],
        buyItems: [...buyItems],
      };
    }
  );

  return NextResponse.json({
    stations,
    fetchTime: fetchTime.toISOString()
  });
}
