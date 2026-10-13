const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const componentPath = path.join(__dirname, '../src/components/CodeLine.tsx');

function loadHighlighter() {
  const source = fs.readFileSync(componentPath, 'utf8');
  const start = source.indexOf('const keywordSets:');
  const end = source.indexOf('\nexport function CodeLine', start);
  assert.notEqual(start, -1, 'CodeLine must define keywordSets');
  assert.notEqual(end, -1, 'highlightCode must end before CodeLine component');
  const compiled = ts.transpileModule(source.slice(start, end), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', `${compiled}\nmodule.exports = highlightCode;`)(module, module.exports);
  return module.exports;
}

test('highlights Java keywords without corrupting generated span attributes', () => {
  const html = loadHighlighter()('public class Sorter { int value = 2; }', 'java');

  assert.match(html, /<span class="code-keyword">public<\/span>/);
  assert.match(html, /<span class="code-keyword">class<\/span>/);
  assert.doesNotMatch(html, /<span\s+<span/);
  assert.doesNotMatch(html, /class<\/span>="code-keyword"/);
});

test('does not highlight keywords inside strings or comments and escapes source markup', () => {
  const html = loadHighlighter()('String text = "class <T>"; // class & safe', 'java');

  assert.match(html, /<span class="code-string">"class &lt;T&gt;"<\/span>/);
  assert.match(html, /<span class="code-comment">\/\/ class &amp; safe<\/span>/);
  assert.doesNotMatch(html, /<span class="code-keyword">class<\/span>/);
});
