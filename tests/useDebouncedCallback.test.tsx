import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

import { useDebouncedCallback } from '../hooks/useDebouncedCallback';

vi.useFakeTimers();

describe('useDebouncedCallback', () => {
  it('should call the callback after the specified delay', () => {
    const fn = vi.fn();
    function TestComponent({ value }: { value: string }) {
      const debounced = useDebouncedCallback(fn, 300);
      React.useEffect(() => {
        debounced(value);
      }, [value, debounced]);
      return null;
    }
    const { rerender } = render(<TestComponent value="a" />);
    rerender(<TestComponent value="b" />);
    // まだ呼ばれていない
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('b');
  });

  it('should reset timer if called again before delay', () => {
    const fn = vi.fn();
    function TestComponent({ value }: { value: string }) {
      const debounced = useDebouncedCallback(fn, 200);
      React.useEffect(() => {
        debounced(value);
      }, [value, debounced]);
      return null;
    }
    const { rerender } = render(<TestComponent value="x" />);
    vi.advanceTimersByTime(100);
    rerender(<TestComponent value="y" />);
    vi.advanceTimersByTime(100);
    rerender(<TestComponent value="z" />);
    // まだ呼ばれていない
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('z');
  });
});
