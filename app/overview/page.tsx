"use client";

import { useEffect, useState, Suspense } from "react";

import { CardGrid } from "@/components/cardGrid";
import { Title } from "@/components/title";
import Navbar from "@/components/navbar";
import TopNavbar from "@/components/topNavbar";
import { Footer } from "@/components/footer";
import SearchBar from "@/components/searchBar";
import StationSelector from "@/components/stationSelector";
import SortSelector from "@/components/sortSelector";
import LastUpdateTime from "@/components/lastUpdateTime";
import { useFilteredAndSortedItems } from "@/hooks/useFilteredAndSortedItems";
import { useTimeAgo } from "@/hooks/useTimeAgo";

import { cityDb } from "@/lib/cityDb";
import { tradeDb } from "@/lib/tradeDb";


export default function OverviewPage() {
  const [stations, setStations] = useState<any>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorites-overview');
      let parsed: unknown = [];
      try {
        parsed = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(parsed)) parsed = [];
      } catch {
        parsed = [];
      }
      return new Set(parsed as string[]);
    }
    return new Set();
  });
  const [fetchTime, setFetchTime] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStation, setSelectedStation] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedStation');
    }
    return null;
  });
  const [sortOrder, setSortOrder] = useState<string>('default');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(5); // 分単位

  const fetchTradeData = async () => {
    try {
      const response = await fetch('/api/trade');
      const result = await response.json();
      setStations(result.stations);
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

  const timeAgo = useTimeAgo(fetchTime);

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

  const stationIds = stations ? Array.from(new Set((stations as any[]).map((s: any) => s.stationId))) : [];

  const itemsByGoods: Record<string, any> = {};

  if (stations) {
    (stations as any[]).forEach((station: any) => {
      if (selectedStation && station.stationId !== selectedStation) return;

      station.buyItems.forEach((item: any) => {
        const goodsJp = tradeDb[item.itemId];
        if (!goodsJp) return;

        if (!itemsByGoods[goodsJp] || itemsByGoods[goodsJp].price < item.price) {
          itemsByGoods[goodsJp] = {
            ...item,
            stationId: station.stationId,
            goodsJp
          };
        }
      });
    });
  }

  const allItems = Object.values(itemsByGoods);

  const sortedItems = useFilteredAndSortedItems(allItems, searchQuery, sortOrder);

  if (!stations || Object.keys(tradeDb).length === 0) return <div>Loading...</div>;

  const toggleFavorite = (stationId: string, goodsJp: string) => {
    const key = `${stationId}-${goodsJp}`;
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(key)) {
        newFavorites.delete(key);
      } else {
        newFavorites.add(key);
      }
      localStorage.setItem('favorites-overview', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <TopNavbar />
      <Title />
      <Navbar />
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6 py-4">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <StationSelector
          stationIds={stationIds}
          cityData={cityDb}
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

      {/* Buy Items Cards */}
      <Suspense fallback={<div className="col-span-full text-center py-12 text-gray-400">カード読み込み中...</div>}>
        <CardGrid
          favoriteItems={sortedItems}
          cityData={cityDb}
          onToggleFavorite={toggleFavorite}
          favorites={favorites}
        />
      </Suspense>

      <Footer />
    </div>
  );
}
