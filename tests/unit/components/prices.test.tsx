import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
      { itemId: 'item1', price: 1000, is_rise: 1, quota: 1.2, trend: 1, is_rare: 1 },
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
      return JSON.stringify(['83000001']);
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

    const favoriteToggle = screen.getByRole('button', { name: /toggle favorite/i });
    fireEvent.click(favoriteToggle);

    expect(Storage.prototype.setItem).toHaveBeenCalledWith(
      'favorites-prices',
      expect.any(String)
    );
  });

  it('switches to percent display', async () => {
    render(<PricesPage />);

    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());
    expect(screen.getByText('1,000')).toBeInTheDocument();

    const toggle = screen.getByRole('switch', { name: '価格/％表示切替' });
    fireEvent.click(toggle);

    expect(screen.getByText('120%')).toBeInTheDocument();
  });
});
