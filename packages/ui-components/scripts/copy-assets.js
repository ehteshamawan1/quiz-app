const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src');
const distDir = path.resolve(__dirname, '../dist');

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied ${src} to ${dest}`);
}

function traverseAndCopy(currentDir) {
  const files = fs.readdirSync(currentDir);

  for (const file of files) {
    const srcPath = path.join(currentDir, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      traverseAndCopy(srcPath);
    } else if (path.extname(file) === '.css') {
      const relativePath = path.relative(srcDir, srcPath);
      const destPath = path.join(distDir, relativePath);
      copyFile(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('Copying CSS files...');
traverseAndCopy(srcDir);
console.log('CSS files copied successfully.');
