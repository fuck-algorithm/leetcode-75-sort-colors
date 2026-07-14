# 代码面板重构与 Debug 样式增强 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`
> Steps use checkbox (`- [ ]`) syntax.

**Goal:** 修复右侧代码面板样式错乱，将代码面板拆分为可复用的子组件，新增支持 debug 状态展示的变量面板（每一步显示各变量最新值与栈/状态），并增强 Canvas 中指针标注的信息密度（语义说明 + 防重叠）。

**Architecture:** 算法 step 数据（增加 `pointerMeta`）→ Canvas 读取 pointerMeta 绘制带说明的指针标注与分区 → CodePanel 拆分为 CodePanel（容器）+ CodeLine（单行）+ VariablesPanel（debug 变量）三组件，CSS 改用 `pre-wrap` 解决长行溢出 → 用户点击上一步/下一步时，所有面板同步显示当前 step 的变量值与执行状态。复用现有 `AlgorithmStep` 数据结构与最小侵入式扩展，避免引入新状态管理库。

**Tech Stack:** React 18.3, TypeScript 5.6, D3 7.8, Vite 6.4, CSS3（无 UI 框架，纯 CSS Modules 风格的 BEM 类名）

**Risks:**
- T2 修改 `white-space: pre` 为 `pre-wrap` 后，`highlightCode` 生成的 `<span>` 嵌套结构在换行时行号需保持对齐 → 缓解：行号用独立 flex 子项 + `align-self: flex-start`，代码区用 `white-space: pre-wrap; word-break: break-all`
- T5 修改三个算法文件的 steps 生成逻辑，可能遗漏某一步导致 pointerMeta 缺失 → 缓解：pointerMeta 设计为可选字段，Canvas 对缺失值做降级处理；T5 末尾全量回归验证

---

### Task 1: 扩展 AlgorithmStep 类型与指针元数据配置

**Depends on:** None
**Files:**
- Modify: `src/types/index.ts:11-36`
- Modify: `src/algorithms/index.ts:7-11`

- [ ] **Step 1: 扩展 AlgorithmStep 接口以增加 pointerMeta 字段**
文件: `src/types/index.ts:11-36`（替换整个 AlgorithmStep 接口）

```typescript
// 算法步骤
export interface AlgorithmStep {
  // 步骤ID
  id: number;
  // 当前数组状态
  array: Color[];
  // 高亮的代码行（按语言）
  highlightLines: Record<Language, number[]>;
  // 指针位置
  pointers: {
    i?: number;      // 当前遍历位置
    ptr?: number;    // 单指针
    p0?: number;     // 指针p0
    p1?: number;     // 指针p1
    p2?: number;     // 指针p2
  };
  // 变量值
  variables: Record<string, number | string | boolean>;
  // 步骤描述
  description: string;
  // 操作类型
  action: 'init' | 'compare' | 'swap' | 'move' | 'complete';
  // 交换的索引（如果有）
  swapIndices?: [number, number];
  // 比较的索引（如果有）
  compareIndex?: number;
  // 指针语义元数据：键名与 pointers 的键对应，提供人类可读的说明
  pointerMeta?: Record<string, PointerMeta>;
}

/** 单个指针的语义说明元数据 */
export interface PointerMeta {
  /** 指针的完整名称，如 "遍历指针 i" */
  label: string;
  /** 指针的作用说明，如 "当前正在检查的数组位置" */
  hint: string;
  /** 指针在画布上的显示颜色（hex），用于箭头与标签着色 */
  color: string;
  /** 指针指向区域的语义标签，如 "下一个0应放的位置"、"已排序0区右边界" */
  regionLabel?: string;
}
```

- [ ] **Step 2: 在 algorithms/index.ts 增加按算法类型的指针元数据默认配置**
文件: `src/algorithms/index.ts:7-11`（在 algorithms 常量定义之后新增导出常量）

