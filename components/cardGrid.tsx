"use client";

import Card from "@/components/card";
import CardMetric from "@/components/cardMetric";

interface CardGridProps {
  favoriteItems: any[];
  cityData: Record<string, string>;
  onToggleFavorite: (stationId: string, goodsJp: string) => void;
  favorites?: Set<string>;
}

export function CardGrid({ favoriteItems, cityData, onToggleFavorite, favorites }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {favoriteItems.length === 0 ? (
        <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
          商品一覧ページでお気に入りを選択すると表示されます
        </div>
      ) : (
        favoriteItems.map((item: any) => (
            <Card
              key={`${item.stationId}-${item.goodsJp}`}
              isFavorite={Boolean(favorites && favorites.has(`${item.stationId}-${item.goodsJp}`))}
              onToggleFavorite={() => onToggleFavorite(item.stationId, item.goodsJp)}
            >
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
        ))
      )}
    </div>
  );
}
