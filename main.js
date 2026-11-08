const { app, BrowserWindow, shell, session } = require('electron');
const fs = require('fs'), path = require('path');
const url = fs.readFileSync(path.join(__dirname, 'app-url.txt'), 'utf8').split(/\r?\n/)[0].trim();
function make() {
  const w = new BrowserWindow({ width: 1200, height: 800, backgroundColor: '#1c1613', autoHideMenuBar: true, icon: path.join(__dirname, 'icon-512.png'), title: 'Kindle' });
  w.setMenuBarVisibility(false);
  w.loadURL(url);
  w.webContents.setWindowOpenHandler(({ url: u }) => { shell.openExternal(u); return { action: 'deny' }; });
}
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(perm === 'media'));
  make();
});
app.on('window-all-closed', () => app.quit());
