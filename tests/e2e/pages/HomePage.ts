import { Page } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async switchToFavoritesTab() {
    await this.page.getByRole('tab', { name: '価格表' }).click();
  }

  async switchToCardsTab() {
    await this.page.getByRole('tab', { name: '商品一覧' }).click();
  }

  getCardsTabContent() {
    return this.page.locator('[data-state="active"]').filter({ hasText: '' });
  }
}
