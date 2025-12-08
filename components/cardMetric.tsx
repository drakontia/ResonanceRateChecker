import Image from "next/image";
import { useState } from "react";
import PriceDisplay from "./priceDisplay";
import StationName from "./stationName";
import QuotaDisplay from "./quotaDisplay";
import ItemName from "./itemName";

export default function CardMetric({
  name,
  price,
  is_rise,
  quota,
  trend,
  imageUrl,
  stationName,
  is_rare,
}: Readonly<{
  name: string;
  price: string | number;
  is_rise?: number;
  quota?: number;
  trend?: number;
  imageUrl: string;
  stationName?: string;
  is_rare?: number;
}>) {
  const [imageError, setImageError] = useState(false);
  const encodedImageUrl = imageUrl.split('/').map((part, index) => {
    if (index === imageUrl.split('/').length - 1) {
      try {
        return encodeURIComponent(decodeURIComponent(part));
      } catch {
        return encodeURIComponent(part);
      }
    }
    return part;
  }).join('/');

  return (
    <div className="flex gap-4 h-full">
      {/* 左半分: 画像 */}
      <div className="flex-1 flex items-center justify-center relative">
        {!imageError ? (
          <>
            <Image
              src={encodedImageUrl}
              alt={name}
              width={100}
              height={100}
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
            {is_rare === 1 && (
              <Image src="/images/item_rare.png" alt="rare" width={100} height={100} className="absolute inset-0 w-full h-full object-contain" onError={() => {}} />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">No Image</span>
          </div>
        )}
      </div>

      {/* 右半分: 情報 */}
      <div className="flex-1 flex flex-col justify-center space-y-2">
        <ItemName name={name} trend={trend} />
        <QuotaDisplay is_rise={is_rise} quota={quota} />

        <PriceDisplay price={price} />
        <StationName stationName={stationName} />
      </div>
    </div>
  );
}
