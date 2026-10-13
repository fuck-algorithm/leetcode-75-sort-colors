const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

function loadMemoryModel() {
  const source = fs.readFileSync(path.join(__dirname, '../src/utils/debuggerMemory.ts'), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', compiled)(module, module.exports);
  return module.exports;
}

test('builds stack locals from each algorithm step and omits expression pseudo-variables', () => {
  const { getStackLocals } = loadMemoryModel();
  const locals = getStackLocals({ n: 3, p0: 1, i: 2, 'nums[i]': 0, 'p0 < p1': false, phase: '遍历中' });

  assert.deepEqual(locals.map(({ name, value }) => [name, value]), [
    ['n', 3], ['p0', 1], ['i', 2], ['phase', '遍历中'],
  ]);
  assert.equal(locals[0].address, '0x7fff0000');
  assert.equal(locals[1].address, '0x7fff0010');
});

test('maps heap array cells to stable illustrative addresses', () => {
  const { getHeapCells } = loadMemoryModel();
  assert.deepEqual(getHeapCells([2, 0, 1]), [
    { index: 0, value: 2, address: '0x1000' },
    { index: 1, value: 0, address: '0x1004' },
    { index: 2, value: 1, address: '0x1008' },
  ]);
});
