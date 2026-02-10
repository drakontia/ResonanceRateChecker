import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import TopNavbar from '@/components/topNavbar';

const setTheme = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: () => ({ setTheme, theme: 'light' }),
}));

const useIsMobileMock = vi.fn();
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => useIsMobileMock(),
}));

describe('TopNavbar', () => {
  it('renders desktop layout', () => {
    useIsMobileMock.mockReturnValue(false);
    render(<TopNavbar />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.queryByText('メニューを開く')).not.toBeInTheDocument();
  });

  it('renders mobile layout with menu button', () => {
    useIsMobileMock.mockReturnValue(true);
    render(<TopNavbar />);

    expect(screen.getByText('メニューを開く')).toBeInTheDocument();
  });
});
