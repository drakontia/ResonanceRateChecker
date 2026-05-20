import { vi, describe, it, expect, beforeEach } from 'vitest';

import { GET } from '../../../app/api/cron/revalidate/route';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  cacheTag: vi.fn(),
}));

// NextResponse.jsonをモック
vi.spyOn(NextResponse, 'json').mockImplementation((data) => {
  return { json: () => Promise.resolve(data), data } as any;
});

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
  } as unknown as NextRequest;
}

describe('Cron Revalidate API Route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.CRON_SECRET;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('CRON_SECRETが設定されていない場合', () => {
    it('認証なしでリクエストが成功し、revalidateTagが呼ばれること', async () => {
      const request = makeRequest();
      const response = await GET(request);
      const result = await response.json();

      expect(revalidateTag).toHaveBeenCalledWith('trade', {});
      expect(result.revalidated).toBe(true);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('CRON_SECRETが設定されている場合', () => {
    beforeEach(() => {
      process.env.CRON_SECRET = 'test-secret';
    });

    it('正しいAuthorizationヘッダーでリクエストが成功すること', async () => {
      const request = makeRequest({ authorization: 'Bearer test-secret' });
      const response = await GET(request);
      const result = await response.json();

      expect(revalidateTag).toHaveBeenCalledWith('trade', {});
      expect(result.revalidated).toBe(true);
      expect(result.timestamp).toBeDefined();
    });

    it('間違ったAuthorizationヘッダーで401が返ること', async () => {
      vi.spyOn(NextResponse, 'json').mockImplementationOnce((data, init) => {
        return { json: () => Promise.resolve(data), data, status: init?.status } as any;
      });

      const request = makeRequest({ authorization: 'Bearer wrong-secret' });
      const response = await GET(request);

      expect(revalidateTag).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
    });

    it('Authorizationヘッダーなしで401が返ること', async () => {
      vi.spyOn(NextResponse, 'json').mockImplementationOnce((data, init) => {
        return { json: () => Promise.resolve(data), data, status: init?.status } as any;
      });

      const request = makeRequest();
      const response = await GET(request);

      expect(revalidateTag).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
    });
  });
});
