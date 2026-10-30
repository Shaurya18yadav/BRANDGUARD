import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const entry = resolve(__dirname, 'test_architecture_verification.ts');
const outDir = resolve(__dirname, '../dist-test');

console.log('Compiling verification suite with Vite...');

await build({
  build: {
    ssr: entry,
    outDir,
    emptyOutDir: true,
    target: 'node20',
    rollupOptions: {
      output: {
        entryFileNames: 'test_bundle.mjs',
        format: 'esm',
      },
    },
  },
  logLevel: 'warn',
});

console.log('Running compiled architectural test suite...\n');
await import('../dist-test/test_bundle.mjs');

