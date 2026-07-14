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
