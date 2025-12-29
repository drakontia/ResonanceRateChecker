import '@testing-library/jest-dom'

// Mock Next.js globals
global.Request = class Request {} as any;
global.Response = class Response {
	json() { return {}; }
} as any;
global.Headers = class Headers {} as any;

// Node.js v18未満やJest環境でTextEncoder/TextDecoderが未定義の場合のpolyfill
import { TextEncoder, TextDecoder } from 'util';
if (!global.TextEncoder) {
	global.TextEncoder = TextEncoder;
}
