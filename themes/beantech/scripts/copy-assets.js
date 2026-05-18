// Auto-copy missing static assets from theme and site source to public directory
// Workaround for Hexo 3.x issue where some large static files are not copied
'use strict';

const fs = require('fs');
const path = require('path');

const DIR_SEP = /[\/\\]/;

// Recursively copy all files from srcDir to destDir if missing
function copyMissingDir(srcDir, destDir, log, prefix) {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    const relPath = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isDirectory()) {
      copyMissingDir(srcPath, destPath, log, relPath);
    } else if (entry.isFile() && !fs.existsSync(destPath)) {
      const destDirname = path.dirname(destPath);
      if (!fs.existsSync(destDirname)) {
        fs.mkdirSync(destDirname, { recursive: true });
      }
      fs.copyFileSync(srcPath, destPath);
      log.info(`Copied missing asset: ${relPath}`);
    }
  }
}

// Theme assets that are not always copied by hexo generate
const themeAssetsToCopy = [
  'css/bootstrap.css',
  'css/bootstrap.min.css',
  'js/jquery.js',
  'js/jquery.min.js'
];

hexo.extend.filter.register('after_generate', function() {
  const log = this.log;
  const themeDir = path.join(__dirname, '..', 'source');
  const publicDir = this.public_dir;

  // Copy specific theme static assets
  themeAssetsToCopy.forEach(relPath => {
    const src = path.join(themeDir, relPath);
    const dest = path.join(publicDir, relPath);

    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(src, dest);
      log.info(`Copied missing asset: ${relPath}`);
    }
  });

  // Copy missing images from site source/img to public/img
  const siteImgDir = path.join(process.cwd(), 'source', 'img');
  const publicImgDir = path.join(publicDir, 'img');
  copyMissingDir(siteImgDir, publicImgDir, log, 'img');
});
