"use client";

import { useEffect, useState } from "react";
import Card from "@/components/card";
import CardMetric from "@/components/cardMetric";
import { Title } from "@/components/title";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import SearchBar from "@/components/searchBar";
import { ThemeToggle } from "@/components/themeToggle";

export default function Home() {
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
  const [timeAgo, setTimeAgo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  if (!stations) return <div>Loading...</div>;

  const allItems = (stations as any[]).flatMap((station: any) =>
    station.buyItems.map((item: any) => ({
      ...item,
      stationId: station.stationId,
      goodsJp: tradeData[item.itemId] || item.itemId
    }))
  );

  const favoriteItems = allItems.filter((item: any) => {
    const key = `${item.stationId}-${item.goodsJp}`;
    const matchesSearch = item.goodsJp.toLowerCase().includes(searchQuery.toLowerCase());
    return favorites.has(key) && matchesSearch;
  });

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
      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} timeAgo={timeAgo} />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 px-4">
        {favoriteItems.map((item: any) => (
          <Card key={`${item.stationId}-${item.goodsJp}`} isFavorite={true} onToggleFavorite={() => toggleFavorite(item.stationId, item.goodsJp)}>
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

