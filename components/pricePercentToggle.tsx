"use client";

import { Toggle } from "@/components/ui/toggle";

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
      <Toggle
        pressed={showPercent}
        onPressedChange={onToggle}
        aria-label="価格/％表示切替"
        variant="outline"
        size="sm"
        className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 dark:data-[state=on]:bg-blue-900 dark:data-[state=on]:text-blue-300"
      >
        {showPercent ? "％" : "💰 価格"}
      </Toggle>
    </div>
  );
}
