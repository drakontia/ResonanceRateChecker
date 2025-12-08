"use client";

import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function Table({ data, columns, pageSize = 20 }: { data: any[], columns: any[], pageSize?: number }) {
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];

      if (x < y) return sortOrder === "asc" ? -1 : 1;
      if (x > y) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div>
      <table className="min-w-full border text-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="border p-2 cursor-pointer select-none"
                onClick={() => handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {sortKey === col.key && (
                    sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {paginated.map((row, i) => (
            <tr key={i} className="border-b">
              {columns.map(col => (
                <td key={col.key} className="border p-2">
                  {row[col.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          className="px-4 py-2 border rounded disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-sm text-gray-600">
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          className="px-4 py-2 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
