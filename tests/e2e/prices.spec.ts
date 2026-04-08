import { test, expect } from '@playwright/test';
import { PricesPage } from './pages/PricesPage';
import { mockTradeResponse } from './fixtures/tradeData';

test.beforeEach(async ({ page }) => {
  await page.route('/api/trade', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockTradeResponse),
    })
  );
});

test('価格表ページが表示される', async ({ page }) => {
  const prices = new PricesPage(page);
  await prices.goto();
  await expect(page.locator('table')).toBeVisible();
});

test('価格セルにトレンドアイコン（↑/↓）が表示される', async ({ page }) => {
  const prices = new PricesPage(page);
  await prices.goto();
  await prices.waitForTableRows();

  // テーブル内のアイコン（SVG）が存在することを確認
  const trendIcons = prices.getTrendIcons();
  await expect(trendIcons.first()).toBeVisible({ timeout: 10000 });
  expect(await trendIcons.count()).toBeGreaterThan(0);
});

test('デスクトップ: トレンドアイコンが価格セル内に存在する', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width < 768, 'デスクトップのみ');

  const prices = new PricesPage(page);
  await prices.goto();
  await prices.waitForTableRows();

  // 最初の価格セル（2列目）にアイコンが含まれる
  const firstPriceCell = page.locator('tbody tr:first-child td:nth-child(2)');
  await expect(firstPriceCell.locator('svg')).toBeVisible();
});

test('モバイル: トレンドアイコンが価格セル内に存在する', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width >= 768, 'モバイルのみ');

  const prices = new PricesPage(page);
  await prices.goto();
  await prices.waitForTableRows();

  const firstPriceCell = page.locator('tbody tr:first-child td:nth-child(2)');
  await expect(firstPriceCell.locator('svg')).toBeVisible();
});

test('デスクトップ: 価格セルにホバーするとツールチップが表示される', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width < 768, 'デスクトップのみ');

  const prices = new PricesPage(page);
  await prices.goto();
  await prices.waitForTableRows();

  const firstPriceCell = page.locator('tbody tr:first-child td:nth-child(2)');
  await firstPriceCell.hover();

  // ツールチップが表示される（role="tooltip" または data-radix-popper-content-wrapper）
  await expect(page.locator('[role="tooltip"]')).toBeVisible({ timeout: 5000 });
});

test('%表示トグルで表示が切り替わる', async ({ page }) => {
  const prices = new PricesPage(page);
  await prices.goto();
  await prices.waitForTableRows();

  // % トグルを有効化
  const toggle = prices.getPercentToggle();
  await toggle.click();

  // セルの表示が % 形式に変わる（例: "120%"）
  const cells = page.locator('tbody tr td:not(:first-child)');
  const firstCellText = await cells.first().innerText();
  expect(firstCellText).toMatch(/%|－/);
});

test('お気に入り商品の星アイコンをクリックするとlocalStorageに保存される', async ({ page }) => {
  const prices = new PricesPage(page);
  await prices.goto();
  await prices.waitForTableRows();

  // 最初の商品の星アイコンをクリック
  const starButton = page.locator('tbody tr:first-child [aria-label="toggle favorite"]');
  await starButton.click();

  // localStorage に保存されていることを確認
  const saved = await page.evaluate(() => localStorage.getItem('favorites-prices'));
  expect(saved).not.toBeNull();
  const favorites = JSON.parse(saved!);
  expect(favorites.length).toBeGreaterThan(0);
});
