import { AlgorithmStep, Color } from '../types';
import { getHeapCells, getStackLocals } from '../utils/debuggerMemory';
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
  const scalarVars = getStackLocals(step.variables);
  const heapCells = getHeapCells(step.array);

  const pointerEntries = Object.entries(step.pointers).filter(
    ([, value]) => value !== undefined,
  ) as [string, number][];
  const actionLabel = actionLabels[step.action] || step.action;

  return (
    <div className="variables-panel">
      <div className="variables-panel-header">
        <span className="variables-title">调试器</span>
        <span className={`variables-action action-${step.action}`}>{actionLabel}</span>
      </div>

      <section className="debug-section" aria-label="调用栈">
        <div className="debug-section-title">
          <span>调用栈</span>
          <span className="debug-section-meta">1 frame</span>
        </div>
        <div className="stack-frame">
          <div className="stack-frame-header">
            <span className="stack-frame-name">sortColors(…)</span>
            <span className="stack-frame-location">step {step.id}</span>
          </div>
          <div className="stack-frame-body">
            <div className="memory-row memory-row-heading">
              <span>地址</span><span>局部变量</span><span>值</span>
            </div>
            {scalarVars.length > 0 ? scalarVars.map(({ name, value, address }) => (
              <div key={name} className="memory-row">
                <span className="memory-address">{address}</span>
                <span className="memory-name">{name}</span>
                <span className="memory-value">{String(value)}</span>
              </div>
            )) : <div className="debug-empty">当前步骤没有局部变量</div>}
          </div>
        </div>
      </section>

      {pointerEntries.length > 0 && (
        <section className="debug-section" aria-label="指针状态">
          <div className="debug-section-title"><span>指针</span></div>
          <div className="variables-grid">
            {pointerEntries.map(([name, index]) => {
              const cell = step.array[index];
              return (
                <div key={name} className="variable-item pointer-item">
                  <span className="variable-name">{name}</span>
                  <span className="variable-value">
                    → [{index}]{cell !== undefined ? ` = ${cell} (${colorNames[cell]})` : ' (越界)'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="debug-section heap-section" aria-label="堆内存数组">
        <div className="debug-section-title">
          <span>堆内存 · nums</span>
          <span className="debug-section-meta">0x1000 · {step.array.length} 项</span>
        </div>
        <div className="heap-array" role="list" aria-label="nums 数组快照">
          {heapCells.map(({ value, index, address }) => {
            const isCompare = step.compareIndex === index;
            const isSwap = step.swapIndices?.includes(index);
            return (
              <div
                key={index}
                role="listitem"
                className={`heap-cell color-${value} ${isCompare ? 'heap-cell-compare' : ''} ${isSwap ? 'heap-cell-swap' : ''}`}
                title={`nums[${index}] @ ${address} = ${value} (${colorNames[value]})`}
              >
                <span className="heap-cell-index">[{index}]</span>
                <span className="heap-cell-value">{value}</span>
                <span className="heap-cell-address">{address}</span>
              </div>
            );
          })}
        </div>
        <div className="memory-note">地址为可视化示意值；数组快照随当前执行步骤更新</div>
      </section>
    </div>
  );
}
