import { Color } from '../types';

// 验证输入数组是否合法
export function validateInput(input: string): { valid: boolean; error?: string; data?: Color[] } {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { valid: false, error: '请输入数组数据' };
  }
  
  // 支持多种格式：[2,0,1] 或 2,0,1 或 2 0 1
  let numbers: string[];
  
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    // 格式：[2,0,1]
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) {
      return { valid: false, error: '数组不能为空' };
    }
    numbers = inner.split(',').map(s => s.trim());
  } else if (trimmed.includes(',')) {
    // 格式：2,0,1
    numbers = trimmed.split(',').map(s => s.trim());
  } else {
    // 格式：2 0 1
    numbers = trimmed.split(/\s+/);
  }
  
  // 验证长度
  if (numbers.length < 1 || numbers.length > 300) {
    return { valid: false, error: '数组长度必须在1到300之间' };
  }
  
  // 验证每个元素
  const result: Color[] = [];
  for (let i = 0; i < numbers.length; i++) {
    const num = parseInt(numbers[i], 10);
    if (isNaN(num)) {
      return { valid: false, error: `第${i + 1}个元素"${numbers[i]}"不是有效数字` };
    }
    if (num !== 0 && num !== 1 && num !== 2) {
      return { valid: false, error: `第${i + 1}个元素必须是0、1或2，当前值为${num}` };
    }
    result.push(num as Color);
  }
  
  return { valid: true, data: result };
}

// 生成随机合法数组
export function generateRandomArray(length?: number): Color[] {
  const len = length || Math.floor(Math.random() * 10) + 5; // 5-14个元素
  const result: Color[] = [];
  for (let i = 0; i < len; i++) {
    result.push(Math.floor(Math.random() * 3) as Color);
  }
  return result;
}

// 预设示例数据
export const EXAMPLE_DATA: { label: string; data: Color[] }[] = [
  { label: '示例1', data: [2, 0, 2, 1, 1, 0] },
  { label: '示例2', data: [2, 0, 1] },
  { label: '全0', data: [0, 0, 0] },
  { label: '全1', data: [1, 1, 1] },
  { label: '全2', data: [2, 2, 2] },
  { label: '已排序', data: [0, 0, 1, 1, 2, 2] },
  { label: '逆序', data: [2, 2, 1, 1, 0, 0] },
];
