export default function TrendIndicator({ trend }: { trend?: number }) {
  if (trend !== 1) return null;
  
  return <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>;
}
