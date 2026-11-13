import { Commodity, Station } from '@/types/trade';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

const JIAOZHI_CURRENCY_ID = '11401048';

function getPriceMultiplier(station: Station, stationId: string): number {
  if (station.currency !== JIAOZHI_CURRENCY_ID) {
    return 1;
  }

  if (typeof station.rate !== 'number' || typeof station.sid_rate_conf !== 'number') {
    throw new Error(`Missing Jiaozhi price rates for station ${stationId}`);
  }

  return station.rate * station.sid_rate_conf;
}

export async function GET() {
  const url = process.env.TRADE_API_URL || "https://dummy.com/trade/";
  
  const res = await fetch(url, {
    next: {
      revalidate: 300, // 5分キャッシュ
      tags: ['trade'],
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
        if ((station as Station).buy_price?.[commodityId]) {
          delete (station as Station).buy_price[commodityId];
        }
        if ((station as Station).sell_price?.[commodityId]) {
          delete (station as Station).sell_price[commodityId];
        }
      }
    }
  }

  const stations = Object.entries(data.stations as Record<string, Station>).map(
    ([stationId, station]) => {
      const priceMultiplier = getPriceMultiplier(station, stationId);
      const mapItems = (prices: Record<string, Commodity> | undefined, type: 'sell' | 'buy') =>
        Object.entries(prices || {}).map(([itemId, item]) => ({
          type,
          stationId,
          itemId,
          ...item,
          price: item.price * priceMultiplier,
        }));

      return {
        stationId,
        dev_degree: station.dev_degree,
        recyclable: station.recyclable,
        sellItems: mapItems(station.sell_price, 'sell'),
        buyItems: mapItems(station.buy_price, 'buy'),
      };
    }
  );

  return NextResponse.json({
    stations,
    fetchTime: fetchTime.toISOString()
  });
}

export async function POST() {
  revalidateTag('trade', {});
  return NextResponse.json({ revalidated: true });
}