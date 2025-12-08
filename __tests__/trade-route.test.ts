import { GET } from '../app/api/trade/route';

global.fetch = jest.fn();

describe('Trade API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    (fetch as jest.Mock).mockResolvedValue({
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

    (fetch as jest.Mock).mockResolvedValue({
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
});