```typescript
// 各算法的指针元数据默认配置：键 = 指针名，值 = PointerMeta
// Canvas 优先使用 step.pointerMeta，缺失时回退到此默认配置
export const pointerMetaConfig: Record<AlgorithmType, Record<string, import('../types').PointerMeta>> = {
  'single-pointer': {
    i: { label: '遍历指针 i', hint: '当前正在检查的数组位置', color: '#ff79c6' },
    ptr: { label: '交换指针 ptr', hint: '下一个 0/1 应放置的位置（已排序区右边界）', color: '#4ecdc4', regionLabel: '已排序区右边界' },
  },
  'double-pointer-p0p1': {
    i: { label: '遍历指针 i', hint: '当前正在检查的数组位置', color: '#ff79c6' },
    p0: { label: '指针 p0', hint: '下一个 0 应放置的位置', color: '#ff6b6b', regionLabel: '0 区右边界' },
    p1: { label: '指针 p1', hint: '下一个 1 应放置的位置', color: '#f0f0f0', regionLabel: '1 区右边界' },
  },
  'double-pointer-p0p2': {
    i: { label: '遍历指针 i', hint: '当前正在检查的数组位置', color: '#ff79c6' },
    p0: { label: '指针 p0', hint: '从左往右，下一个 0 应放置的位置', color: '#ff6b6b', regionLabel: '0 区右边界' },
    p2: { label: '指针 p2', hint: '从右往左，下一个 2 应放置的位置', color: '#4ecdc4', regionLabel: '2 区左边界' },
  },
};
```

- [ ] **Step 3: 验证类型扩展不破坏编译**
Run: `npx tsc -b --noEmit`
Expected:
  - Exit code: 0
  - Output does NOT contain: "error TS"

- [ ] **Step 4: 提交**
Run: `git add src/types/index.ts src/algorithms/index.ts && git commit -m "feat(types): add PointerMeta to AlgorithmStep and default pointer meta config"`

---

### Task 2: 修复代码面板样式溢出并拆分 CodeLine 子组件

**Depends on:** Task 1
**Files:**
- Create: `src/components/CodeLine.tsx`
- Create: `src/styles/CodeLine.css`
- Modify: `src/components/CodePanel.tsx:50-134`
- Modify: `src/styles/CodePanel.css:49-95`

- [ ] **Step 1: 创建 CodeLine 子组件 — 渲染单行代码（行号+语法高亮+行内变量标注）**

```typescript
// src/components/CodeLine.tsx
import { Language } from '../types';
import '../styles/CodeLine.css';

interface CodeLineProps {
  lineNum: number;
  content: string;
  language: Language;
  isHighlighted: boolean;
  /** 行内变量标注，如 "nums[i]=2"；无则为 null */
  inlineVariable: string | null;
}

// 简单的语法高亮（从 CodePanel 迁移，逻辑不变）
const keywordSets: Record<Language, string[]> = {
  java: ['public', 'void', 'int', 'for', 'if', 'else', 'while', 'return', 'new', 'class'],
  python: ['def', 'for', 'if', 'elif', 'else', 'while', 'return', 'in', 'range', 'len'],
  golang: ['func', 'for', 'if', 'else', 'return', 'var', 'int', 'range'],
  javascript: ['function', 'const', 'let', 'var', 'for', 'if', 'else', 'while', 'return'],
};

function highlightCode(code: string, language: Language): string {
  let result = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  result = result.replace(/(\/\/.*$|#.*$)/gm, '<span class="code-comment">$1</span>');
  result = result.replace(/(".*?"|'.*?')/g, '<span class="code-string">$1</span>');
  result = result.replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');

  keywordSets[language].forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    result = result.replace(regex, '<span class="code-keyword">$1</span>');
  });

  return result;
}

export function CodeLine({ lineNum, content, language, isHighlighted, inlineVariable }: CodeLineProps) {
  return (
    <div className={`code-line ${isHighlighted ? 'highlighted' : ''}`}>
      <span className="code-line-number">{lineNum}</span>
      <span
        className="code-line-content"
        dangerouslySetInnerHTML={{ __html: highlightCode(content, language) || '&nbsp;' }}
      />
      {inlineVariable && <span className="code-line-variable">{inlineVariable}</span>}
    </div>
  );
}
```

- [ ] **Step 2: 创建 CodeLine.css — 修复长行溢出，行号与内容对齐**

