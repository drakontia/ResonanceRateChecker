export default function StationName({ stationName }: { stationName?: string }) {
  if (!stationName) return null;
  
  return (
    <p className="text-base mt-1 text-gray-600 dark:text-gray-400">
      {stationName}
    </p>
  );
}
