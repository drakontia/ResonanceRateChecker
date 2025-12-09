export function useFilteredAndSortedItems(
  allItems: any[],
  searchQuery: string,
  sortOrder: string,
  favorites: Set<string>
) {
  const filteredItems = allItems.filter((item: any) => {
    return item.goodsJp.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedItems = filteredItems.toSorted((a: any, b: any) => {
    const aKey = `${a.stationId}-${a.goodsJp}`;
    const bKey = `${b.stationId}-${b.goodsJp}`;
    const aFav = favorites.has(aKey);
    const bFav = favorites.has(bKey);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;

    if (sortOrder === 'price-high') {
      return b.price - a.price;
    } else if (sortOrder === 'price-low') {
      return a.price - b.price;
    }
    return a.goodsJp.localeCompare(b.goodsJp);
  });

  return sortedItems;
}
