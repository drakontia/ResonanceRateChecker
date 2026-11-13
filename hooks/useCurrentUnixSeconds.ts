import { useEffect, useState } from "react";

export function useCurrentUnixSeconds() {
  const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setNowSeconds(Math.floor(Date.now() / 1000));
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return nowSeconds;
}
