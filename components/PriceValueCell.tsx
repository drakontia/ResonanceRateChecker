import { TrendingDown, TrendingUp } from "@mui/icons-material";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatTimeAgo } from "@/lib/relativeTime";

interface PriceValueCellProps {
  value: number;
  displayValue: string;
  colorClass: string;
  isHighlighted: boolean;
  trend?: number;
  quota?: number;
  showPercent: boolean;
  isMobile: boolean;
  ti?: number;
  nowUnixSeconds?: number;
}

export function PriceValueCell({
  value,
  displayValue,
  colorClass,
  isHighlighted,
  trend,
  quota,
  showPercent,
  isMobile,
  ti,
  nowUnixSeconds,
}: PriceValueCellProps) {
  const timeAgo = formatTimeAgo(ti, nowUnixSeconds);
  const tooltipContent = showPercent ? (
    <div className="flex items-center gap-2">
      {trend === 1 ? (
        <TrendingUp className={colorClass} sx={{ fontSize: 20 }} />
      ) : (
        <TrendingDown className={colorClass} sx={{ fontSize: 20 }} />
      )}
      <span className={`font-bold ${colorClass}`}>
        {`💰${value ? value.toLocaleString() : "-"}`}
      </span>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      {trend === 1 ? (
        <TrendingUp className={colorClass} sx={{ fontSize: 20 }} />
      ) : (
        <TrendingDown className={colorClass} sx={{ fontSize: 20 }} />
      )}
      <span className={`font-bold ${colorClass}`}>
        {quota !== undefined ? `${(quota * 100).toFixed(0)}%` : "-"}
      </span>
    </div>
  );

  const TrendIcon = trend === 1 ? ArrowUp : ArrowDown;

  if (isMobile) {
    return (
      <div className={`flex items-center justify-center gap-1 ${isHighlighted ? "text-green-600 font-semibold" : ""}`}>
        {value > 0 && <TrendIcon className={`h-4 w-4 ${colorClass}`} />}
        <div className="flex flex-col items-center">
          <span>{displayValue}</span>
          {timeAgo && <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>}
        </div>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center justify-center gap-1 ${isHighlighted ? "text-green-600 font-semibold" : ""}`}>
          {value > 0 && <TrendIcon className={`h-4 w-4 ${colorClass}`} />}
          <div className="flex flex-col items-center">
            <span>{displayValue}</span>
            {timeAgo && <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>{tooltipContent}</TooltipContent>
    </Tooltip>
  );
}