```css
/* src/styles/CodeLine.css */
.code-line {
  display: flex;
  align-items: flex-start;
  padding: 2px 12px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.6;
  transition: background 0.2s;
}

.code-line.highlighted {
  background: rgba(78, 205, 196, 0.15);
}

.code-line-number {
  width: 28px;
  flex-shrink: 0;
  color: #4a4a6a;
  text-align: right;
  padding-right: 10px;
  user-select: none;
}

.code-line.highlighted .code-line-number {
  color: #4ecdc4;
}

/* 关键修复：pre-wrap 让长行换行，word-break 兜底防止超长 token 撑破容器 */
.code-line-content {
  flex: 1;
  min-width: 0;
  color: #e0e0e0;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: anywhere;
}

.code-line-variable {
  flex-shrink: 0;
  margin-left: 8px;
  padding: 1px 6px;
  background: rgba(255, 215, 0, 0.15);
  border-radius: 3px;
  color: #ffd700;
  font-size: 11px;
  white-space: nowrap;
}

/* 语法高亮颜色 */
.code-keyword { color: #ff79c6; }
.code-number { color: #bd93f9; }
.code-string { color: #f1fa8c; }
.code-comment { color: #6272a4; font-style: italic; }
```

- [ ] **Step 3: 重构 CodePanel 使用 CodeLine 子组件**
文件: `src/components/CodePanel.tsx:50-134`（替换整个组件函数体，保留 import 区与 highlightCode 已迁移走，删除旧的 highlightCode/getVariableForLine）

```typescript
// src/components/CodePanel.tsx
import { useEffect, useState } from 'react';
import { Language, AlgorithmStep, AlgorithmInfo } from '../types';
import { getLanguage, saveLanguage } from '../utils/indexedDB';
import { CodeLine } from './CodeLine';
import { VariablesPanel } from './VariablesPanel';
import '../styles/CodePanel.css';

interface CodePanelProps {
  algorithmInfo: AlgorithmInfo;
  step: AlgorithmStep;
}

const languages: { key: Language; label: string }[] = [
  { key: 'java', label: 'Java' },
  { key: 'python', label: 'Python' },
  { key: 'golang', label: 'Go' },
  { key: 'javascript', label: 'JS' },
];

export function CodePanel({ algorithmInfo, step }: CodePanelProps) {
  const [language, setLanguage] = useState<Language>('java');

  useEffect(() => {
    getLanguage().then(setLanguage);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    saveLanguage(lang);
  };

  const code = algorithmInfo.code[language];
  const lines = code.split('\n');
  const highlightedLines = step.highlightLines[language] || [];

  // 获取高亮行的行内变量标注
  const getInlineVariable = (lineNum: number): string | null => {
    const variables = step.variables;
    if (!variables) return null;
    const line = lines[lineNum - 1] || '';
    for (const [name, value] of Object.entries(variables)) {
      if (line.includes(name) && typeof value !== 'object') {
        return `${name}=${value}`;
      }
    }
    return null;
  };

  return (
    <div className="code-panel">
      <div className="code-header">
        <span className="code-title">算法代码</span>
        <div className="language-tabs">
          {languages.map(({ key, label }) => (
            <button
              key={key}
              className={`language-tab ${language === key ? 'active' : ''}`}
              onClick={() => handleLanguageChange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="code-content">
        {lines.map((line, index) => {
          const lineNum = index + 1;
          const isHighlighted = highlightedLines.includes(lineNum);
          return (
            <CodeLine
              key={index}
              lineNum={lineNum}
              content={line}
              language={language}
              isHighlighted={isHighlighted}
              inlineVariable={isHighlighted ? getInlineVariable(lineNum) : null}
            />
          );
        })}
      </div>

      <VariablesPanel step={step} />
    </div>
  );
}
```

- [ ] **Step 4: 清理 CodePanel.css 中已迁移到 CodeLine.css 的规则并修复容器溢出**
文件: `src/styles/CodePanel.css:49-95`（删除 .code-line / .code-line-number / .code-line-content / .code-line-variable 及语法高亮规则，保留并修正 .code-content 溢出控制）

```css
/* src/styles/CodePanel.css */
.code-panel {
  width: 380px;
  display: flex;
  flex-direction: column;
  background: rgba(26, 26, 46, 0.95);
  border-left: 1px solid #2a2a4a;
  overflow: hidden;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #2a2a4a;
  flex-shrink: 0;
}

.code-title {
  font-size: 13px;
  font-weight: 500;
  color: #e0e0e0;
}

.language-tabs {
  display: flex;
  gap: 2px;
}

.language-tab {
  padding: 4px 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #6a6a8a;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.language-tab:hover {
  color: #a0a0a0;
}

.language-tab.active {
  background: rgba(78, 205, 196, 0.15);
  border-color: #4ecdc4;
  color: #4ecdc4;
}

/* 关键修复：min-width:0 让 flex 子项可收缩，overflow-x:hidden 防止整体撑破 */
.code-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 0;
}
```

