"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { CardGrid } from "@/components/cardGrid";
import { Title } from "@/components/title";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import SearchBar from "@/components/searchBar";
import StationSelector from "@/components/stationSelector";
import SortSelector from "@/components/sortSelector";
import PriceTableFilter from "@/components/priceTableFilter";
import StationDropdown from "@/components/stationDropdown";
import LastUpdateTime from "@/components/lastUpdateTime";
import { ThemeToggle } from "@/components/themeToggle";
import { DataTable } from "@/components/ui/data-table";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import { ArrowUpDown, StarIcon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ColumnDef } from "@tanstack/react-table";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'cards' | 'favorites'>('cards');
  const [stations, setStations] = useState<any>(null);
  const [tradeData, setTradeData] = useState<Record<string, string>>({});
  const [cityData, setCityData] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorites-overview');
      return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
    }
    return new Set();
  });
  const [favoritesPrices, setFavoritesPrices] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorites-prices');
      return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
    }
    return new Set();
  });
  const [fetchTime, setFetchTime] = useState<Date | null>(null);
  const [timeAgo, setTimeAgo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>('default');
  const [visibleStations, setVisibleStations] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/trade')
      .then(res => res.json())
      .then(result => {
        setStations(result.stations);
        setFetchTime(new Date(result.fetchTime));
      })
      .catch(console.error);
    fetch('/db/trade_db.json')
      .then(res => res.json())
      .then((data: Array<{ id: string; goods_jp: string }>) => {
        const tradeMap: Record<string, string> = {};
        for (const item of data) {
          tradeMap[item.id] = item.goods_jp;
        }
        setTradeData(tradeMap);
      })
      .catch(console.error);
    fetch('/db/city_db.json')
      .then(res => res.json())
      .then((data: Array<{ id: string; jp: string }>) => {
        const cityMap: Record<string, string> = {};
        for (const city of data) {
          cityMap[city.id] = city.jp;
        }
        setCityData(cityMap);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!fetchTime) return;
    const updateTimeAgo = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - fetchTime.getTime()) / 1000 / 60);
      setTimeAgo(diff === 0 ? "ただ今" : `${diff}分前`);
    };
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000);
    return () => clearInterval(interval);
  }, [fetchTime]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'favorites-overview') return;
      try {
        const newVal = e.newValue;
        const parsed = newVal ? JSON.parse(newVal) as string[] : [];
        setFavorites(new Set(parsed));
      } catch (err) {
        setFavorites(new Set());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!stations || (stations as any[]).length === 0) return;
    const ids = Array.from(new Set((stations as any[]).map((s: any) => s.stationId)));
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('visibleStations');
      if (saved) {
        setVisibleStations(new Set(JSON.parse(saved)));
      } else {
        setVisibleStations(new Set(ids));
      }
    } else {
      setVisibleStations(new Set(ids));
    }
  }, [stations]);

  const toggleStation = (stationId: string) => {
    setVisibleStations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stationId)) newSet.delete(stationId);
      else newSet.add(stationId);
      localStorage.setItem('visibleStations', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  // Hooks must be called unconditionally before any early returns
  // Define getColumns first as useMemo must be at top level
  const stationIds = stations ? Array.from(new Set((stations as any[]).map((s: any) => s.stationId))) : [];

  const allItems = stations ? (stations as any[]).flatMap((station: any) =>
    station.buyItems.map((item: any) => ({
      ...item,
      stationId: station.stationId,
      goodsJp: tradeData[item.itemId] || item.itemId
    }))
  ) : [];

  const favoriteItems = allItems.filter((item: any) => {
    const matchesSearch = item.goodsJp.toLowerCase().includes(searchQuery.toLowerCase());
    return favorites.has(`${item.stationId}-${item.goodsJp}`) && matchesSearch;
  });

  const toggleFavorite = (stationId: string, goodsJp: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      const key = `${stationId}-${goodsJp}`;
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      localStorage.setItem('favorites-overview', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  // Pricesページ側のお気に入りを扱う（テーブル表示で使用）
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'favorites-prices') return;
      try {
        const newVal = e.newValue;
        const parsed = newVal ? JSON.parse(newVal) as string[] : [];
        setFavoritesPrices(new Set(parsed));
      } catch (err) {
        setFavoritesPrices(new Set());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleFavoritePrices = (goodsJp: string) => {
    setFavoritesPrices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goodsJp)) {
        newSet.delete(goodsJp);
      } else {
        newSet.add(goodsJp);
      }
      localStorage.setItem('favorites-prices', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  // build price/quota/isRise maps for table (same logic as prices page)
  const goodsPriceMap: Record<string, Record<string, number>> = {};
  const goodsQuotaMap: Record<string, Record<string, number>> = {};
  const goodsIsRiseMap: Record<string, Record<string, number>> = {};
  if (stations) {
    for (const station of stations as any[]) {
      for (const item of station.buyItems || []) {
        const goodsJp = tradeData[item.itemId] || item.itemId;
        if (!goodsPriceMap[goodsJp]) {
          goodsPriceMap[goodsJp] = {};
          goodsQuotaMap[goodsJp] = {};
          goodsIsRiseMap[goodsJp] = {};
        }
        if (!goodsPriceMap[goodsJp][station.stationId] || goodsPriceMap[goodsJp][station.stationId] < item.price) {
          goodsPriceMap[goodsJp][station.stationId] = item.price;
          goodsQuotaMap[goodsJp][station.stationId] = (item.quota !== undefined ? item.quota : 0);
          goodsIsRiseMap[goodsJp][station.stationId] = (item.is_rise !== undefined ? item.is_rise : 0);
        }
      }
    }
  }

  const tableData = Object.keys(goodsPriceMap).map(goodsJp => ({
    goodsJp,
    ...stationIds.reduce((acc, stationId) => {
      acc[stationId] = goodsPriceMap[goodsJp][stationId] || 0;
      acc[`${stationId}_quota`] = goodsQuotaMap[goodsJp]?.[stationId] ?? 0;
      acc[`${stationId}_is_rise`] = goodsIsRiseMap[goodsJp]?.[stationId] ?? 0;
      return acc;
    }, {} as Record<string, number>)
  }));

  const getColumns = useMemo(() => (stationList: string[]) => ([
    {
      accessorKey: "goodsJp",
      header: ({ column }: any) => (
        <button
          type="button"
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          商品
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: ({ row }: any) => {
        const goodsJp = row.getValue("goodsJp") as string;
        // Table in Home should reflect Prices page favorites
        const isFavorite = favoritesPrices.has(goodsJp);
        return (
          <div className="flex items-center gap-2">
            <div className="font-medium">{goodsJp}</div>
            <Toggle
              pressed={isFavorite}
              onPressedChange={() => toggleFavoritePrices(goodsJp)}
              aria-label="toggle favorite"
              size="sm"
              className="p-1 h-auto data-[state=on]:*:[svg]:fill-yellow-500 data-[state=on]:*:[svg]:stroke-yellow-500 hover:bg-accent"
            >
              <StarIcon className="h-4 w-4" />
            </Toggle>
          </div>
        );
      },
    },
    ...stationList.map(stationId => ({
      accessorKey: stationId,
      header: ({ column }: any) => (
        <button
          type="button"
          className="flex items-center justify-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {cityData[stationId] || stationId}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: ({ row }: any) => {
        const value = row.getValue(stationId) as number;
        const rowData = row.original as any;

        const visiblePrices = stationIds
          .map(id => rowData[id] as number)
          .filter(price => price > 0);
        const maxPrice = Math.max(...visiblePrices);
        const isMaxPrice = value > 0 && value === maxPrice;

        const quota = rowData[`${stationId}_quota`] as number | undefined;
        const is_rise = rowData[`${stationId}_is_rise`] as number | undefined;
        const isRiseTruthy = Boolean(is_rise);
        const colorClass = quota !== undefined ? (quota > 1 ? 'text-green-400' : 'text-red-400') : '';

        const tooltipContent = (
          <div className="flex items-center gap-2">
            {isRiseTruthy ? (
              <TrendingUp className={colorClass} sx={{ fontSize: 20 }} />
            ) : (
              <TrendingDown className={colorClass} sx={{ fontSize: 20 }} />
            )}
            <span className={`font-bold ${colorClass}`}>
              {quota !== undefined ? `${(quota * 100).toFixed(0)}%` : '-'}
            </span>
          </div>
        );

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`text-center ${isMaxPrice ? 'text-green-600 font-semibold' : ''}`}>
                {value ? value.toLocaleString() : '-'}
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>{tooltipContent}</TooltipContent>
          </Tooltip>
        );
      },
    }))
  ] as ColumnDef<any, any>[]), [stationIds, cityData, favoritesPrices, toggleFavoritePrices]);

  // filter tableData for prices favorites
  const favoriteTableData = tableData.filter(row => favoritesPrices.has(row.goodsJp));

  if (!stations) return <div>Loading...</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <Title>
        <ThemeToggle />
      </Title>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6 py-4">

        {/* Search/filters for cards tab are rendered inside the cards area */}
      </div>
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'cards' | 'favorites')}>
          <TabsList>
            <TabsTrigger value="cards">商品一覧</TabsTrigger>
            <TabsTrigger value="favorites">価格表</TabsTrigger>
          </TabsList>

          <TabsContent value="cards">
            <div>
              <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6 py-4">

                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
                <StationSelector
                  stationIds={stationIds}
                  cityData={cityData}
                  selectedStation={selectedStation}
                  onStationSelect={(stationId) => {
                    setSelectedStation(stationId);
                    if (stationId) {
                      localStorage.setItem('selectedStation', stationId);
                    } else {
                      localStorage.removeItem('selectedStation');
                    }
                  }}
                />
                <SortSelector
                  sortOrder={sortOrder}
                  onSortChange={setSortOrder}
                />
                <LastUpdateTime timeAgo={timeAgo} />
              </div>

              <Suspense fallback={<div className="col-span-full text-center py-12 text-gray-400">カード読み込み中...</div>}>
                <CardGrid
                  favoriteItems={favoriteItems}
                  cityData={cityData}
                    onToggleFavorite={toggleFavorite}
                    favorites={favorites}
                />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div>
              <div className="flex flex-col md:flex-row gap-4 md:items-center py-4">
                <PriceTableFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
                <StationDropdown
                  stationIds={stationIds}
                  cityData={cityData}
                  visibleStations={visibleStations}
                  onStationToggle={toggleStation}
                />
                <LastUpdateTime timeAgo={timeAgo} />
              </div>

              <DataTable columns={getColumns(stationIds.filter(id => visibleStations.has(id)))} data={favoriteTableData} searchQuery={searchQuery} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

