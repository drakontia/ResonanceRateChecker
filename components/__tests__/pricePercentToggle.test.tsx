import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PricePercentToggle from '../pricePercentToggle';

describe('PricePercentToggle', () => {
  it('renders with price mode initially', () => {
    const mockOnToggle = jest.fn();
    render(<PricePercentToggle showPercent={false} onToggle={mockOnToggle} />);
    
    const toggleButton = screen.getByRole('button', { name: '価格/％表示切替' });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent('💰 価格');
  });

  it('renders with percent mode when showPercent is true', () => {
    const mockOnToggle = jest.fn();
    render(<PricePercentToggle showPercent={true} onToggle={mockOnToggle} />);
    
    const toggleButton = screen.getByRole('button', { name: '価格/％表示切替' });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent('％');
  });

  it('calls onToggle when clicked', () => {
    const mockOnToggle = jest.fn();
    render(<PricePercentToggle showPercent={false} onToggle={mockOnToggle} />);
    
    const toggleButton = screen.getByRole('button', { name: '価格/％表示切替' });
    fireEvent.click(toggleButton);
    
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('displays "表示:" label', () => {
    const mockOnToggle = jest.fn();
    render(<PricePercentToggle showPercent={false} onToggle={mockOnToggle} />);
    
    expect(screen.getByText('表示:')).toBeInTheDocument();
  });
});
