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
    <div className="mb-4 dark:bg-gray-800 bg-gray-300 rounded-lg shadow p-4">
      <div className="flex gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md filter-dropdown-container">
          <input
            type="text"
            placeholder="商品を検索..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ border: '2px solid #9ca3af', outline: 'none' }}
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
    </div>
  );
}
