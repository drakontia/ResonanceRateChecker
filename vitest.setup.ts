import '@testing-library/jest-dom/vitest';

// Mock Next.js globals
(globalThis as { Request?: typeof Request }).Request = class Request {} as typeof Request;
(globalThis as { Response?: typeof Response }).Response = class Response {
  json() {
    return {};
  }
} as typeof Response;
(globalThis as { Headers?: typeof Headers }).Headers = class Headers {} as typeof Headers;

// Node.js v18未満やテスト環境でTextEncoder/TextDecoderが未定義の場合のpolyfill
import { TextDecoder, TextEncoder } from 'util';
if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder;
}
if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder;
}
