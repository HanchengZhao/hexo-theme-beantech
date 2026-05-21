#!/usr/bin/env node
var Hexo = require('hexo');
var path = require('path');
var fs = require('fs');

var hexo = new Hexo(process.cwd(), { silent: false });
var publicDir = path.join(process.cwd(), 'public');

function generateOne(routePath) {
  return new Promise(function(resolve) {
    var stream = hexo.route.get(routePath);
    if (!stream || typeof stream.pipe !== 'function') {
      console.log('  SKIP ' + routePath);
      return resolve();
    }
    var chunks = [];
    var done = false;
    var t = setTimeout(function() {
      if (!done) { console.error('  TIMEOUT ' + routePath); done = true; resolve(); }
    }, 5000);

    function finish() {
      if (done) return;
      done = true; clearTimeout(t);
      try {
        // Convert string chunks to Buffer if needed (Node 24 compat)
        var buf = Buffer.concat(chunks.map(function(c) {
          return typeof c === 'string' ? Buffer.from(c, 'utf8') : c;
        }));
        var dest = path.join(publicDir, routePath);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, buf);
        console.log('  ' + routePath + '  (' + buf.length + ' bytes)');
      } catch(e) { console.error('  WRITE ERR ' + routePath + ': ' + e.message); }
      resolve();
    }

    stream.on('data', function(chunk) { chunks.push(chunk); });
    stream.on('error', function(err) { console.error('  STREAM ERR ' + routePath + ': ' + err.message); finish(); });
    stream.on('end', finish);
  });
}

hexo.init().then(function() {
  return hexo.load();
}).then(function() {
  if (fs.existsSync(publicDir)) fs.rmSync(publicDir, { recursive: true });
  var routes = hexo.route.list();
  console.log('Generating ' + routes.length + ' files...\n');
  return routes.reduce(function(promise, r) { return promise.then(function() { return generateOne(r); }); }, Promise.resolve());
}).then(function() {
  console.log('\nDone.');
  hexo.exit();
}).catch(function(err) { console.error('FATAL:', err); process.exit(1); });
