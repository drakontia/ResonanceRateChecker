import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

export default function StationSelector({
  stationIds,
  cityData,
  selectedStation,
  onStationSelect,
}: Readonly<{
  stationIds: string[];
  cityData: Record<string, string>;
  selectedStation: string | null;
  onStationSelect: (stationId: string | null) => void;
}>) {
  const debouncedSelect = useDebouncedCallback(onStationSelect, 300);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {selectedStation ? (cityData[selectedStation] || selectedStation) : "駅を選択"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => debouncedSelect(null)}>
          すべて
        </DropdownMenuItem>
        {stationIds.map((stationId) => (
          <DropdownMenuItem key={stationId} onClick={() => debouncedSelect(stationId)}>
            {cityData[stationId] || stationId}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
