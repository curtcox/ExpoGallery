const fs = require('fs');
const path = require('path');

// Configuration
const sourceDirectories = [
  'app',
  'components',
  'constants',
  'hooks',
  'scripts',
  'styles',
  'types',
  'utils'
];
const targetDir = path.join(__dirname, '..', 'public', 'sources');

// Helper function to copy files recursively
function copyFilesRecursively(sourceDir, targetBaseDir) {
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  const files = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file.name);
    const targetPath = path.join(targetBaseDir, file.name);

    if (file.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      copyFilesRecursively(sourcePath, targetPath);
    } else {
      // Only copy source files (you can adjust this filter as needed)
      if (/\.(js|jsx|ts|tsx|css|scss|json)$/.test(file.name)) {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }
}

try {
  // Create the target directory
  fs.mkdirSync(targetDir, { recursive: true });

  // Copy important config files from root
  const rootFiles = [
    'package.json',
    'app.config.js',
    'babel.config.js',
    'tsconfig.json',
    'metro.config.js'
  ];

  for (const file of rootFiles) {
    const sourcePath = path.join(__dirname, '..', file);
    const targetPath = path.join(targetDir, file);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }

  // Copy source directories
  for (const dir of sourceDirectories) {
    const sourceDir = path.join(__dirname, '..', dir);
    const targetPath = path.join(targetDir, dir);

    if (fs.existsSync(sourceDir)) {
      fs.mkdirSync(targetPath, { recursive: true });
      copyFilesRecursively(sourceDir, targetPath);
    }
  }

  console.log('Successfully copied source files to public/sources directory');
} catch (err) {
  console.error('\n\x1b[41m\x1b[37m ERROR COPYING SOURCE FILES \x1b[0m');
  console.error('\x1b[31m' + err.message + '\x1b[0m\n');
  process.exit(1);
}