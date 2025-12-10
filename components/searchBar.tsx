import { Input } from "@/components/ui/input";
import { CircleX } from "lucide-react";

export default function SearchBar({
  searchQuery,
  onSearchChange,
}: Readonly<{
  searchQuery: string;
  onSearchChange: (value: string) => void;
}>) {
  return (
    <div className="relative flex-1 max-w-md filter-dropdown-container">
      <Input
        type="text"
        placeholder="商品を検索..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pr-8"
      />
      {searchQuery && (
        <button
          onClick={() => onSearchChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <CircleX size={18} />
        </button>
      )}
    </div>
  );
}
