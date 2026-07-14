import { AlgorithmStep } from '../types';
// 临时占位，Task 3 会替换为完整 debug 变量面板
export function VariablesPanel({ step }: { step: AlgorithmStep }) {
  return (
    <div className="variables-panel">
      <div className="variables-title">当前变量</div>
      <div className="variables-grid">
        {Object.entries(step.variables).map(([name, value]) => (
          <div key={name} className="variable-item">
            <span className="variable-name">{name}</span>
            <span className="variable-value">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
