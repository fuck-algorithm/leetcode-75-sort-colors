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

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightCode(code: string, language: Language): string {
  const tokenRegex = /\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|[A-Za-z_]\w*/g;
  const keywords = keywordSets[language];
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(code)) !== null) {
    result += escapeHtml(code.slice(lastIndex, match.index));

    const token = match[0];
    let className: string | null = null;
    if (token.startsWith('//') || token.startsWith('#')) {
      className = 'code-comment';
    } else if (token.startsWith('"') || token.startsWith("'")) {
      className = 'code-string';
    } else if (/^\d/.test(token)) {
      className = 'code-number';
    } else if (keywords.includes(token)) {
      className = 'code-keyword';
    }

    result += className
      ? `<span class="${className}">${escapeHtml(token)}</span>`
      : escapeHtml(token);
    lastIndex = match.index + token.length;
  }

  result += escapeHtml(code.slice(lastIndex));
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
