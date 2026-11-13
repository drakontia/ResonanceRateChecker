import { render, screen, waitFor, fireEvent, act, within } from '@testing-library/react';
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
      { itemId: 'item1', price: 1000, is_rise: 1, quota: 1.2, trend: 1, is_rare: 1, ti: Math.floor(Date.now() / 1000) - 30 * 60 },
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
  it('fetches trade data without using the browser HTTP cache', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/trade', { cache: 'no-store' });
    });
  });

  it('opens the usage guide from the help button', async () => {
    render(<Home />);

    const helpButton = await screen.findByRole('button', { name: '使い方を開く' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(helpButton);

    const dialog = await screen.findByRole('dialog', { name: '使い方' });
    expect(within(dialog).getByText(/商品名を検索し/)).toBeInTheDocument();
    expect(within(dialog).getByText(/星アイコンを押すと/)).toBeInTheDocument();
    expect(within(dialog).getByText(/「価格表」タブ/)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('tab', { name: '価格表' }));
    expect(screen.getByRole('button', { name: '使い方を開く' })).toBeInTheDocument();
  });

  it('restores the saved price table sorting after switching to the price table tab', async () => {
    const getItemMock = vi.spyOn(Storage.prototype, 'getItem');
    getItemMock.mockImplementation((key: string) => {
      if (key === 'favorites-overview') return JSON.stringify([]);
      if (key === 'favorites-prices') return JSON.stringify(['ビール', 'ワイン']);
      if (key === 'visibleStations') return JSON.stringify(['83000001', '83000002']);
      if (key === 'home-price-table-sorting') {
        return JSON.stringify([{ id: '83000001', desc: true }]);
      }
      return null;
    });

    render(<Home />);

    await waitFor(() => expect(screen.getByRole('tab', { name: '価格表' })).toBeInTheDocument());
    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: '価格表' }));
    });

    await waitFor(() => {
      const rows = screen.getAllByRole('row').slice(1);
      expect(within(rows[0]).getByRole('img')).toHaveAttribute('alt', 'ワイン');
    });
  });

  it('ignores malformed saved price table sorting', async () => {
    const getItemMock = vi.spyOn(Storage.prototype, 'getItem');
    getItemMock.mockImplementation((key: string) => {
      if (key === 'favorites-overview') return JSON.stringify([]);
      if (key === 'favorites-prices') return JSON.stringify(['ビール', 'ワイン']);
      if (key === 'visibleStations') return JSON.stringify(['83000001', '83000002']);
      if (key === 'home-price-table-sorting') {
        return JSON.stringify([{ id: '83000001', desc: 'descending' }]);
      }
      return null;
    });

    render(<Home />);

    await waitFor(() => expect(screen.getByRole('tab', { name: '価格表' })).toBeInTheDocument());
    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: '価格表' }));
    });

    await waitFor(() => {
      const rows = screen.getAllByRole('row').slice(1);
      expect(within(rows[0]).getByRole('img')).toHaveAttribute('alt', 'ビール');
    });
  });

  it.each([
    { columnName: '商品', columnId: 'goodsJp' },
    { columnName: 'シュグリシティ', columnId: '83000001' },
  ])('persists sorting for the $columnName column', async ({ columnName, columnId }) => {
    const getItemMock = vi.spyOn(Storage.prototype, 'getItem');
    getItemMock.mockImplementation((key: string) => {
      if (key === 'favorites-overview') return JSON.stringify([]);
      if (key === 'favorites-prices') return JSON.stringify(['ビール', 'ワイン']);
      if (key === 'visibleStations') return JSON.stringify(['83000001', '83000002']);
      return null;
    });

    render(<Home />);

    await waitFor(() => expect(screen.getByRole('tab', { name: '価格表' })).toBeInTheDocument());
    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: '価格表' }));
    });

    await waitFor(() => expect(screen.getByRole('button', { name: new RegExp(columnName) })).toBeInTheDocument());
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(columnName) }));
    });

    await waitFor(() => {
      expect(Storage.prototype.setItem).toHaveBeenCalledWith(
        'home-price-table-sorting',
        JSON.stringify([{ id: columnId, desc: false }])
      );
    });
  });

  it('keeps the active price table sort when switching tabs', async () => {
    const getItemMock = vi.spyOn(Storage.prototype, 'getItem');
    getItemMock.mockImplementation((key: string) => {
      if (key === 'favorites-overview') return JSON.stringify([]);
      if (key === 'favorites-prices') return JSON.stringify(['ビール', 'ワイン']);
      if (key === 'visibleStations') return JSON.stringify(['83000001', '83000002']);
      return null;
    });

    render(<Home />);

    await waitFor(() => expect(screen.getByRole('tab', { name: '価格表' })).toBeInTheDocument());
    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: '価格表' }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /シュグリシティ/ }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /シュグリシティ/ }));
    });

    await waitFor(() => {
      expect(Storage.prototype.setItem).toHaveBeenCalledWith(
        'home-price-table-sorting',
        JSON.stringify([{ id: '83000001', desc: true }])
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: '商品一覧' }));
      fireEvent.click(screen.getByRole('tab', { name: '価格表' }));
    });

    await waitFor(() => {
      const rows = screen.getAllByRole('row').slice(1);
      expect(within(rows[0]).getByRole('img')).toHaveAttribute('alt', 'ワイン');
    });
  });

  it('renders favorite card and toggles favorite state', async () => {
    render(<Home />);

    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());
    expect(screen.getByText('シュグリシティ')).toBeInTheDocument();
    expect(await screen.findByText(/\d+分前/)).toBeInTheDocument();

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
    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: '価格表' }));
    });

    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());
    expect(screen.getByText('1,100')).toBeInTheDocument();

    const toggle = screen.getByRole('switch', { name: '価格/％表示切替' });
    await act(async () => {
      fireEvent.click(toggle);
    });

    expect(screen.getByText('120%')).toBeInTheDocument();
  });

  it('keeps home price-table station columns left-aligned and horizontally scrollable', async () => {
    const getItemMock = vi.spyOn(Storage.prototype, 'getItem');
    getItemMock.mockImplementation((key: string) => {
      if (key === 'favorites-overview') return JSON.stringify([]);
      if (key === 'favorites-prices') return JSON.stringify([]);
      if (key === 'sortOrder') return 'default';
      if (key === 'showPercent') return 'false';
      if (key === 'visibleStations') return JSON.stringify(['83000001']);
      return null;
    });

    const { container } = render(<Home />);

    await screen.findByRole('tab', { name: '価格表' });
    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: '価格表' }));
    });

    const stationHeader = await screen.findByRole('button', { name: /シュグリシティ/ });
    const table = stationHeader.closest('table');

    expect(screen.queryByRole('button', { name: /ケープシティ/ })).not.toBeInTheDocument();
    expect(stationHeader).toHaveClass('justify-start');
    expect(table).toHaveClass('w-max');
    expect(container.querySelector('.overflow-x-auto')).toContainElement(table);
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

  it('uses defaults when storage is empty and updates time ago', async () => {
    const now = Date.now();
    const past = new Date(now - 60 * 1000);

    const getItemMock = vi.spyOn(Storage.prototype, 'getItem');
    getItemMock.mockImplementation((key: string) => {
      if (key === 'favorites-overview') return null;
      if (key === 'favorites-prices') return null;
      if (key === 'sortOrder') return null;
      if (key === 'showPercent') return null;
      if (key === 'visibleStations') return null;
      return null;
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        stations: mockStations,
        fetchTime: past.toISOString(),
      }),
    });

    render(<Home />);

    await waitFor(() => expect(screen.getByText('並び順')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('1分前')).toBeInTheDocument());
  });

  it('renders fallback items and station headers in price table', async () => {
    const stationsWithFallbacks = [
      {
        stationId: '83000001',
        buyItems: [
          { itemId: 'item1', price: 1000, is_rise: 1, quota: 1.2, trend: 1, is_rare: 1 },
          { itemId: 'item1', price: 1200, is_rise: 1, quota: 1.3, trend: 1, is_rare: 1 },
        ],
      },
      {
        stationId: '83000002',
        buyItems: [
          { itemId: 'item3', price: 0 },
        ],
      },
      {
        stationId: '99999999',
      },
    ];

    const getItemMock = vi.spyOn(Storage.prototype, 'getItem');
    getItemMock.mockImplementation((key: string) => {
      if (key === 'favorites-overview') return JSON.stringify([]);
      if (key === 'favorites-prices') return JSON.stringify(['item3']);
      if (key === 'sortOrder') return 'default';
      if (key === 'showPercent') return 'false';
      if (key === 'visibleStations') return JSON.stringify(['83000001', '83000002', '99999999']);
      return null;
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ stations: stationsWithFallbacks, fetchTime: new Date().toISOString() }),
    });

    render(<Home />);

    await waitFor(() => expect(screen.getByText('商品一覧')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: '価格表' }));
    });

    await waitFor(() => expect(screen.getByText('item3')).toBeInTheDocument());
    expect(screen.getByText('99999999')).toBeInTheDocument();
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);

    const toggle = screen.getByRole('switch', { name: '価格/％表示切替' });
    await act(async () => {
      fireEvent.click(toggle);
    });

    expect(screen.getAllByText('0%').length).toBeGreaterThan(0);
  });
});
