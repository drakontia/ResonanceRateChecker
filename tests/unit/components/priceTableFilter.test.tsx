import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import PriceTableFilter from '@/components/priceTableFilter';

describe('PriceTableFilter', () => {
  it('calls onSearchChange when input changes', () => {
    const onSearchChange = vi.fn();

    render(
      <PriceTableFilter
        searchQuery=""
        onSearchChange={onSearchChange}
      />
    );

    const input = screen.getByPlaceholderText('商品を検索...');
    fireEvent.change(input, { target: { value: 'ビール' } });

    expect(onSearchChange).toHaveBeenCalledWith('ビール');
  });
});
