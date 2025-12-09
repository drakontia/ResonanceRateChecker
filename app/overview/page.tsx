"use client";

import { useEffect, useState } from "react";

import Card from "@/components/card";
import CardMetric from "@/components/cardMetric";
import { Title } from "@/components/title";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import SearchBar from "@/components/searchBar";
import StationSelector from "@/components/stationSelector";
import SortSelector from "@/components/sortSelector";
import LastUpdateTime from "@/components/lastUpdateTime";
import { ThemeToggle } from "@/components/themeToggle";
import { useFilteredAndSortedItems } from "@/hooks/useFilteredAndSortedItems";
import { useTimeAgo } from "@/hooks/useTimeAgo";


export default function OverviewPage() {
  const [stations, setStations] = useState<any>(null);
  const [tradeData, setTradeData] = useState<Record<string, string>>({});
  const [cityData, setCityData] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
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

  useEffect(() => {
    fetch('/api/trade')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.text();
      })
      .then(text => {
        if (!text) throw new Error('Empty response');
        return JSON.parse(text);
      })
      .then(result => {
        console.log('API Response:', result);
        console.log('First station buyItems:', result.stations[0]?.buyItems);
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

  const timeAgo = useTimeAgo(fetchTime);

  const stationIds = stations ? Array.from(new Set((stations as any[]).map((s: any) => s.stationId))) : [];

  const itemsByGoods: Record<string, any> = {};

  if (stations) {
    (stations as any[]).forEach((station: any) => {
      if (selectedStation && station.stationId !== selectedStation) return;

      station.buyItems.forEach((item: any) => {
        const goodsJp = tradeData[item.itemId];
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

  const sortedItems = useFilteredAndSortedItems(allItems, searchQuery, sortOrder, favorites);

  if (!stations || Object.keys(tradeData).length === 0) return <div>Loading...</div>;

  const toggleFavorite = (stationId: string, goodsJp: string) => {
    const key = `${stationId}-${goodsJp}`;
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(key)) {
        newFavorites.delete(key);
      } else {
        newFavorites.add(key);
      }
      localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <Title>
        <ThemeToggle />
      </Title>
      <Navbar />
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

      {/* Buy Items Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 px-4">
        {sortedItems.map((item: any) => (
          <Card key={`${item.stationId}-${item.goodsJp}`} isFavorite={favorites.has(`${item.stationId}-${item.goodsJp}`)} onToggleFavorite={() => toggleFavorite(item.stationId, item.goodsJp)}>
            <CardMetric
              name={item.goodsJp}
              price={item.price}
              is_rise={item.is_rise}
              quota={item.quota}
              trend={item.trend}
              imageUrl={`/images/items/${item.goodsJp}.png`}
              stationName={cityData[item.stationId] || item.stationId}
              is_rare={item.is_rare}
            />
          </Card>
        ))}
      </div>

      <Footer />
    </div>
  );
}
