import { render } from '@testing-library/react';
import { useDebouncedCallback } from '../useDebouncedCallback';
import React from 'react';

jest.useFakeTimers();

describe('useDebouncedCallback', () => {
  it('should call the callback after the specified delay', () => {
    const fn = jest.fn();
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
    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('b');
  });

  it('should reset timer if called again before delay', () => {
    const fn = jest.fn();
    function TestComponent({ value }: { value: string }) {
      const debounced = useDebouncedCallback(fn, 200);
      React.useEffect(() => {
        debounced(value);
      }, [value, debounced]);
      return null;
    }
    const { rerender } = render(<TestComponent value="x" />);
    jest.advanceTimersByTime(100);
    rerender(<TestComponent value="y" />);
    jest.advanceTimersByTime(100);
    rerender(<TestComponent value="z" />);
    // まだ呼ばれていない
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('z');
  });
});
