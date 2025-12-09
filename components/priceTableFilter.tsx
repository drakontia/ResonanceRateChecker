import { Input } from "@/components/ui/input";

export default function PriceTableFilter({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <Input
        placeholder="商品を検索..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}
