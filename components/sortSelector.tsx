import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

const SORT_LABELS: Record<string, string> = {
  'price-high': '価格：高い順',
  'price-high-grouped': '価格：高い順（商品まとめ）',
  'price-low': '価格：低い順',
};

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
          {SORT_LABELS[sortOrder] ?? '並び順'}
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
        <DropdownMenuItem onClick={() => debouncedSortChange('price-high-grouped')}>
          価格：高い順（商品まとめ）
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => debouncedSortChange('price-low')}>
          価格：低い順
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
