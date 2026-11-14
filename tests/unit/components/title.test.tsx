import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { vi } from 'vitest';

import { Title } from '@/components/title';
import { useIsMobile } from '@/hooks/use-mobile';

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(),
}));

describe('Title', () => {
  it('renders the title visibly before hydration', () => {
    vi.mocked(useIsMobile).mockReturnValue(false);

    const { container } = render(
      <div dangerouslySetInnerHTML={{ __html: renderToStaticMarkup(<Title />) }} />
    );
    const heading = container.querySelector('h1');

    expect(heading).not.toBeNull();
    for (let element = heading; element; element = element.parentElement) {
      expect(element).toBeVisible();
      expect(element.style.opacity).not.toBe('0');
    }
  });

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
