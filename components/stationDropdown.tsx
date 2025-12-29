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
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

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
  const handleSelectAll = useDebouncedCallback((e: React.MouseEvent) => {
    e.preventDefault();
    stationIds.forEach(id => {
      if (!visibleStations.has(id)) {
        onStationToggle(id);
      }
    });
  }, 300);

  const handleDeselectAll = useDebouncedCallback((e: React.MouseEvent) => {
    e.preventDefault();
    stationIds.forEach(id => {
      if (visibleStations.has(id)) {
        onStationToggle(id);
      }
    });
  }, 300);

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
        <div className="flex gap-2 px-2 py-1.5">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-8"
            onClick={handleSelectAll}
          >
            全選択
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-8"
            onClick={handleDeselectAll}
          >
            全解除
          </Button>
        </div>
        <DropdownMenuSeparator />
        {stationIds.map((stationId) => (
          <DropdownMenuCheckboxItem
            key={stationId}
            checked={visibleStations.has(stationId)}
            onCheckedChange={() => onStationToggle(stationId)}
            onSelect={(e) => e.preventDefault()}
          >
            {cityData[stationId] || stationId}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
