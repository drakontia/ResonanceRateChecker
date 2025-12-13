export function useFilteredAndSortedItems(
  allItems: any[],
  searchQuery: string,
  sortOrder: string,
) {
  const filteredItems = allItems.filter((item: any) => {
    return item.goodsJp.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Keep original order for the 'default' sort (no reordering)
  if (sortOrder === 'default') {
    return filteredItems;
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
