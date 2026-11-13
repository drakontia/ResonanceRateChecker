import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { vi } from 'vitest';

import PricesPage from '@/app/prices/page';

const setTheme = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: () => ({ setTheme, theme: 'light' }),
}));

vi.mock('@/lib/cityDb', () => ({
  cityDb: {
    '83000001': 'シュグリシティ',
  },
}));

vi.mock('@/lib/tradeDb', () => ({
  tradeDb: {
    item1: 'ビール',
  },
}));

const mockStations = [
  {
    stationId: '83000001',
    buyItems: [
      { itemId: 'item1', price: 1000, is_rise: 1, quota: 1.2, trend: 1, is_rare: 1, ti: Math.floor(Date.now() / 1000) - 30 * 60 },
    ],
  },
  {
    stationId: '83000046',
    buyItems: [
      { itemId: 'item1', price: 500, is_rise: 0, quota: 0.9, trend: -1, is_rare: 0 },
    ],
  },
];

const mockFetch = vi.fn();

global.fetch = mockFetch as unknown as typeof fetch;

const setupMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

beforeEach(() => {
  setupMatchMedia();
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ stations: mockStations, fetchTime: new Date().toISOString() }),
  });

  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    if (key === 'favorites-prices') {
      return JSON.stringify([]);
    }
    if (key === 'showPercent') {
      return 'false';
    }
    if (key === 'visibleStations') {
      return JSON.stringify(['83000001', '83000046']);
    }
    return null;
  });

  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PricesPage', () => {
  it('renders price data and toggles favorites', async () => {
    render(<PricesPage />);

    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());
    expect(await screen.findByText(/\d+分前/)).toBeInTheDocument();

    const favoriteToggle = screen.getByRole('button', { name: /toggle favorite/i });
    fireEvent.click(favoriteToggle);

    expect(Storage.prototype.setItem).toHaveBeenCalledWith(
      'favorites-prices',
      expect.any(String)
    );
  });

  it('updates the search input immediately and filters the table after typing pauses', async () => {
    render(<PricesPage />);
    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText('商品を検索...');
    fireEvent.change(searchInput, { target: { value: '存在しない商品' } });

    expect(searchInput).toHaveValue('存在しない商品');
    expect(screen.getByText('ビール')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('ビール')).not.toBeInTheDocument();
    });
  });

  it('switches to percent display', async () => {
    render(<PricesPage />);

    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());
    expect(screen.getByText('1,000')).toBeInTheDocument();

    const toggle = screen.getByRole('switch', { name: '価格/％表示切替' });
    fireEvent.click(toggle);

    expect(screen.getByText('120%')).toBeInTheDocument();
  });

  it('labels Jiaozhi prices in the Wulin station header', async () => {
    render(<PricesPage />);

    await waitFor(() => expect(screen.getByText('武林源（交子）')).toBeInTheDocument());
  });

  it.each([
    ['84707496', '有楽町記念バッジ'],
    ['84707507', '黒月有楽町・テーマアクセサリー'],
  ])('renders an available image for %s', async (itemId, name) => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        stations: [{ stationId: '83000046', buyItems: [{ itemId, price: 500 }] }],
        fetchTime: new Date().toISOString(),
      }),
    });

    render(<PricesPage />);

    const image = await screen.findByRole('img', { name });
    const url = new URL(image.getAttribute('src') ?? '', 'http://localhost');
    const imagePath = decodeURIComponent(url.searchParams.get('url') ?? '');
    expect(imagePath).toBe(`/images/items/${name}.png`);
    expect(existsSync(join(process.cwd(), 'public', 'images', 'items', `${name}.png`))).toBe(true);
  });
});
