const { verifyDeployedSha } = require('../scripts/verify-deployed-sha');

describe('verifyDeployedSha', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  test('resolves when SHA matches', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ build: 'abc' }) });
    await expect(verifyDeployedSha('http://example.com', 'abc', { retries: 1 })).resolves.toBe(true);
  });

  test('rejects on mismatch', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ build: 'def' }) });
    await expect(verifyDeployedSha('http://example.com', 'abc', { retries: 1 })).rejects.toThrow('does not match');
  });

  test('retries on failure', async () => {
    global.fetch
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue({ ok: true, json: async () => ({ build: 'abc' }) });
    await expect(verifyDeployedSha('http://example.com', 'abc', { retries: 2, delayMs: 1 })).resolves.toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

