"use client";

import { Switch } from "@/components/ui/switch";

interface PricePercentToggleProps {
  showPercent: boolean;
  onToggle: (showPercent: boolean) => void;
}

export default function PricePercentToggle({
  showPercent,
  onToggle,
}: PricePercentToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        表示:
      </span>
      <span className="text-sm text-gray-700 dark:text-gray-300">価格</span>
      <Switch
        checked={showPercent}
        onCheckedChange={onToggle}
        aria-label="価格/％表示切替"
        className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">％</span>
    </div>
  );
}
