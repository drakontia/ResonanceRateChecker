import { useEffect, useState } from "react";

export function useTimeAgo(fetchTime: Date | null) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    if (!fetchTime) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - fetchTime.getTime()) / 1000 / 60);
      setTimeAgo(diff === 0 ? "ただ今" : `${diff}分前`);
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000);
    return () => clearInterval(interval);
  }, [fetchTime]);

  return timeAgo;
}