- [ ] **Step 5: 验证代码面板溢出已修复**
Run: `npm run build`
Expected:
  - Exit code: 0
  - Output contains: "built in"
  - Output does NOT contain: "error"

- [ ] **Step 6: 提交**
Run: `git add src/components/CodeLine.tsx src/styles/CodeLine.css src/components/CodePanel.tsx src/styles/CodePanel.css && git commit -m "fix(codepanel): resolve code line overflow with pre-wrap and extract CodeLine component"`

---

### Task 3: 创建独立 VariablesPanel 组件并增强 debug 信息密度

**Depends on:** Task 1
**Files:**
- Create: `src/components/VariablesPanel.tsx`
- Create: `src/styles/VariablesPanel.css`
- Modify: `src/styles/CodePanel.css`（删除已迁移的 .variables-panel 规则，本 Task Step 4 处理）

- [ ] **Step 1: 创建 VariablesPanel 组件 — 分区展示标量变量、数组快照、指针状态**

```typescript
// src/components/VariablesPanel.tsx
import { AlgorithmStep, Color } from '../types';
import '../styles/VariablesPanel.css';

interface VariablesPanelProps {
  step: AlgorithmStep;
}

const colorNames: Record<Color, string> = {
  0: '红',
  1: '白',
  2: '蓝',
};

const actionLabels: Record<AlgorithmStep['action'], string> = {
  init: '初始化',
  compare: '比较',
  swap: '交换',
  move: '移动指针',
  complete: '完成',
};

export function VariablesPanel({ step }: VariablesPanelProps) {
  // 标量变量：过滤掉对象，按名称稳定排序
  const scalarVars = Object.entries(step.variables)
    .filter(([, v]) => typeof v !== 'object')
    .map(([name, value]) => ({ name, value }));

  // 指针状态
  const pointerEntries = Object.entries(step.pointers).filter(
    ([, v]) => v !== undefined,
  ) as [string, number][];

  // action 标签
  const actionLabel = actionLabels[step.action] || step.action;

  return (
    <div className="variables-panel">
      <div className="variables-panel-header">
        <span className="variables-title">调试状态</span>
        <span className={`variables-action action-${step.action}`}>{actionLabel}</span>
      </div>

      {/* 标量变量区 */}
      {scalarVars.length > 0 && (
        <div className="variables-section">
          <div className="variables-section-title">变量</div>
          <div className="variables-grid">
            {scalarVars.map(({ name, value }) => (
              <div key={name} className="variable-item">
                <span className="variable-name">{name}</span>
                <span className="variable-value">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 指针状态区 */}
      {pointerEntries.length > 0 && (
        <div className="variables-section">
          <div className="variables-section-title">指针</div>
          <div className="variables-grid">
            {pointerEntries.map(([name, idx]) => (
              <div key={name} className="variable-item pointer-item">
                <span className="variable-name">{name}</span>
                <span className="variable-value">
                  →[{idx}]
                  {step.array[idx] !== undefined ? ` = ${step.array[idx]}(${colorNames[step.array[idx] as Color]})` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 数组快照区 */}
      <div className="variables-section">
        <div className="variables-section-title">数组快照</div>
        <div className="array-snapshot">
          {step.array.map((c, i) => {
            const isCompare = step.compareIndex === i;
            const isSwap = step.swapIndices?.includes(i);
            return (
              <span
                key={i}
                className={`snapshot-cell color-${c} ${isCompare ? 'snapshot-compare' : ''} ${isSwap ? 'snapshot-swap' : ''}`}
                title={`索引 ${i}: 值 ${c} (${colorNames[c]})`}
              >
                {c}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 VariablesPanel.css — 分区布局与数组快照样式**

```css
/* src/styles/VariablesPanel.css */
.variables-panel {
  padding: 10px 12px;
  border-top: 1px solid #2a2a4a;
  background: rgba(15, 15, 26, 0.5);
  flex-shrink: 0;
  max-height: 45%;
  overflow-y: auto;
}

.variables-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.variables-title {
  font-size: 12px;
  font-weight: 600;
  color: #a0a0c0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.variables-action {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(78, 205, 196, 0.15);
  color: #4ecdc4;
}

