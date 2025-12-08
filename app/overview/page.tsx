"use client";

import { useEffect, useState } from "react";

import Card from "@/components/card";
import CardMetric from "@/components/cardMetric";
import { Title } from "@/components/title";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import SearchBar from "@/components/searchBar";
import { ThemeToggle } from "@/components/themeToggle";

export default function OverviewPage() {
  const [stations, setStations] = useState<any>(null);
  const [tradeData, setTradeData] = useState<Record<string, string>>({});
  const [cityData, setCityData] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [fetchTime, setFetchTime] = useState<Date | null>(null);
  const [timeAgo, setTimeAgo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  const groupedItems = (stations as any[]).flatMap((station: any) => 
    station.buyItems.map((item: any) => ({
      ...item,
      stationId: station.stationId
    }))
  ).reduce((acc: any, item: any) => {
    const goodsJp = tradeData[item.itemId] || item.itemId;
    if (!acc[goodsJp]) {
      acc[goodsJp] = [];
    }
    acc[goodsJp].push({ ...item, goodsJp });
    return acc;
  }, {});

  const maxPriceItems = Object.entries(groupedItems).reduce((acc: any, [goodsJp, items]: [string, any]) => {
    const maxItem = items.reduce((max: any, item: any) => item.price > max.price ? item : max);
    acc[goodsJp] = maxItem;
    return acc;
  }, {});

  const filteredItems = Object.values(maxPriceItems).filter((item: any) => {
    return item.goodsJp.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedItems = filteredItems.toSorted((a: any, b: any) => {
    const aFav = favorites.has(a.goodsJp);
    const bFav = favorites.has(b.goodsJp);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  const toggleFavorite = (goodsJp: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(goodsJp)) {
        newFavorites.delete(goodsJp);
      } else {
        newFavorites.add(goodsJp);
      }
      return newFavorites;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="space-y-12">
      <div className="relative">
        <Title />
        <ThemeToggle />
      </div>
      <Navbar />
      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} timeAgo={timeAgo} />

      {/* Buy Items Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 px-4">
        {sortedItems.map((item: any) => (
          <Card key={item.goodsJp} isFavorite={favorites.has(item.goodsJp)} onToggleFavorite={() => toggleFavorite(item.goodsJp)}>
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
    </div>
  );
}
