import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import PricePercentToggle from '../../../components/pricePercentToggle';

describe('PricePercentToggle', () => {
  it('renders with price mode initially', () => {
    const mockOnToggle = vi.fn();
    render(<PricePercentToggle showPercent={false} onToggle={mockOnToggle} />);
    
    const toggleSwitch = screen.getByRole('switch', { name: '価格/％表示切替' });
    expect(toggleSwitch).toBeInTheDocument();
    expect(toggleSwitch).not.toBeChecked();
    expect(screen.getByText('価格')).toBeInTheDocument();
    expect(screen.getByText('％')).toBeInTheDocument();
  });

  it('renders with percent mode when showPercent is true', () => {
    const mockOnToggle = vi.fn();
    render(<PricePercentToggle showPercent={true} onToggle={mockOnToggle} />);
    
    const toggleSwitch = screen.getByRole('switch', { name: '価格/％表示切替' });
    expect(toggleSwitch).toBeInTheDocument();
    expect(toggleSwitch).toBeChecked();
  });

  it('calls onToggle when clicked', () => {
    const mockOnToggle = vi.fn();
    render(<PricePercentToggle showPercent={false} onToggle={mockOnToggle} />);
    
    const toggleSwitch = screen.getByRole('switch', { name: '価格/％表示切替' });
    fireEvent.click(toggleSwitch);
    
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
    expect(mockOnToggle).toHaveBeenCalledWith(true);
  });

  it('displays "表示:" label', () => {
    const mockOnToggle = vi.fn();
    render(<PricePercentToggle showPercent={false} onToggle={mockOnToggle} />);
    
    expect(screen.getByText('表示:')).toBeInTheDocument();
  });
});
