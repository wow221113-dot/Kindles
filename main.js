const { app, BrowserWindow, shell, session } = require('electron');
const fs = require('fs'), path = require('path'), http = require('http');
// Kindle's own files live inside this app and are served locally, so the .exe does not need the GitHub website.
const FILES = { 'index.html': 'text/html; charset=utf-8', 'manifest.webmanifest': 'application/manifest+json', 'sw.js': 'text/javascript', 'icon-192.png': 'image/png', 'icon-512.png': 'image/png', 'icon-maskable-512.png': 'image/png' };
function serve(port) {
  return new Promise((resolve, reject) => {
    const s = http.createServer((q, r) => {
      let name = decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
      if (!FILES[name]) { r.writeHead(404); return r.end('Not found'); }
      r.writeHead(200, { 'Content-Type': FILES[name] });
      fs.createReadStream(path.join(__dirname, name)).pipe(r);
    });
    s.once('error', reject);
    s.listen(port, '127.0.0.1', () => resolve(s.address().port));
  });
}
async function startServer() {
  let port;
  try { port = await serve(47821); } catch (e) { port = await serve(0); }
  return 'http://localhost:' + port + '/';
}
async function make() {
  const w = new BrowserWindow({ width: 1200, height: 800, backgroundColor: '#1c1613', autoHideMenuBar: true, icon: path.join(__dirname, 'icon-512.png'), title: 'Kindle' });
  w.setMenuBarVisibility(false);
  w.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  w.loadURL(await startServer());
}
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(perm === 'media'));
  make();
});
app.on('window-all-closed', () => app.quit());
