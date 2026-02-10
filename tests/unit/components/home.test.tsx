import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import Home from '@/app/page';

const setTheme = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: () => ({ setTheme, theme: 'light' }),
}));

vi.mock('@/lib/cityDb', () => ({
  cityDb: {
    '83000001': 'シュグリシティ',
    '83000002': 'ケープシティ',
  },
}));

vi.mock('@/lib/tradeDb', () => ({
  tradeDb: {
    item1: 'ビール',
    item2: 'ワイン',
  },
}));

const mockStations = [
  {
    stationId: '83000001',
    buyItems: [
      { itemId: 'item1', price: 1000, is_rise: 1, quota: 1.2, trend: 1, is_rare: 1 },
      { itemId: 'item2', price: 2000, is_rise: 0, quota: 0.8, trend: 0, is_rare: 0 },
    ],
  },
  {
    stationId: '83000002',
    buyItems: [
      { itemId: 'item1', price: 1100, is_rise: 0, quota: 1.1, trend: 0, is_rare: 0 },
    ],
  },
];

const mockFetch = vi.fn();

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

global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  setupMatchMedia();
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ stations: mockStations, fetchTime: new Date().toISOString() }),
  });

  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    if (key === 'favorites-overview') {
      return JSON.stringify(['83000001-ビール']);
    }
    if (key === 'favorites-prices') {
      return JSON.stringify(['ビール']);
    }
    if (key === 'sortOrder') {
      return 'default';
    }
    if (key === 'showPercent') {
      return 'false';
    }
    if (key === 'visibleStations') {
      return JSON.stringify(['83000001', '83000002']);
    }
    return null;
  });

  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Home', () => {
  it('renders favorite card and toggles favorite state', async () => {
    render(<Home />);

    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());
    expect(screen.getByText('シュグリシティ')).toBeInTheDocument();

    const starButton = screen.getByRole('button', { name: /toggle star/i });
    fireEvent.click(starButton);

    expect(Storage.prototype.setItem).toHaveBeenCalledWith(
      'favorites-overview',
      expect.any(String)
    );
  });

  it('switches to price table tab and shows percent values', async () => {
    render(<Home />);

    await waitFor(() => expect(screen.getByText('商品一覧')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('tab', { name: '価格表' }));

    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());
    expect(screen.getByText('1,100')).toBeInTheDocument();

    const toggle = screen.getByRole('switch', { name: '価格/％表示切替' });
    fireEvent.click(toggle);

    expect(screen.getByText('120%')).toBeInTheDocument();
  });

  it('filters cards by search query', async () => {
    render(<Home />);

    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText('商品を検索...');
    fireEvent.change(searchInput, { target: { value: 'ワイン' } });

    await waitFor(() => {
      expect(
        screen.getByText('商品一覧ページでお気に入りを選択すると表示されます')
      ).toBeInTheDocument();
    });
  });
});
