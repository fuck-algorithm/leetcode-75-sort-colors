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
    result = result.replace(regex, `<span class="code-keyword">$1</span>`);
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
