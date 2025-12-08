import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import OverviewPage from '@/app/overview/page';

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
globalThis.fetch = mockFetch;

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

const mockTradeData = [
  { id: '82900001', goods_jp: 'ビール' },
  { id: '82900002', goods_jp: 'ブランデー' },
  { id: '82900003', goods_jp: 'ナッツ' },
  { id: '82900004', goods_jp: 'コハク' },
  { id: '82900005', goods_jp: 'マラカイト' }
];

const mockCityData = [
  { id: '83000001', jp: 'シュグリシティ' },
  { id: '83000002', jp: 'ケープシティ' },
  { id: '83000003', jp: 'ワンダーランド' }
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
      return Promise.resolve({
        json: () => Promise.resolve(mockTradeData),
        ok: true,
      } as Response);
    }
    if (urlString === '/db/city_db.json') {
      return Promise.resolve({
        json: () => Promise.resolve(mockCityData),
        ok: true,
      } as Response);
    }
    return Promise.reject(new Error('Unknown URL'));
  });
  
  Storage.prototype.getItem = jest.fn(() => 'true');
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
    
    const stars = screen.getAllByText('★');
    fireEvent.click(stars[0]);
    
    await waitFor(() => expect(stars[0]).toHaveClass('text-yellow-400'));
  });

  it('toggles dark mode', async () => {
    render(<OverviewPage />);
    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());
    
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    await waitFor(() => expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', expect.any(String)));
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
    expect(beerImage).toHaveAttribute('src', expect.stringContaining('%E3%83%93%E3%83%BC%E3%83%AB.png'));
    
    const brandyImage = screen.getByAltText('ブランデー');
    expect(brandyImage).toHaveAttribute('src', expect.stringContaining('%E3%83%96%E3%83%A9%E3%83%B3%E3%83%87%E3%83%BC.png'));
  });

  it('formats prices with thousand separators', async () => {
    const { container } = render(<OverviewPage />);
    await waitFor(() => expect(screen.getByText('ビール')).toBeInTheDocument());
    
    const priceElements = container.querySelectorAll('p');
    const prices = new Set(Array.from(priceElements).map(el => el.textContent));
    
    expect(prices.has('1,000')).toBe(true);
    expect(prices.has('2,000')).toBe(true);
    expect(prices.has('3,000')).toBe(true);
  });
});
