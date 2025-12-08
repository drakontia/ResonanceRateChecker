"use client";

import { useEffect, useState } from "react";
import { Title } from "@/components/title";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/themeToggle";

export default function PricesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [tradeData, setTradeData] = useState<Record<string, string>>({});
  const [cityData, setCityData] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [goodsPriceMap, setGoodsPriceMap] = useState<Record<string, Record<string, number>>>({});
  const [stationIds, setStationIds] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/trade')
      .then(res => res.json())
      .then(result => {
        setItems(result.stations);
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
    if (items.length === 0 || Object.keys(tradeData).length === 0) return;

    const stations = items;
    const uniqueStationIds = Array.from(new Set(stations.map((s: any) => s.stationId)));
    setStationIds(uniqueStationIds);
    
    const priceMap: Record<string, Record<string, number>> = {};
    for (const station of stations) {
      for (const item of station.buyItems || []) {
        const goodsJp = tradeData[item.itemId] || item.itemId;
        if (!priceMap[goodsJp]) {
          priceMap[goodsJp] = {};
        }
        if (!priceMap[goodsJp][station.stationId] || priceMap[goodsJp][station.stationId] < item.price) {
          priceMap[goodsJp][station.stationId] = item.price;
        }
      }
    }
    setGoodsPriceMap(priceMap);
  }, [items, tradeData]);

  const uniqueGoods = Object.keys(goodsPriceMap);
  const filteredGoods = uniqueGoods.filter(goodsJp => {
    return goodsJp.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="space-y-12">
        <div className="relative">
          <Title />
          <ThemeToggle />
        </div>
        <Navbar />
        
        <div className="px-4">
          <input
            type="text"
            placeholder="Search items or stations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white text-black"
          />
        </div>

        <div className="px-4 overflow-x-auto">
          <table className="border-collapse border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 sticky left-0 bg-gray-100 dark:bg-gray-700 min-w-[150px]">Item</th>
                {stationIds.map((stationId: string) => (
                  <th key={stationId} className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 w-24 break-words">
                    {cityData[stationId] || stationId}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredGoods.map((goodsJp, index) => (
                <tr key={goodsJp} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                  <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-900 dark:text-gray-100 sticky left-0 bg-inherit">
                    {goodsJp}
                  </td>
                  {stationIds.map((stationId: string) => (
                    <td key={stationId} className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-center text-gray-900 dark:text-gray-100">
                      {goodsPriceMap[goodsJp][stationId] ? goodsPriceMap[goodsJp][stationId].toLocaleString() : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Footer />
      </div>
    </div>
  );
}
