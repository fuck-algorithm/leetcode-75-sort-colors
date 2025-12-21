import { useEffect, useState } from 'react';
import { Language, AlgorithmStep, AlgorithmInfo } from '../types';
import { getLanguage, saveLanguage } from '../utils/indexedDB';
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

// 简单的语法高亮
function highlightCode(code: string, language: Language): string {
  const keywords: Record<Language, string[]> = {
    java: ['public', 'void', 'int', 'for', 'if', 'else', 'while', 'return', 'new', 'class'],
    python: ['def', 'for', 'if', 'elif', 'else', 'while', 'return', 'in', 'range', 'len'],
    golang: ['func', 'for', 'if', 'else', 'return', 'var', 'int', 'range'],
    javascript: ['function', 'const', 'let', 'var', 'for', 'if', 'else', 'while', 'return'],
  };

  let result = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 高亮注释
  result = result.replace(/(\/\/.*$|#.*$)/gm, '<span class="code-comment">$1</span>');

  // 高亮字符串
  result = result.replace(/(".*?"|'.*?')/g, '<span class="code-string">$1</span>');

  // 高亮数字
  result = result.replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');

  // 高亮关键字
  keywords[language].forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    result = result.replace(regex, '<span class="code-keyword">$1</span>');
  });

  return result;
}

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

  // 获取当前行的变量值
  const getVariableForLine = (lineNum: number): string | null => {
    const variables = step.variables;
    if (!variables) return null;

    // 简单匹配：如果行包含变量名，显示其值
    const line = lines[lineNum - 1] || '';
    const varEntries = Object.entries(variables);
    
    for (const [name, value] of varEntries) {
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
          const variable = isHighlighted ? getVariableForLine(lineNum) : null;

          return (
            <div key={index} className={`code-line ${isHighlighted ? 'highlighted' : ''}`}>
              <span className="code-line-number">{lineNum}</span>
              <span
                className="code-line-content"
                dangerouslySetInnerHTML={{ __html: highlightCode(line, language) }}
              />
              {variable && <span className="code-line-variable">{variable}</span>}
            </div>
          );
        })}
      </div>

      <div className="variables-panel">
        <div className="variables-title">当前变量</div>
        <div className="variables-grid">
          {Object.entries(step.variables).map(([name, value]) => (
            <div key={name} className="variable-item">
              <span className="variable-name">{name}</span>
              <span className="variable-value">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
