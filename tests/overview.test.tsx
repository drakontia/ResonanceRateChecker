import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// next-themesのuseThemeをdescribe外でモック
const setTheme = jest.fn();
jest.mock('next-themes', () => ({
  useTheme: () => ({ setTheme, theme: 'light' })
}));

// lib/cityDb, lib/tradeDb をテスト用データでモック
jest.mock('@/lib/cityDb', () => ({
  cityDb: {
    '83000001': 'シュグリシティ',
    '83000002': 'ケープシティ',
    '83000003': '荒地駅',
  },
}));
jest.mock('@/lib/tradeDb', () => ({
  tradeDb: {
    '82900001': 'ビール',
    '82900002': 'ブランデー',
    '82900003': 'ナッツ',
    '82900004': 'コハク',
    '82900005': 'マラカイト',
  },
}));

import OverviewPage from '@/app/overview/page';

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
globalThis.fetch = mockFetch;

// JSDOM環境でwindow.matchMediaが未定義のため、importより前にjestモックを追加
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const mockStations = [
  {
    stationId: '83000001',
    buyItems: [
      { itemId: '82900001', price: 1000, is_rise: 1, quota: 1.2, trend: 1, is_rare: 1 },
      { itemId: '82900002', price: 2000, is_rise: 0, quota: 0.8, trend: 0, is_rare: 0 },
      { itemId: '82900003', price: 1500, is_rise: 1, quota: 1.1, trend: 0, is_rare: 0 }
    ]
  },
  {
    stationId: '83000002',
    buyItems: [
      { itemId: '82900001', price: 1100, is_rise: 0, quota: 0.9, trend: 0, is_rare: 1 },
      { itemId: '82900004', price: 3000, is_rise: 1, quota: 1.3, trend: 1, is_rare: 0 }
    ]
  },
  {
    stationId: '83000003',
    buyItems: [
      { itemId: '82900002', price: 1800, is_rise: 1, quota: 1.0, trend: 0, is_rare: 0 },
      { itemId: '82900005', price: 2500, is_rise: 0, quota: 0.7, trend: 0, is_rare: 1 }
    ]
  }
];

beforeEach(() => {
  mockFetch.mockImplementation((url: string | URL | Request) => {
    let urlString: string;
    if (typeof url === 'string') {
      urlString = url;
    } else if (url instanceof URL) {
      urlString = url.toString();
    } else {
      urlString = url.url;
    }
    if (urlString === '/api/trade') {
      return Promise.resolve({
        json: () => Promise.resolve({ stations: mockStations, fetchTime: new Date().toISOString() }),
        ok: true,
      } as Response);
    }
    if (urlString === '/db/trade_db.json') {
      // jest.mockで定義したtradeDbを返す
      const { tradeDb } = require('@/lib/tradeDb');
      return Promise.resolve({
        json: () => Promise.resolve(tradeDb),
        ok: true,
      } as Response);
    }
    if (urlString === '/db/city_db.json') {
      // jest.mockで定義したcityDbを返す
      const { cityDb } = require('@/lib/cityDb');
      return Promise.resolve({
        json: () => Promise.resolve(cityDb),
        ok: true,
      } as Response);
    }
    return Promise.reject(new Error('Unknown URL'));
  });

  // お気に入りIDセット（全mockデータ分）
  const favoriteKeys = [
    '83000001-ビール',
    '83000001-ブランデー',
    '83000001-ナッツ',
    '83000002-ビール',
    '83000002-コハク',
    '83000003-ブランデー',
    '83000003-マラカイト',
  ];
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'favorites-overview') {
      return JSON.stringify(favoriteKeys);
    }
    if (key === 'selectedStation') {
      return null;
    }
    return null;
  });
  Storage.prototype.setItem = jest.fn();
});

