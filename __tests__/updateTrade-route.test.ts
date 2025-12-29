import { GET, POST } from '../app/api/trade/route';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
  cacheTag: jest.fn(),
}));

global.fetch = jest.fn();

// TextEncoderをグローバルに追加
if (!global.TextEncoder) {
  global.TextEncoder = require('util').TextEncoder;
}

// NextResponse.jsonをモック
jest.spyOn(NextResponse, 'json').mockImplementation((data) => {
  return { json: () => Promise.resolve(data), data } as any;
});

describe('UpdateTrade API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('キャッシュが更新されること', async () => {
    const response = await POST();
    const result = await response.json();

    expect(revalidateTag).toHaveBeenCalledWith('trade', 'max');
    expect(result.revalidated).toBe(true);
  });

  it('更新された時に時刻が更新されること', async () => {
    const mockData = {
      stations: {
        station1: { dev_degree: 1, recyclable: true, sell_price: {}, buy_price: {} },
      },
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const response1 = await GET();
    const result1 = await response1.json();
    const firstFetchTime = result1.fetchTime;

    await POST();
    await new Promise(resolve => setTimeout(resolve, 10));

    const response2 = await GET();
    const result2 = await response2.json();
    const secondFetchTime = result2.fetchTime;

    expect(secondFetchTime).not.toBe(firstFetchTime);
    expect(new Date(secondFetchTime).getTime()).toBeGreaterThan(new Date(firstFetchTime).getTime());
  });
});
