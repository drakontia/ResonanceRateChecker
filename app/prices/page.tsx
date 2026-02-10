"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Title } from "@/components/title";
import Navbar from "@/components/navbar";
import TopNavbar from "@/components/topNavbar";
import { Footer } from "@/components/footer";
import PriceTableFilter from "@/components/priceTableFilter";
import StationDropdown from "@/components/stationDropdown";
import PricePercentToggle from "@/components/pricePercentToggle";
import LastUpdateTime from "@/components/lastUpdateTime";
import { DataTable } from "@/components/ui/data-table";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import { Toggle } from "@/components/ui/toggle";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, StarIcon } from "lucide-react";
import { StationWithItems, PriceTableRow } from "@/types/trade";
import { tradeDb } from "@/lib/tradeDb";
import { cityDb } from "@/lib/cityDb";
import { useTimeAgo } from "@/hooks/useTimeAgo";

export default function PricesPage() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorites-prices');
      return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
    }
    return new Set();
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'favorites-prices') {
        const parsed = e.newValue ? JSON.parse(e.newValue) as string[] : [];
        setFavorites(new Set(parsed));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleFavorite = (goodsJp: string) => {
    setFavorites(prev => {
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
  const [items, setItems] = useState<StationWithItems[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [goodsPriceMap, setGoodsPriceMap] = useState<Record<string, Record<string, number>>>({});
  const [goodsQuotaMap, setGoodsQuotaMap] = useState<Record<string, Record<string, number>>>({});
  const [goodsIsRiseMap, setGoodsIsRiseMap] = useState<Record<string, Record<string, number>>>({});
  const [goodsTrendMap, setGoodsTrendMap] = useState<Record<string, Record<string, number>>>({});
  const [stationIds, setStationIds] = useState<string[]>([]);
  const [visibleStations, setVisibleStations] = useState<Set<string>>(new Set());
  const [fetchTime, setFetchTime] = useState<Date | null>(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(5); // 分単位
  const [showPercent, setShowPercent] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('showPercent') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showPercent', String(showPercent));
    }
  }, [showPercent]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'showPercent') return;
      setShowPercent(e.newValue === 'true');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const fetchTradeData = async () => {
    try {
      const response = await fetch('/api/trade');
      const result = await response.json();
      setItems(result.stations);
      setFetchTime(new Date(result.fetchTime));
    } catch (error) {
      console.error('Failed to fetch trade data:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTradeData();

    // Auto refresh
    if (autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        fetchTradeData();
      }, autoRefreshInterval * 60 * 1000); // Convert minutes to milliseconds
      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval]);

  useEffect(() => {
    if (items.length === 0 || Object.keys(tradeDb).length === 0) return;

    const stations = items;
    const uniqueStationIds = Array.from(new Set(stations.map((s: any) => s.stationId)));
    setStationIds(uniqueStationIds);

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('visibleStations');
      if (saved) {
        setVisibleStations(new Set(JSON.parse(saved) as string[]));
      } else {
        setVisibleStations(new Set(uniqueStationIds));
      }
    } else {
      setVisibleStations(new Set(uniqueStationIds));
    }

    const priceMap: Record<string, Record<string, number>> = {};
    const quotaMap: Record<string, Record<string, number>> = {};
    const isRiseMap: Record<string, Record<string, number>> = {};
    const trendMap: Record<string, Record<string, number>> = {};
    for (const station of stations) {
      for (const item of station.buyItems || []) {
        const goodsJp = tradeDb[item.itemId] || item.itemId;
        if (!priceMap[goodsJp]) {
          priceMap[goodsJp] = {};
          quotaMap[goodsJp] = {};
          isRiseMap[goodsJp] = {};
          trendMap[goodsJp] = {};
        }
        if (!priceMap[goodsJp][station.stationId] || priceMap[goodsJp][station.stationId] < item.price) {
          priceMap[goodsJp][station.stationId] = item.price;
          quotaMap[goodsJp][station.stationId] = (item.quota !== undefined ? item.quota : 0);
          isRiseMap[goodsJp][station.stationId] = (item.is_rise !== undefined ? item.is_rise : 0);
          trendMap[goodsJp][station.stationId] = (item.trend !== undefined ? item.trend : 0);
        }
      }
    }
    setGoodsPriceMap(priceMap);
    setGoodsQuotaMap(quotaMap);
    setGoodsIsRiseMap(isRiseMap);
    setGoodsTrendMap(trendMap);
  }, [items, tradeDb]);

  const tableData = useMemo(() =>
    Object.keys(goodsPriceMap).map(goodsJp => ({
      goodsJp,
      ...stationIds.reduce((acc, stationId) => {
        acc[stationId] = goodsPriceMap[goodsJp][stationId] || 0;
        acc[`${stationId}_quota`] = goodsQuotaMap[goodsJp]?.[stationId] ?? 0;
        acc[`${stationId}_is_rise`] = goodsIsRiseMap[goodsJp]?.[stationId] ?? 0;
        acc[`${stationId}_trend`] = goodsTrendMap[goodsJp]?.[stationId] ?? 0;
        return acc;
      }, {} as Record<string, number>)
    } as PriceTableRow))
    , [goodsPriceMap, goodsQuotaMap, goodsIsRiseMap, goodsTrendMap, stationIds]);

  const columns = useMemo<ColumnDef<PriceTableRow>[]>(() => [
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
        const isFavorite = favorites.has(goodsJp);
        // cardMetric.tsxと同じエンコード方式
        let encodedGoodsJp = goodsJp;
        try {
          encodedGoodsJp = encodeURIComponent(decodeURIComponent(goodsJp));
        } catch {
          encodedGoodsJp = encodeURIComponent(goodsJp);
        }
        return (
          <div className="flex items-center gap-2">
            <Image
              src={`/images/items/${encodedGoodsJp}.png`}
              alt={goodsJp}
              width={32}
              height={32}
              loading="lazy"
              className="object-contain"
            />
            <div className="font-medium">{goodsJp}</div>
            <Toggle
              pressed={isFavorite}
              onPressedChange={() => toggleFavorite(goodsJp)}
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
    ...stationIds.filter(id => visibleStations.has(id)).map(stationId => ({
      accessorKey: stationId,
      header: ({ column }: any) => (
        <button
          type="button"
          className="flex items-center justify-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {cityDb[stationId] || stationId}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: ({ row }: any) => {
        const value = row.getValue(stationId) as number;
        const rowData = row.original as PriceTableRow;
        
        const quota = rowData[`${stationId}_quota`] as number | undefined;
        const trend = rowData[`${stationId}_trend`] as number | undefined;
        
        // 表示されている駅の価格と％のみを取得
        const visiblePrices = stationIds
          .filter(id => visibleStations.has(id))
          .map(id => rowData[id] as number)
          .filter(price => price > 0);
        
        const visibleQuotas = stationIds
          .filter(id => visibleStations.has(id))
          .map(id => rowData[`${id}_quota`] as number | undefined)
          .filter((q): q is number => q !== undefined && q > 0);
        
        const maxPrice = Math.max(...visiblePrices);
        const maxQuota = Math.max(...visibleQuotas);
        
        const isMaxPrice = value > 0 && value === maxPrice;
        const isMaxQuota = quota !== undefined && quota > 0 && quota === maxQuota;

        const colorClass = quota !== undefined ? (quota > 1 ? 'text-green-400' : 'text-red-400') : '';

        const displayValue = showPercent 
          ? (quota !== undefined ? `${(quota * 100).toFixed(0)}%` : '-')
          : (value ? value.toLocaleString() : '-');
        
        const tooltipContent = showPercent ? (
          <div className="flex items-center gap-2">
            {trend === 1 ? (
              <TrendingUp className={colorClass} sx={{ fontSize: 20 }} />
            ) : (
              <TrendingDown className={colorClass} sx={{ fontSize: 20 }} />
            )}
            <span className={`font-bold ${colorClass}`}>
              💰{value ? value.toLocaleString() : '-'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {trend === 1 ? (
              <TrendingUp className={colorClass} sx={{ fontSize: 20 }} />
            ) : (
              <TrendingDown className={colorClass} sx={{ fontSize: 20 }} />
            )}
            <span className={`font-bold ${colorClass}`}>
              {quota !== undefined ? `${(quota * 100).toFixed(0)}%` : '-'}
            </span>
          </div>
        );

        const isHighlighted = showPercent ? isMaxQuota : isMaxPrice;

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`text-center ${isHighlighted ? 'text-green-600 font-semibold' : ''}`}>
                {displayValue}
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>
              {tooltipContent}
            </TooltipContent>
          </Tooltip>
        );
      },
    }))
  ], [stationIds, cityDb, visibleStations, favorites, showPercent]);

  const toggleStation = (stationId: string) => {
    setVisibleStations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stationId)) {
        newSet.delete(stationId);
      } else {
        newSet.add(stationId);
      }
      localStorage.setItem('visibleStations', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  const timeAgo = useTimeAgo(fetchTime);

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <TopNavbar />
      <Title />
      <Navbar />

      <div className="flex flex-col md:flex-row gap-4 md:items-center py-4">
        <PriceTableFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <StationDropdown
          stationIds={stationIds}
          cityData={cityDb}
          visibleStations={visibleStations}
          onStationToggle={toggleStation}
        />
        <PricePercentToggle
          showPercent={showPercent}
          onToggle={setShowPercent}
        />
        <LastUpdateTime timeAgo={timeAgo} />
      </div>

      <DataTable columns={columns} data={tableData} searchQuery={searchQuery} />

      <Footer />
    </div>
  );
}
