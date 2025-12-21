import { useState, useCallback } from 'react';
import { Color } from '../types';
import { validateInput, generateRandomArray, EXAMPLE_DATA } from '../utils/validation';
import '../styles/InputPanel.css';

interface InputPanelProps {
  onApply: (data: Color[]) => void;
  currentData: Color[];
}

export function InputPanel({ onApply, currentData }: InputPanelProps) {
  const [inputValue, setInputValue] = useState(JSON.stringify(currentData));
  const [error, setError] = useState<string | null>(null);
  const [activeExample, setActiveExample] = useState<number | null>(null);

  const handleApply = useCallback(() => {
    const result = validateInput(inputValue);
    if (result.valid && result.data) {
      setError(null);
      setActiveExample(null);
      onApply(result.data);
    } else {
      setError(result.error || '输入无效');
    }
  }, [inputValue, onApply]);

  const handleExampleClick = useCallback((index: number) => {
    const example = EXAMPLE_DATA[index];
    setInputValue(JSON.stringify(example.data));
    setError(null);
    setActiveExample(index);
    onApply(example.data);
  }, [onApply]);

  const handleRandom = useCallback(() => {
    const data = generateRandomArray();
    setInputValue(JSON.stringify(data));
    setError(null);
    setActiveExample(null);
    onApply(data);
  }, [onApply]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  }, [handleApply]);

  return (
    <div className="input-panel">
      <div className="input-group">
        <span className="input-label">输入数组：</span>
        <input
          type="text"
          className={`input-field ${error ? 'error' : ''}`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="例如：[2,0,2,1,1,0] 或 2,0,1"
        />
        <button className="apply-btn" onClick={handleApply}>
          应用
        </button>
      </div>

      <div className="examples-group">
        <span className="input-label">示例：</span>
        {EXAMPLE_DATA.map((example, index) => (
          <button
            key={index}
            className={`example-btn ${activeExample === index ? 'active' : ''}`}
            onClick={() => handleExampleClick(index)}
          >
            {example.label}
          </button>
        ))}
        <button className="random-btn" onClick={handleRandom}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          随机
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
