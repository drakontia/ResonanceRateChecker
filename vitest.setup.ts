import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

// Mock Next.js globals
(globalThis as { Request?: typeof Request }).Request = class Request {} as unknown as typeof Request;
(globalThis as { Response?: typeof Response }).Response = class Response {
  json() {
    return {};
  }
} as unknown as typeof Response;
(globalThis as { Headers?: typeof Headers }).Headers = class Headers {} as unknown as typeof Headers;

// Node.js v18未満やテスト環境でTextEncoder/TextDecoderが未定義の場合のpolyfill
import { TextDecoder, TextEncoder } from 'util';
if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder as unknown as typeof globalThis.TextEncoder;
}
if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;
}

// next/image をテスト向けに簡易的な /_next/image URL へ変換
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: { src?: string | { src?: string }; alt?: string }) => {
    const rawSrc = typeof props.src === 'string' ? props.src : props.src?.src ?? '';
    const encoded = encodeURIComponent(rawSrc);
    const src = `/_next/image?url=${encoded}&w=640&q=75`;
    return React.createElement('img', { src, alt: props.alt });
  },
}));

// JSDOMで不足しているブラウザAPIの補完
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof globalThis.ResizeObserver;
}

if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

if (!globalThis.PointerEvent) {
  globalThis.PointerEvent = MouseEvent as unknown as typeof PointerEvent;
}

if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = () => {};
}
