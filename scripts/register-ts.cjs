// Run the real TypeScript engine with the repository's installed compiler; no downloaded test runtime.
const { registerHooks } = require('node:module');
const { readFileSync, existsSync } = require('node:fs');
const { resolve, extname } = require('node:path');
const { pathToFileURL, fileURLToPath } = require('node:url');
const ts = require('typescript');
registerHooks({
  resolve(specifier, context, next) {
    let url;
    if (specifier.startsWith('@/')) url = pathToFileURL(resolve(specifier.slice(2))).href;
    else if (specifier.startsWith('.') && context.parentURL) url = new URL(specifier, context.parentURL).href;
    if (url?.startsWith('file:') && !extname(fileURLToPath(url))) {
      for (const suffix of ['.ts', '.tsx', '/index.ts']) if (existsSync(fileURLToPath(url + suffix))) return next(url + suffix, context);
    }
    return next(url ?? specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith('file:') && /\.(ts|tsx)$/.test(url)) return { format: 'module', shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText };
    if (url.startsWith('file:') && url.endsWith('.json') && !url.includes('node_modules')) return { format: 'module', shortCircuit: true, source: `export default ${readFileSync(fileURLToPath(url), 'utf8')}` };
    return next(url, context);
  },
});
