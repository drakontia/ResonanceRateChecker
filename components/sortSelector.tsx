import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

export default function SortSelector({
  sortOrder,
  onSortChange,
}: Readonly<{
  sortOrder: string;
  onSortChange: (order: string) => void;
}>) {
  const debouncedSortChange = useDebouncedCallback(onSortChange, 300);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {sortOrder === 'price-high' ? '価格：高い順' : sortOrder === 'price-low' ? '価格：低い順' : '並び順'}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => debouncedSortChange('default')}>
          デフォルト
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => debouncedSortChange('price-high')}>
          価格：高い順
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => debouncedSortChange('price-low')}>
          価格：低い順
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