.variables-action.action-swap { background: rgba(255, 215, 0, 0.15); color: #ffd700; }
.variables-action.action-compare { background: rgba(255, 121, 198, 0.15); color: #ff79c6; }
.variables-action.action-complete { background: rgba(80, 250, 123, 0.15); color: #50fa7b; }

.variables-section {
  margin-bottom: 10px;
}

.variables-section-title {
  font-size: 11px;
  color: #6a6a8a;
  margin-bottom: 6px;
}

.variables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
  gap: 6px;
}

.variable-item {
  display: flex;
  flex-direction: column;
  padding: 5px 8px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid #3a3a5a;
  border-radius: 4px;
}

.variable-name {
  font-size: 11px;
  color: #6a6a8a;
}

.variable-value {
  font-size: 13px;
  color: #4ecdc4;
  font-family: 'Monaco', 'Menlo', monospace;
  word-break: break-all;
}

.pointer-item {
  border-color: rgba(255, 121, 198, 0.4);
}

/* 数组快照 */
.array-snapshot {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.snapshot-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  font-family: 'Monaco', monospace;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.snapshot-cell.color-0 { background: #ff6b6b; color: #fff; }
.snapshot-cell.color-1 { background: #f0f0f0; color: #1a1a2e; }
.snapshot-cell.color-2 { background: #4ecdc4; color: #fff; }

.snapshot-cell.snapshot-compare {
  outline: 2px solid #ff79c6;
  outline-offset: 1px;
}

.snapshot-cell.snapshot-swap {
  outline: 2px solid #ffd700;
  outline-offset: 1px;
}
```

- [ ] **Step 3: 从 CodePanel.css 删除已迁移到 VariablesPanel.css 的 .variables-panel 规则**
文件: `src/styles/CodePanel.css`（删除文件末尾从 `.variables-panel {` 到 `.variable-value { ... }` 结束的全部规则块，即原 127-163 行内容；这些样式已由 VariablesPanel.css 提供）

删除以下完整规则块（若 Task 2 Step 4 已替换过文件，则在当前文件末尾查找并删除）：

```css
.variables-panel { ... }
.variables-title { ... }
.variables-grid { ... }
.variable-item { ... }
.variable-name { ... }
.variable-value { ... }
```

- [ ] **Step 4: 验证变量面板渲染**
Run: `npm run build`
Expected:
  - Exit code: 0
  - Output contains: "built in"

- [ ] **Step 5: 提交**
Run: `git add src/components/VariablesPanel.tsx src/styles/VariablesPanel.css src/styles/CodePanel.css && git commit -m "feat(codepanel): add standalone VariablesPanel with debug sections and array snapshot"`

---

### Task 4: 增强 Canvas 指针标注信息密度与防重叠

**Depends on:** Task 1
**Files:**
- Modify: `src/components/Canvas.tsx:1-4`（新增 import）
- Modify: `src/components/Canvas.tsx:156-253`（替换指针绘制与区域标注逻辑）

- [ ] **Step 1: 在 Canvas.tsx 引入 pointerMetaConfig 与 PointerMeta 类型**
文件: `src/components/Canvas.tsx:1-4`（在现有 import 后新增两行）

```typescript
import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { AlgorithmStep, Color, AlgorithmType, PointerMeta } from '../types';
import { pointerMetaConfig } from '../algorithms';
import '../styles/Canvas.css';
```

注：Canvas 当前未接收 `algorithmType` prop，需在 Step 2 中通过 step 数据推断，或在 App.tsx 传入。本 Task 采用从 props 传入的方式，需同步修改 CanvasProps。

- [ ] **Step 2: 给 Canvas 增加 algorithmType prop 并更新 App.tsx 传参**
文件: `src/components/Canvas.tsx:6-8`（替换 CanvasProps 接口）

```typescript
interface CanvasProps {
  step: AlgorithmStep;
  algorithmType: AlgorithmType;
}
```

文件: `src/components/Canvas.tsx:23`（替换函数签名）

```typescript
export function Canvas({ step, algorithmType }: CanvasProps) {
```

文件: `src/App.tsx:117`（替换 Canvas 调用）

```tsx
          <Canvas step={currentStepData} algorithmType={algorithmType} />
```

- [ ] **Step 3: 重写指针绘制逻辑 — 带 label+hint 的标注 + 防重叠垂直堆叠**
文件: `src/components/Canvas.tsx:156-197`（替换原"绘制指针"区块，从 `const pointerY = ...` 到 `Object.entries(pointers).forEach` 结束）

```typescript
    // 绘制指针：每个指针带 label + hint，垂直堆叠防重叠
    const pointerBaseY = startY + cellHeight + 50;
    const pointers = step.pointers;
    const metaDefaults = pointerMetaConfig[algorithmType] || {};

    // 收集要绘制的指针，按索引排序后分配层级（防重叠）
    const pointerList = Object.entries(pointers)
      .filter(([, v]) => v !== undefined && v >= 0 && v < n)
      .map(([key, value]) => ({
        key,
        value: value as number,
        meta: step.pointerMeta?.[key] || metaDefaults[key] || {
          label: key,
          hint: '',
          color: '#4ecdc4',
        } as PointerMeta,
      }))
      .sort((a, b) => a.value - b.value);

    // 按位置分组：同一列的指针垂直堆叠，不同列尽量分行
    const colStacks = new Map<number, number>();
    pointerList.forEach((p) => {
      const stackLevel = colStacks.get(p.value) || 0;
      const pointerY = pointerBaseY + stackLevel * 38;
      colStacks.set(p.value, stackLevel + 1);

      const x = startX + p.value * (cellWidth + gap) + cellWidth / 2;
      const color = p.meta.color;

      // 箭头
      g.append('path')
        .attr('d', `M ${x} ${pointerY - 15} L ${x - 7} ${pointerY} L ${x + 7} ${pointerY} Z`)
        .attr('fill', color);

      // 标签（含语义名称）
      g.append('text')
        .attr('x', x)
        .attr('y', pointerY + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', color)
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .text(p.meta.label);

      // 作用说明（hint），位于标签下方，较小字号
      if (p.meta.hint) {
        g.append('text')
          .attr('x', x)
          .attr('y', pointerY + 28)
          .attr('text-anchor', 'middle')
          .attr('fill', 'rgba(160, 160, 192, 0.8)')
          .attr('font-size', '10px')
          .text(p.meta.hint);
      }
    });
```

- [ ] **Step 4: 增强区域标注 — 基于 pointerMeta.regionLabel 绘制分区框**
文件: `src/components/Canvas.tsx:227-253`（替换原"绘制区域标注"区块）

```typescript
    // 绘制区域标注：基于 pointerMeta.regionLabel
    const regionKeys: Array<{ key: string; side: 'left' | 'right' }> = [
      { key: 'p0', side: 'left' },
      { key: 'ptr', side: 'left' },
      { key: 'p1', side: 'left' },
      { key: 'p2', side: 'right' },
    ];

    const regionY = startY + cellHeight + 75;
    regionKeys.forEach(({ key, side }) => {
      const idx = pointers[key as keyof typeof pointers];
      const meta = step.pointerMeta?.[key] || metaDefaults[key];
      if (idx === undefined || !meta || !meta.regionLabel) return;

      let regionX: number;
      let regionW: number;
      if (side === 'left') {
        // 左侧分区：从数组起点到 idx
        if (idx <= 0) return;
        regionX = startX - 5;
        regionW = idx * (cellWidth + gap) - gap + 10;
      } else {
        // 右侧分区：从 idx 到数组末尾
        if (idx >= n - 1) return;
        regionX = startX + idx * (cellWidth + gap) - gap / 2;
        regionW = (n - idx) * (cellWidth + gap) - gap + 10;
      }

      g.append('rect')
        .attr('x', regionX)
        .attr('y', startY - 5)
        .attr('width', regionW)
        .attr('height', cellHeight + 10)
        .attr('rx', 10)
        .attr('fill', 'none')
        .attr('stroke', meta.color)
        .attr('stroke-opacity', 0.35)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      g.append('text')
        .attr('x', regionX + regionW / 2)
        .attr('y', regionY)
        .attr('text-anchor', 'middle')
        .attr('fill', meta.color)
        .attr('fill-opacity', 0.75)
        .attr('font-size', '11px')
        .text(meta.regionLabel);
    });
```

- [ ] **Step 5: 验证 Canvas 编译通过**
Run: `npx tsc -b --noEmit`
Expected:
  - Exit code: 0
  - Output does NOT contain: "error TS"

- [ ] **Step 6: 提交**
Run: `git add src/components/Canvas.tsx src/App.tsx && git commit -m "feat(canvas): enrich pointer labels with semantic hints and anti-overlap stacking"`

---

### Task 5: 算法 steps 接入 pointerMeta 并全量验证

**Depends on:** Task 1, Task 2, Task 3, Task 4
**Files:**
- Modify: `src/algorithms/singlePointer.ts`（init 步骤增加 pointerMeta）
- Modify: `src/algorithms/doublePointerP0P1.ts`（init 步骤增加 pointerMeta）
- Modify: `src/algorithms/doublePointerP0P2.ts`（init 步骤增加 pointerMeta）

- [ ] **Step 1: 给 singlePointer 的 init 步骤增加 pointerMeta**
文件: `src/algorithms/singlePointer.ts:91-99`（在 init 步骤对象内新增 pointerMeta 字段）

在 `pointers: { ptr: 0 },` 行之后、`variables: {...}` 之前插入：

```typescript
    pointerMeta: {
      ptr: { label: '交换指针 ptr', hint: '已排序区右边界', color: '#4ecdc4', regionLabel: '已排序区' },
    },
```

- [ ] **Step 2: 给 doublePointerP0P1 的 init 步骤增加 pointerMeta**
文件: `src/algorithms/doublePointerP0P1.ts:88-96`（在 init 步骤对象内新增 pointerMeta 字段）

在 `pointers: { p0: 0, p1: 0 },` 行之后、`variables: {...}` 之前插入：

```typescript
    pointerMeta: {
      p0: { label: '指针 p0', hint: '0 区右边界', color: '#ff6b6b', regionLabel: '0 区' },
      p1: { label: '指针 p1', hint: '1 区右边界', color: '#f0f0f0', regionLabel: '1 区' },
    },
```

- [ ] **Step 3: 给 doublePointerP0P2 的 init 步骤增加 pointerMeta**
文件: `src/algorithms/doublePointerP0P2.ts:78-86`（在 init 步骤对象内新增 pointerMeta 字段）

在 `pointers: { p0: 0, p2: n - 1 },` 行之后、`variables: {...}` 之前插入：

```typescript
    pointerMeta: {
      p0: { label: '指针 p0', hint: '0 区右边界', color: '#ff6b6b', regionLabel: '0 区' },
      p2: { label: '指针 p2', hint: '2 区左边界', color: '#4ecdc4', regionLabel: '2 区' },
    },
```

- [ ] **Step 4: 全量构建验证**
Run: `npm run build`
Expected:
  - Exit code: 0
  - Output contains: "built in"
  - Output does NOT contain: "error"

- [ ] **Step 5: 启动 dev server 并用 Playwright 验证三项核心修复**
Run: `npm run dev &` 然后将以下脚本写入 `/tmp/verify.cjs` 并执行 `node /tmp/verify.cjs`：

```javascript
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:54321/leetcode-75-sort-colors/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const cc = document.querySelector('.code-content');
    const cp = document.querySelector('.code-panel');
    return {
      overflowFixed: cc ? cc.scrollWidth <= cc.offsetWidth + 2 : false,
      codeContentW: cc && cc.offsetWidth,
      codeContentScrollW: cc && cc.scrollWidth,
      hasVariablesPanel: !!document.querySelector('.variables-panel'),
      hasArraySnapshot: !!document.querySelector('.array-snapshot'),
      hasActionLabel: !!document.querySelector('.variables-action'),
    };
  });
  // 切换 p0p2 检查指针 hint
  const tabs = await p.$$('.algorithm-tab');
  if (tabs[2]) await tabs[2].click();
  await p.waitForTimeout(500);
  const svgTexts = await p.evaluate(() => Array.from(document.querySelectorAll('.canvas-svg text')).map(t => t.textContent));
  console.log(JSON.stringify({ ...r, svgHasHint: svgTexts.some(t => t.includes('边界') || t.includes('位置')) }));
  await b.close();
})();
```

Expected:
  - Exit code: 0
  - Output JSON `overflowFixed` 为 `true`
  - Output JSON `hasVariablesPanel`, `hasArraySnapshot`, `hasActionLabel` 均为 `true`
  - Output JSON `svgHasHint` 为 `true`

- [ ] **Step 6: 提交**
Run: `git add src/algorithms/singlePointer.ts src/algorithms/doublePointerP0P1.ts src/algorithms/doublePointerP0P2.ts && git commit -m "feat(algorithms): attach pointerMeta to init steps for richer canvas annotations"`
