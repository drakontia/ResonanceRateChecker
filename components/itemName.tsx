import TrendIndicator from "./trendIndicator";

export default function ItemName({ name, trend }: { name: string; trend?: number }) {
  return (
    <div className="flex items-center gap-2">
      <TrendIndicator trend={trend} />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {name}
      </p>
    </div>
  );
}
