import { defineConfig } from 'vite';
import { existsSync, statSync, createReadStream } from 'fs';
import { join, resolve, extname } from 'path';

const MIME_TYPES = {
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
  '.html': 'text/html',
  '.data': 'application/octet-stream',
};

function serveFromNodeModules(urlPrefix, pkgDir) {
  const root = resolve(process.cwd(), pkgDir);
  return {
    name: `serve-node-modules:${urlPrefix}`,
    // Handles Vite's internal module pipeline (e.g. <script type="module" src="/pyscript/core.js">)
    resolveId(source) {
      if (source === urlPrefix || source.startsWith(urlPrefix + '/')) {
        const relative = source.slice(urlPrefix.length).replace(/^\//, '');
        const filePath = join(root, relative);
        if (existsSync(filePath) && statSync(filePath).isFile()) {
          return { id: filePath };
        }
      }
    },
    // Handles direct browser fetches for non-JS assets (css, wasm, data, …)
    configureServer(server) {
      server.middlewares.use(urlPrefix, (req, res, next) => {
        const filePath = join(root, req.url.split('?')[0]);
        if (existsSync(filePath) && statSync(filePath).isFile()) {
          res.setHeader('Content-Type', MIME_TYPES[extname(filePath)] ?? 'application/octet-stream');
          createReadStream(filePath).pipe(res);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    serveFromNodeModules('/pyscript', 'node_modules/@pyscript/core/dist'),
    serveFromNodeModules('/pyodide',  'node_modules/pyodide'),
  ],
});
