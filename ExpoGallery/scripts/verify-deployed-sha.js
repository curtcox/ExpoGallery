

async function fetchJson(url, fetch) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

async function verifyDeployedSha(versionUrl, expectedSha, options = {}) {
  const { retries = 5, delayMs = 10000 } = options;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const data = await fetchJson(versionUrl);
      const deployedSha = data.build;
      if (!deployedSha) {
        throw new Error('Missing build field in version.json');
      }
      if (deployedSha !== expectedSha) {
        throw new Error(`Deployed SHA (${deployedSha}) does not match expected SHA (${expectedSha})`);
      }
      return true;
    } catch (err) {
      if (attempt === retries - 1) {
        throw err;
      }
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

if (require.main === module) {
  const [versionUrl, expectedSha] = process.argv.slice(2);
  if (!versionUrl || !expectedSha) {
    console.error('Usage: node verify-deployed-sha.js <versionUrl> <expectedSha>');
    process.exit(1);
  }
  verifyDeployedSha(versionUrl, expectedSha).then(() => {
    console.log('Successfully verified deployed SHA.');
  }).catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { verifyDeployedSha };
