import { render, screen } from '@testing-library/react';

import CardMetric from '@/components/cardMetric';

describe('CardMetric', () => {
  it('gives the item image a slightly larger share on desktop without moving the item name', () => {
    const { container } = render(
      <CardMetric
        name="ビール"
        price={1000}
        imageUrl="/images/items/ビール.png"
      />,
    );

    const image = screen.getByAltText('ビール');
    const imageArea = image.parentElement;
    const contentArea = imageArea?.nextElementSibling;
    const itemName = screen.getByText('ビール');

    expect(imageArea?.className).toContain('lg:flex-[1.1]');
    expect(contentArea?.className).toContain('lg:flex-[0.9]');
    expect(container.querySelector('.mb-2')?.contains(itemName)).toBe(true);
  });
});
