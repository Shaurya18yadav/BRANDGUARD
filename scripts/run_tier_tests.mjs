import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const entry = resolve(__dirname, 'test_tier2_tier3_extensions.ts');
const outDir = resolve(__dirname, '../dist-test2');

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

await import('../dist-test2/test_bundle.mjs');

