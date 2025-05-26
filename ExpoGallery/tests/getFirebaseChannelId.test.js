const { getFirebaseChannelId, sanitizeBranchName } = require('../scripts/getFirebaseChannelId');

describe('sanitizeBranchName', () => {
  test('removes invalid characters and trims', () => {
    expect(sanitizeBranchName('Feature/ABC_123')).toBe('feature-abc-123');
    expect(sanitizeBranchName('---Crazy*Branch***')).toBe('crazy-branch');
    expect(sanitizeBranchName('VeryLongBranchNameThatExceedsThirtySixCharacters')).toBe('verylongbranchnamethatexceedsthirt');
  });
});

describe('getFirebaseChannelId', () => {
  test('push to main uses live', () => {
    const id = getFirebaseChannelId({ eventName: 'push', ref: 'refs/heads/main' });
    expect(id).toBe('live');
  });

  test('push to branch generates preview name', () => {
    const id = getFirebaseChannelId({ eventName: 'push', ref: 'refs/heads/dev', refName: 'Dev' });
    expect(id).toBe('preview-dev');
  });

  test('pull request channel', () => {
    const id = getFirebaseChannelId({ eventName: 'pull_request', eventNumber: 42 });
    expect(id).toBe('preview-pr-42');
  });

  test('workflow_dispatch with main branch uses live', () => {
    const id = getFirebaseChannelId({ eventName: 'workflow_dispatch', inputs: { branch: 'main' } });
    expect(id).toBe('live');
  });

  test('workflow_dispatch with custom branch', () => {
    const id = getFirebaseChannelId({ eventName: 'workflow_dispatch', inputs: { branch: 'Feature/ABC' } });
    expect(id).toBe('preview-feature-abc');
  });

  test('workflow_dispatch with empty branch uses preview-manual', () => {
    const id = getFirebaseChannelId({ eventName: 'workflow_dispatch', inputs: { branch: '' } });
    expect(id).toBe('preview-manual');
  });

  test('unknown event throws error', () => {
    expect(() => getFirebaseChannelId({ eventName: 'unknown' })).toThrow();
  });
});
