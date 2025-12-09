"use client";

import { useEffect, useState, useMemo } from "react";
import { Title } from "@/components/title";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/themeToggle";
import PriceTableFilter from "@/components/priceTableFilter";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { StationWithItems, PriceTableRow } from "@/types/trade";

export default function PricesPage() {
  const [items, setItems] = useState<StationWithItems[]>([]);
  const [tradeData, setTradeData] = useState<Record<string, string>>({});
  const [cityData, setCityData] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [goodsPriceMap, setGoodsPriceMap] = useState<Record<string, Record<string, number>>>({});
  const [stationIds, setStationIds] = useState<string[]>([]);
  const [visibleStations, setVisibleStations] = useState<Set<string>>(new Set());

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

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('visibleStations');
      if (saved) {
        setVisibleStations(new Set(JSON.parse(saved)));
      } else {
        setVisibleStations(new Set(uniqueStationIds));
      }
    } else {
      setVisibleStations(new Set(uniqueStationIds));
    }

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

  const tableData = useMemo(() =>
    Object.keys(goodsPriceMap).map(goodsJp => ({
      goodsJp,
      ...stationIds.reduce((acc, stationId) => {
        acc[stationId] = goodsPriceMap[goodsJp][stationId] || 0;
        return acc;
      }, {} as Record<string, number>)
    } as PriceTableRow))
    , [goodsPriceMap, stationIds]);

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
      cell: ({ row }: any) => <div className="font-medium">{row.getValue("goodsJp")}</div>,
    },
    ...stationIds.filter(id => visibleStations.has(id)).map(stationId => ({
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
        return <div className="text-center">{value ? value.toLocaleString() : '-'}</div>;
      },
    }))
  ], [stationIds, cityData, visibleStations]);

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



  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <Title>
        <ThemeToggle />
      </Title>
      <Navbar />

      <PriceTableFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        stationIds={stationIds}
        cityData={cityData}
        visibleStations={visibleStations}
        onStationToggle={toggleStation}
      />

      <DataTable columns={columns} data={tableData} searchQuery={searchQuery} />

      <Footer />
    </div>
  );
}
