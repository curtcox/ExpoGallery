const fs = require('fs');

function replaceGithubSha(filePath, sha) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const updated = content.replace(/GITHUB_SHA/g, sha);
  fs.writeFileSync(filePath, updated);
}

module.exports = { replaceGithubSha };

if (require.main === module) {
  const [,, file, shaArg] = process.argv;
  const sha = shaArg || process.env.GITHUB_SHA;
  try {
    replaceGithubSha(file, sha);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
