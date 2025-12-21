import { AlgorithmType } from '../types';
import { algorithms } from '../algorithms';
import '../styles/AlgorithmTabs.css';

interface AlgorithmTabsProps {
  activeAlgorithm: AlgorithmType;
  onAlgorithmChange: (type: AlgorithmType) => void;
}

const algorithmTypes: AlgorithmType[] = ['single-pointer', 'double-pointer-p0p1', 'double-pointer-p0p2'];

export function AlgorithmTabs({ activeAlgorithm, onAlgorithmChange }: AlgorithmTabsProps) {
  return (
    <div className="algorithm-tabs">
      {algorithmTypes.map((type) => {
        const info = algorithms[type];
        return (
          <button
            key={type}
            className={`algorithm-tab ${activeAlgorithm === type ? 'active' : ''}`}
            onClick={() => onAlgorithmChange(type)}
          >
            <div className="algorithm-tab-info">
              <span className="algorithm-tab-name">{info.name}</span>
              <span className="algorithm-tab-complexity">
                时间 {info.timeComplexity} | 空间 {info.spaceComplexity}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
