export function formatTimeAgo(
  timestampSeconds: number | undefined,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): string | null {
  if (
    !Number.isFinite(timestampSeconds) ||
    timestampSeconds === undefined ||
    timestampSeconds < 0 ||
    !Number.isFinite(nowSeconds) ||
    timestampSeconds > nowSeconds
  ) {
    return null;
  }

  const minutesAgo = Math.floor((nowSeconds - timestampSeconds) / 60);
  return minutesAgo === 0 ? "ただ今" : `${minutesAgo}分前`;
}
