import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {selectedStation ? (cityData[selectedStation] || selectedStation) : "駅を選択"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onStationSelect(null)}>
          すべて
        </DropdownMenuItem>
        {stationIds.map((stationId) => (
          <DropdownMenuItem key={stationId} onClick={() => onStationSelect(stationId)}>
            {cityData[stationId] || stationId}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
