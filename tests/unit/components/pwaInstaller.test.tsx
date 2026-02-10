import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';

import PWAInstaller from '@/components/PWAInstaller';

const setupMatchMedia = (matches = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
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
  vi.useFakeTimers();
  setupMatchMedia(false);
  Object.defineProperty(navigator, 'userAgent', {
    value: 'iPhone',
    configurable: true,
  });
  (window as any).PushManager = function PushManager() {};
  (navigator as any).serviceWorker = {
    register: vi.fn().mockResolvedValue({}),
  };

  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => undefined);
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('PWAInstaller', () => {
  it('shows iOS install prompt and dismisses', () => {
    render(<PWAInstaller />);

    expect(screen.getByText('アプリをインストール')).toBeInTheDocument();

    const dismissButton = screen.getAllByRole('button')[0];
    fireEvent.click(dismissButton);

    expect(Storage.prototype.setItem).toHaveBeenCalledWith(
      'pwa-install-dismissed',
      expect.any(String)
    );
  });

  it('shows install prompt after beforeinstallprompt event', async () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Android',
      configurable: true,
    });

    render(<PWAInstaller />);

    const event = new Event('beforeinstallprompt');
    (event as any).prompt = vi.fn();
    (event as any).userChoice = Promise.resolve({ outcome: 'accepted' });

    act(() => {
      window.dispatchEvent(event);
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText('インストール')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'インストール' }));

    await act(async () => {
      await (event as any).userChoice;
    });

    expect((event as any).prompt).toHaveBeenCalled();
  });
});
