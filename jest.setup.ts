import '@testing-library/jest-dom'

// Mock Next.js globals
global.Request = class Request {} as any;
global.Response = class Response {} as any;
global.Headers = class Headers {} as any;
