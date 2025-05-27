const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { prepareFirebaseDir } = require('../scripts/prepareFirebaseDir');
const { replaceGithubSha } = require('../scripts/replaceGithubSha');
const { verifyDeployedSha } = require('../scripts/verifyDeployedSha');

describe('prepareFirebaseDir', () => {
  test('copies files and checks version.json', () => {
    const tmpSrc = fs.mkdtempSync(path.join(os.tmpdir(), 'src'));
    const tmpDest = fs.mkdtempSync(path.join(os.tmpdir(), 'dest'));
    fs.mkdirSync(path.join(tmpSrc, 'public'), { recursive: true });
    fs.writeFileSync(path.join(tmpSrc, 'public', 'version.json'), '{"build":"x"}');
    fs.writeFileSync(path.join(tmpSrc, 'file.txt'), 'data');
    prepareFirebaseDir(tmpSrc, tmpDest);
    expect(fs.existsSync(path.join(tmpDest, 'file.txt'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDest, 'public', 'version.json'))).toBe(true);
  });
});

describe('replaceGithubSha', () => {
  test('replaces placeholder', () => {
    const tmpFile = path.join(os.tmpdir(), 'about.html');
    fs.writeFileSync(tmpFile, 'GITHUB_SHA');
    replaceGithubSha(tmpFile, 'abc');
    expect(fs.readFileSync(tmpFile, 'utf8')).toBe('abc');
  });
});

describe('verifyDeployedSha', () => {
  test('verifies SHA from server', async () => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ build: 'sha123' }));
    });
    await new Promise(resolve => server.listen(0, resolve));
    const port = server.address().port;
    const url = `http://localhost:${port}`;
    const details = { mapchatai: { live: { url } } };
    await expect(
      verifyDeployedSha({
        channelId: 'live',
        projectId: 'mapchatai',
        deployDetails: details,
        versionPath: 'version.json',
        expectedSha: 'sha123'
      })
    ).resolves.toEqual(expect.objectContaining({ deployedSha: 'sha123' }));
    server.close();
  });

  test('throws on mismatch', async () => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ build: 'wrong' }));
    });
    await new Promise(resolve => server.listen(0, resolve));
    const port = server.address().port;
    const url = `http://localhost:${port}`;
    const details = { mapchatai: { live: { url } } };
    await expect(
      verifyDeployedSha({
        channelId: 'live',
        projectId: 'mapchatai',
        deployDetails: details,
        versionPath: 'version.json',
        expectedSha: 'expected'
      })
    ).rejects.toThrow();
    server.close();
  });
});
