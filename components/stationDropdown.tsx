import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export default function StationDropdown({
  stationIds,
  cityData,
  visibleStations,
  onStationToggle,
}: {
  stationIds: string[];
  cityData: Record<string, string>;
  visibleStations: Set<string>;
  onStationToggle: (stationId: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          駅を選択 <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>表示する駅</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {stationIds.map((stationId) => (
          <DropdownMenuCheckboxItem
            key={stationId}
            checked={visibleStations.has(stationId)}
            onCheckedChange={() => onStationToggle(stationId)}
          >
            {cityData[stationId] || stationId}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
