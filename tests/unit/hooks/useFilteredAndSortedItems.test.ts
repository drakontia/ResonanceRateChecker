import { describe, expect, it } from 'vitest';

import { useFilteredAndSortedItems } from '@/hooks/useFilteredAndSortedItems';

describe('useFilteredAndSortedItems', () => {
  const items = [
    { goodsJp: 'ビール', price: 1000 },
    { goodsJp: 'ワイン', price: 1500 },
    { goodsJp: 'アップル', price: 500 },
  ];

  it('returns default order when sortOrder is default', () => {
    const result = useFilteredAndSortedItems(items, '', 'default');
    expect(result.map((item) => item.goodsJp)).toEqual(['ビール', 'ワイン', 'アップル']);
  });

  it('sorts by price-high', () => {
    const result = useFilteredAndSortedItems(items, '', 'price-high');
    expect(result.map((item) => item.goodsJp)).toEqual(['ワイン', 'ビール', 'アップル']);
  });

  it('sorts by price-low', () => {
    const result = useFilteredAndSortedItems(items, '', 'price-low');
    expect(result.map((item) => item.goodsJp)).toEqual(['アップル', 'ビール', 'ワイン']);
  });

  it('sorts by name when sortOrder is other', () => {
    const result = useFilteredAndSortedItems(items, '', 'name');
    expect(result.map((item) => item.goodsJp)).toEqual(['アップル', 'ビール', 'ワイン']);
  });

  it('filters by search query', () => {
    const result = useFilteredAndSortedItems(items, 'ビ', 'default');
    expect(result.map((item) => item.goodsJp)).toEqual(['ビール']);
  });

  describe('price-high-grouped', () => {
    it('keeps same-product items together, sorted by max price descending', () => {
      const multiStationItems = [
        { goodsJp: 'シルクのダウン枕', price: 850, stationId: 'タワー' },
        { goodsJp: 'レースドレス',     price: 900, stationId: 'タワー' },
        { goodsJp: 'シルクのダウン枕', price: 1000, stationId: 'ケープ' },
      ];
      const result = useFilteredAndSortedItems(multiStationItems, '', 'price-high-grouped');
      // シルクのダウン枕 group max=1000 > レースドレス group max=900
      // シルクのダウン枕 group is internally sorted: ケープ(1000) then タワー(850)
      expect(result.map((i) => `${i.goodsJp}(${i.stationId})`)).toEqual([
        'シルクのダウン枕(ケープ)',
        'シルクのダウン枕(タワー)',
        'レースドレス(タワー)',
      ]);
    });

    it('sorts groups by their max price, not individual item price', () => {
      const multiStationItems = [
        { goodsJp: '嵐心錦衣', price: 1200, stationId: 'タワー' },
        { goodsJp: '嵐心錦衣', price: 900,  stationId: 'ケープ' },
        { goodsJp: 'シルクのダウン枕', price: 1100, stationId: 'ケープ' },
        { goodsJp: 'シルクのダウン枕', price: 700,  stationId: 'タワー' },
      ];
      const result = useFilteredAndSortedItems(multiStationItems, '', 'price-high-grouped');
      // 嵐心錦衣 max=1200 > シルクのダウン枕 max=1100
      expect(result.map((i) => i.goodsJp)).toEqual([
        '嵐心錦衣', '嵐心錦衣',
        'シルクのダウン枕', 'シルクのダウン枕',
      ]);
      // within 嵐心錦衣: タワー(1200) before ケープ(900)
      expect(result[0].stationId).toBe('タワー');
      expect(result[1].stationId).toBe('ケープ');
    });

    it('returns single-item groups in price descending order', () => {
      const result = useFilteredAndSortedItems(items, '', 'price-high-grouped');
      expect(result.map((item) => item.goodsJp)).toEqual(['ワイン', 'ビール', 'アップル']);
    });

    it('filters by search query before grouping', () => {
      const multiStationItems = [
        { goodsJp: 'シルクのダウン枕', price: 1000, stationId: 'ケープ' },
        { goodsJp: 'レースドレス',     price: 900,  stationId: 'タワー' },
        { goodsJp: 'シルクのダウン枕', price: 850,  stationId: 'タワー' },
      ];
      const result = useFilteredAndSortedItems(multiStationItems, 'シルク', 'price-high-grouped');
      expect(result).toHaveLength(2);
      expect(result.every((i) => i.goodsJp === 'シルクのダウン枕')).toBe(true);
    });
  });
});
