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
