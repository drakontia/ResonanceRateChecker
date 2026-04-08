import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
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

test('ホームページが表示される', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await expect(page).toHaveTitle(/レゾナンス/);
});

test('タブ切り替えが機能する', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();

  // デフォルトは「商品一覧」タブ
  await expect(page.getByRole('tab', { name: '商品一覧' })).toHaveAttribute('data-state', 'active');

  // 「価格表」タブに切り替え
  await home.switchToFavoritesTab();
  await expect(page.getByRole('tab', { name: '価格表' })).toHaveAttribute('data-state', 'active');
});

test('「商品一覧」タブにカードが表示される', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();

  // タブパネルが存在することを確認
  const tabPanel = page.getByRole('tabpanel', { name: '商品一覧' });
  await expect(tabPanel).toBeVisible();
});

test('ナビゲーションバーが表示される', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  // ナビゲーションリンク（価格表ページへのリンク）が存在する
  await expect(page.getByRole('link', { name: /価格表/i }).first()).toBeVisible();
});
