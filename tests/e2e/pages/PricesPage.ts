import { Page } from '@playwright/test';

export class PricesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/prices');
    await this.page.waitForSelector('table', { timeout: 15000 });
  }

  async waitForTableRows() {
    await this.page.waitForSelector('tbody tr', { timeout: 15000 });
  }

  getPriceCells() {
    // All data cells in the price table (excluding first column = item name)
    return this.page.locator('tbody tr td:not(:first-child)');
  }

  getTrendIcons() {
    // ArrowUp / ArrowDown from lucide-react are rendered as <svg>
    return this.page.locator('tbody tr td svg');
  }

  getPercentToggle() {
    return this.page.getByRole('switch');
  }
}
