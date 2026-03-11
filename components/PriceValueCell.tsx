import { TrendingDown, TrendingUp } from "@mui/icons-material";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PriceValueCellProps {
  value: number;
  displayValue: string;
  colorClass: string;
  isHighlighted: boolean;
  trend?: number;
  quota?: number;
  showPercent: boolean;
  isMobile: boolean;
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
}: PriceValueCellProps) {
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
        <span>{displayValue}</span>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`text-center ${isHighlighted ? "text-green-600 font-semibold" : ""}`}>
          {displayValue}
        </div>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>{tooltipContent}</TooltipContent>
    </Tooltip>
  );
}