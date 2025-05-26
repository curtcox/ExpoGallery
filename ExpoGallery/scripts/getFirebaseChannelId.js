function sanitizeBranchName(name) {
  if (!name) return '';
  let sanitized = name.toLowerCase();
  sanitized = sanitized.replace(/[^a-z0-9-]/g, '-');
  sanitized = sanitized.slice(0, 36);
  sanitized = sanitized.replace(/^-+/, '').replace(/-+$/, '');
  return sanitized;
}

function getFirebaseChannelId(ctx) {
  const { eventName, ref, refName, eventNumber, inputs = {} } = ctx;

  if (eventName === 'push' && ref === 'refs/heads/main') {
    return 'live';
  } else if (eventName === 'push') {
    const branch = sanitizeBranchName(refName);
    const name = branch || 'preview';
    return `preview-${name}`;
  } else if (eventName === 'pull_request') {
    return `preview-pr-${eventNumber}`;
  } else if (eventName === 'workflow_dispatch') {
    const inputBranch = inputs.branch || '';
    const branch = sanitizeBranchName(inputBranch);
    const normalized = inputBranch.toLowerCase();
    if (normalized === 'main') {
      return 'live';
    } else if (!branch) {
      return 'preview-manual';
    } else {
      return `preview-${branch}`;
    }
  }
  throw new Error('Unknown event type or context for Firebase deployment.');
}

module.exports = { sanitizeBranchName, getFirebaseChannelId };

if (require.main === module) {
  const fs = require('fs');
  const context = {
    eventName: process.env.GITHUB_EVENT_NAME,
    ref: process.env.GITHUB_REF,
    refName: process.env.GITHUB_REF_NAME,
    eventNumber: process.env.GITHUB_EVENT_NUMBER,
    inputs: { branch: process.env.INPUT_BRANCH }
  };
  const channelId = getFirebaseChannelId(context);
  console.log(`Firebase Channel ID: ${channelId}`);
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `channel_id=${channelId}\n`);
  }
}
