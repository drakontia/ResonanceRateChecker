export function useFilteredAndSortedItems(
  allItems: any[],
  searchQuery: string,
  sortOrder: string,
) {
  const filteredItems = allItems.filter((item: any) => {
    return item.goodsJp.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (sortOrder === 'default') {
    return filteredItems;
  }

  if (sortOrder === 'price-high-grouped') {
    // ① goodsJp でグルーピング
    const groups: Record<string, typeof allItems> = {};
    for (const item of filteredItems) {
      if (!groups[item.goodsJp]) groups[item.goodsJp] = [];
      groups[item.goodsJp].push(item);
    }
    // ② 各グループ内を price 降順でソート
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => b.price - a.price);
    }
    // ③④ グループを最大価格（代表値）で降順ソートし、フラット化
    return Object.values(groups)
      .sort((a, b) => b[0].price - a[0].price)
      .flat();
  }

  const sortedItems = filteredItems.toSorted((a: any, b: any) => {
    if (sortOrder === 'price-high') {
      return b.price - a.price;
    } else if (sortOrder === 'price-low') {
      return a.price - b.price;
    }
    return a.goodsJp.localeCompare(b.goodsJp);
  });

  return sortedItems;
}
