import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Title } from '@/components/title';

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

describe('Title', () => {
  it('links the title banner to the home page', () => {
    render(<Title />);

    const titleLink = screen.getByRole('link', {
      name: /レゾナンス：無限号列車 相場チェッカー/,
    });

    expect(titleLink).toHaveAttribute('href', '/');
    expect(titleLink).toHaveTextContent('リアルタイム商品価格表示（最大5分更新）');
  });
});
