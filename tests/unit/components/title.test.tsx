import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Title } from '@/components/title';
import { useIsMobile } from '@/hooks/use-mobile';

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(),
}));

describe('Title', () => {
  it.each([
    { isMobile: false, heading: '🚀 レゾナンス：無限号列車 相場チェッカー' },
    { isMobile: true, heading: '相場チェッカー' },
  ])('links the title banner to the home page (isMobile: $isMobile)', ({ isMobile, heading }) => {
    vi.mocked(useIsMobile).mockReturnValue(isMobile);

    render(<Title />);

    const titleLink = screen.getByRole('link', {
      name: `${heading} リアルタイム商品価格表示（最大5分更新）`,
    });

    expect(titleLink).toHaveAttribute('href', '/');
    expect(titleLink).toContainElement(screen.getByRole('heading', { level: 1, name: heading }));
    expect(titleLink).toHaveTextContent('リアルタイム商品価格表示（最大5分更新）');
  });
});
