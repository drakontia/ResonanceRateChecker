import { TrendingUp, TrendingDown } from "@mui/icons-material";

export default function QuotaDisplay({ 
  is_rise, 
  quota 
}: { 
  is_rise?: number; 
  quota?: number; 
}) {
  if (quota === undefined) return null;

  return (
    <div className="flex items-center gap-2">
      {is_rise ?
        <TrendingUp className="text-green-400" sx={{ fontSize: 28 }} /> :
        <TrendingDown className="text-red-400" sx={{ fontSize: 28 }} />
      }
      <p className={`text-2xl font-bold ${quota > 1 ? "text-green-400" : "text-red-400"}`}>
        {(quota * 100).toFixed(0)}%
      </p>
    </div>
  );
}
