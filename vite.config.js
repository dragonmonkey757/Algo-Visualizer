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

export default defineConfig({
});
