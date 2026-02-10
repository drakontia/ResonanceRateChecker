import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';

import StationDropdown from '@/components/stationDropdown';

const setupMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

beforeEach(() => {
  setupMatchMedia();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('StationDropdown', () => {
  it('selects all stations', async () => {
    const onToggle = vi.fn();

    render(
      <StationDropdown
        stationIds={['83000001', '83000002']}
        cityData={{ '83000001': 'シュグリシティ', '83000002': 'ケープシティ' }}
        visibleStations={new Set(['83000001'])}
        onStationToggle={onToggle}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '駅を選択' }));
    fireEvent.click(screen.getByRole('button', { name: '全選択' }));

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(onToggle).toHaveBeenCalledWith('83000002');
  });

  it('deselects all stations', async () => {
    const onToggle = vi.fn();

    render(
      <StationDropdown
        stationIds={['83000001', '83000002']}
        cityData={{ '83000001': 'シュグリシティ', '83000002': 'ケープシティ' }}
        visibleStations={new Set(['83000001', '83000002'])}
        onStationToggle={onToggle}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '駅を選択' }));
    fireEvent.click(screen.getByRole('button', { name: '全解除' }));

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(onToggle).toHaveBeenCalledTimes(2);
    expect(onToggle).toHaveBeenCalledWith('83000001');
    expect(onToggle).toHaveBeenCalledWith('83000002');
  });
});