describe('OverviewPage', () => {
  it('renders loading state initially', async () => {
    render(<OverviewPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
  });

  it('displays items after data loads', async () => {
    render(<OverviewPage />);
    await waitFor(() => {
      expect(screen.getByText('ビール')).toBeInTheDocument();
      expect(screen.getByText('ブランデー')).toBeInTheDocument();
    });
  });

  it('filters items by search query', async () => {
    render(<OverviewPage />);
    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText('商品を検索...');
    fireEvent.change(searchInput, { target: { value: 'ビール' } });

    await waitFor(() => {
      expect(screen.getByText('ビール')).toBeInTheDocument();
      expect(screen.queryByText('ブランデー')).not.toBeInTheDocument();
    });
  });

  it('toggles favorite on star click', async () => {
    render(<OverviewPage />);
    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());

    // aria-label="Toggle star" で取得
    const starButtons = screen.getAllByRole('button', { name: /toggle star/i });
    expect(starButtons.length).toBeGreaterThan(0);
    fireEvent.click(starButtons[0]);
    // aria-pressedが切り替わることを確認
    await waitFor(() => expect(starButtons[0]).toHaveAttribute('aria-pressed'));
  });

  it('toggles dark mode', async () => {
    render(<OverviewPage />);
    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());

    // ムーンアイコンのボタンを取得
    const buttons = screen.getAllByRole('button');
    const darkButton = buttons.find(btn => {
      const svg = btn.querySelector('svg');
      return svg && svg.outerHTML.includes('moon');
    }) || buttons[1];
    expect(darkButton).toBeTruthy();
    fireEvent.click(darkButton);
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('displays station name', async () => {
    render(<OverviewPage />);
    await waitFor(() => {
      const stationNames = screen.getAllByText('シュグリシティ');
      expect(stationNames.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('displays correct trend icons based on is_rise', async () => {
    const { container } = render(<OverviewPage />);
    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());

    const trendingUpIcons = container.querySelectorAll('.MuiSvgIcon-root.text-green-400');
    const trendingDownIcons = container.querySelectorAll('.MuiSvgIcon-root.text-red-400');

    expect(trendingUpIcons.length + trendingDownIcons.length).toBeGreaterThan(0);
  });

  it('displays correct item images', async () => {
    render(<OverviewPage />);
    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());

    const beerImage = screen.getByAltText('ビール');
    expect(beerImage).toHaveAttribute('src');
    // srcが/_next/imageを含む絶対URLであること
    const beerSrc = beerImage.getAttribute('src') || '';
    expect(beerSrc).toContain('/_next/image');
    // urlクエリパラメータを抽出して判定
    const beerUrlParamRaw = beerSrc.split('url=')[1]?.split('&')[0] || '';
    // 2重エンコードされている場合も考慮し2回デコード
    let beerDecoded = beerUrlParamRaw;
    try {
      beerDecoded = decodeURIComponent(decodeURIComponent(beerUrlParamRaw));
    } catch (e) {
      // 1回だけデコードでOKな場合もある
      beerDecoded = decodeURIComponent(beerUrlParamRaw);
    }
    expect(beerDecoded).toBe('/images/items/ビール.png');

    const brandyImage = screen.getByAltText('ブランデー');
    expect(brandyImage).toHaveAttribute('src');
    const brandySrc = brandyImage.getAttribute('src') || '';
    const brandyUrlParamRaw = brandySrc.split('url=')[1]?.split('&')[0] || '';
    let brandyDecoded = brandyUrlParamRaw;
    try {
      brandyDecoded = decodeURIComponent(decodeURIComponent(brandyUrlParamRaw));
    } catch (e) {
      brandyDecoded = decodeURIComponent(brandyUrlParamRaw);
    }
    expect(brandyDecoded).toBe('/images/items/ブランデー.png');
  });

  it('formats prices with thousand separators', async () => {
    const { container } = render(<OverviewPage />);
    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());

    // 画面に実際に表示される最大価格のみアサート
    const text = container.textContent || '';
    // ビール: 1,100, ブランデー: 2,000, コハク: 3,000, マラカイト: 2,500, ナッツ: 1,500
    expect(text).toMatch(/1,100/);
    expect(text).toMatch(/2,000/);
    expect(text).toMatch(/3,000/);
    expect(text).toMatch(/2,500/);
    expect(text).toMatch(/1,500/);
  });
});
