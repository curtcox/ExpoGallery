const http = require('http');
const https = require('https');

function fetchJson(url) {
  const getter = url.startsWith('https') ? https.get : http.get;
  return new Promise((resolve, reject) => {
    getter(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchJsonWithRetry(url, attempts = 5, delayMs = 10000) {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fetchJson(url);
    } catch (err) {
      if (i === attempts) throw err;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

function getSiteUrl(details, channelId, projectId) {
  const project = details[projectId];
  if (!project) return null;
  if (channelId === 'live') {
    return project.live && project.live.url;
  }
  for (const key of Object.keys(project)) {
    if (key.startsWith(channelId)) {
      return project[key].url;
    }
  }
  return null;
}

async function verifyDeployedSha({ channelId, projectId, deployDetails, versionPath, expectedSha }) {
  const siteUrl = getSiteUrl(deployDetails, channelId, projectId);
  if (!siteUrl) {
    throw new Error('Could not extract site URL from Firebase deployment details.');
  }
  const versionUrl = `${siteUrl}/${versionPath}`;
  const json = await fetchJsonWithRetry(versionUrl);
  const deployedSha = json.build;
  if (!deployedSha) {
    throw new Error('Could not fetch deployed SHA');
  }
  if (deployedSha !== expectedSha) {
    throw new Error(`Deployed SHA (${deployedSha}) does not match expected SHA (${expectedSha}).`);
  }
  return { siteUrl, versionUrl, deployedSha };
}

module.exports = { verifyDeployedSha, getSiteUrl, fetchJson, fetchJsonWithRetry };

if (require.main === module) {
  const [,, channelId, projectId, detailsJson, versionPath, expectedSha] = process.argv;
  try {
    const deployDetails = JSON.parse(detailsJson);
    verifyDeployedSha({ channelId, projectId, deployDetails, versionPath, expectedSha })
      .then(info => {
        console.log(`Successfully verified deployed SHA on ${info.versionUrl}`);
      })
      .catch(err => {
        console.error(err.message);
        process.exit(1);
      });
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
