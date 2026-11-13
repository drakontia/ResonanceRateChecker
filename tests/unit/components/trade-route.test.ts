
import { vi } from 'vitest';

import { GET } from '../../../app/api/trade/route';

// NextResponse.jsonをモック
vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: any) => ({
      json: async () => data,
    }),
  },
}));

const fetchMock = vi.fn();
global.fetch = fetchMock as unknown as typeof fetch;

// TextEncoderをグローバルに追加
if (!global.TextEncoder) {
  global.TextEncoder = require('util').TextEncoder;
}

describe('Trade API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('指定されたStationが除外されること', async () => {
    process.env.NEXT_PUBLIC_EXCLUDE_STATION_IDS = 'station1,station2';
    delete process.env.NEXT_PUBLIC_EXCLUDE_COMMODITY_IDS;
    
    const mockData = {
      stations: {
        station1: { dev_degree: 1, recyclable: true, sell_price: {}, buy_price: {} },
        station2: { dev_degree: 2, recyclable: false, sell_price: {}, buy_price: {} },
        station3: { dev_degree: 3, recyclable: true, sell_price: {}, buy_price: {} },
      },
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const response = await GET();
    const result = await response.json();

    expect(result.stations).toHaveLength(1);
    expect(result.stations[0].stationId).toBe('station3');
    expect(result.stations.find((s: any) => s.stationId === 'station1')).toBeUndefined();
    expect(result.stations.find((s: any) => s.stationId === 'station2')).toBeUndefined();
  });

  it('指定されたCommodityが除外されること', async () => {
    delete process.env.NEXT_PUBLIC_EXCLUDE_STATION_IDS;
    process.env.NEXT_PUBLIC_EXCLUDE_COMMODITY_IDS = 'item1,item2';
    
    const mockData = {
      stations: {
        station1: {
          dev_degree: 1,
          recyclable: true,
          sell_price: { item1: { price: 100 }, item2: { price: 200 }, item3: { price: 300 } },
          buy_price: { item1: { price: 90 }, item2: { price: 180 }, item3: { price: 270 } },
        },
      },
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const response = await GET();
    const result = await response.json();

    expect(result.stations[0].sellItems).toHaveLength(1);
    expect(result.stations[0].sellItems[0].itemId).toBe('item3');
    expect(result.stations[0].buyItems).toHaveLength(1);
    expect(result.stations[0].buyItems[0].itemId).toBe('item3');
  });

  it('交子の買値と売値をrateとsid_rate_confで換算し、他通貨は変更しないこと', async () => {
    delete process.env.NEXT_PUBLIC_EXCLUDE_STATION_IDS;
    delete process.env.NEXT_PUBLIC_EXCLUDE_COMMODITY_IDS;

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        stations: {
          jiaozhi: {
            rate: 1.5,
            sid_rate_conf: 0.2,
            currency: '11401048',
            sell_price: { item1: { price: 100 } },
            buy_price: { item1: { price: 200 } },
          },
          ironCoin: {
            rate: 1.5,
            sid_rate_conf: 0.2,
            currency: '11400001',
            sell_price: { item1: { price: 100 } },
            buy_price: { item1: { price: 200 } },
          },
        },
      }),
    });

    const response = await GET();
    const result = await response.json();
    const stations = result.stations as {
      stationId: string;
      buyItems: { price: number }[];
      sellItems: { price: number }[];
    }[];
    const jiaozhiStation = stations.find((station) => station.stationId === 'jiaozhi');
    const ironCoinStation = stations.find((station) => station.stationId === 'ironCoin');

    expect(jiaozhiStation?.buyItems[0]?.price).toBeCloseTo(60);
    expect(jiaozhiStation?.sellItems[0]?.price).toBeCloseTo(30);
    expect(ironCoinStation?.buyItems[0]?.price).toBe(200);
    expect(ironCoinStation?.sellItems[0]?.price).toBe(100);
  });
});
