// Evaluate window.dumpCues() of a film page and write films/<film>/dump.json  (node tools/dump.mjs 02-line-art)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import puppeteer from '/home/user/mg-styles-15/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
const ROOT = process.env.MG_ROOT || '/home/user/mg-styles-15', film = process.argv[2];
const srv = http.createServer((q, r) => { let p = path.join(ROOT, decodeURIComponent(new URL(q.url, 'http://x').pathname)); if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p += '/index.html';
  if (!fs.existsSync(p)) { r.writeHead(404); return r.end(); } const ext = path.extname(p); r.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json' }[ext] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
await new Promise((r) => srv.listen(0, r));
const b = await puppeteer.launch({ executablePath: process.env.MG_CHROME, headless: true, args: (process.env.MG_GPU_ARGS || '').split(' ').filter(Boolean) });
const pg = await b.newPage(); pg.on('pageerror', (e) => console.log('page error', e.message));
await pg.goto(`http://127.0.0.1:${srv.address().port}/dux/films/${film}/index.html`); await pg.waitForFunction('window.__ready === true', { timeout: 60000 });
const d = await pg.evaluate(() => window.dumpCues());
fs.writeFileSync(path.join(ROOT, 'dux/films', film, 'dump.json'), JSON.stringify(d)); console.log('dump.json', Object.keys(d));
await b.close(); srv.close();
