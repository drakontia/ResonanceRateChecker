import { useRef, useCallback } from 'react';

/**
 * 任意のコールバックをデバウンスして返すフック
 * @param callback 実行したい関数
 * @param delay デバウンス遅延（ミリ秒）
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay = 300
): T {
  const timer = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;
}
