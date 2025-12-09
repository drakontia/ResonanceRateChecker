export default function LastUpdateTime({
  timeAgo,
}: Readonly<{
  timeAgo: string;
}>) {
  return (
    <div className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
      最終更新: {timeAgo}
    </div>
  );
}
