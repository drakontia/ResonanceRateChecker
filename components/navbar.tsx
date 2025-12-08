import Link from "next/link";
import { LayoutDashboard, Tag } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="mb-6 border-b border-gray-700">
      <div className="flex justify-left items-center text-2xl">
        <Link href="/overview" className="flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors border-blue-500 text-blue-400 dark:text-white dark:hover:text-gray-200">
          <LayoutDashboard size={18} /> Overview
        </Link>

        <Link href="/prices" className="flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors border-transparent text-gray-400 hover:text-gray-200 dark:text-white dark:hover:text-gray-200">
          <Tag size={18} /> Prices
        </Link>
      </div>
    </nav>
  );
}
