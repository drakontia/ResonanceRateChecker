import { Input } from "@/components/ui/input";

export default function SearchBar({
  searchQuery,
  onSearchChange,
  timeAgo,
}: Readonly<{
  searchQuery: string;
  onSearchChange: (value: string) => void;
  timeAgo?: string;
}>) {
  return (
    <div className="flex gap-4 items-center justify-between mb-6 py-4">
      <div className="relative flex-1 max-w-md filter-dropdown-container">
        <Input
          type="text"
          placeholder="商品を検索..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={(e) => e.target.style.borderColor = '#a855f7'}
          onBlur={(e) => e.target.style.borderColor = '#9ca3af'}
        />
      </div>
      {timeAgo && (
        <div className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
          最終更新: {timeAgo}
        </div>
      )}
    </div>
  );
}
