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
});
