import { Color, AlgorithmStep, AlgorithmInfo, AlgorithmType } from '../types';
import { singlePointerInfo, generateSinglePointerSteps } from './singlePointer';
import { doublePointerP0P1Info, generateDoublePointerP0P1Steps } from './doublePointerP0P1';
import { doublePointerP0P2Info, generateDoublePointerP0P2Steps } from './doublePointerP0P2';

// 所有算法信息
export const algorithms: Record<AlgorithmType, AlgorithmInfo> = {
  'single-pointer': singlePointerInfo,
  'double-pointer-p0p1': doublePointerP0P1Info,
  'double-pointer-p0p2': doublePointerP0P2Info,
};

// 生成算法步骤
export function generateSteps(type: AlgorithmType, input: Color[]): AlgorithmStep[] {
  switch (type) {
    case 'single-pointer':
      return generateSinglePointerSteps(input);
    case 'double-pointer-p0p1':
      return generateDoublePointerP0P1Steps(input);
    case 'double-pointer-p0p2':
      return generateDoublePointerP0P2Steps(input);
    default:
      return generateSinglePointerSteps(input);
  }
}

// 算法思路说明
export const algorithmExplanations: Record<AlgorithmType, string> = {
  'single-pointer': `## 单指针法

### 思路
使用一个指针 ptr 表示"头部"的范围，进行两次遍历：

1. **第一次遍历**：将所有的 0 交换到数组头部
   - 遍历数组，遇到 0 就与 ptr 位置交换
   - 交换后 ptr 向右移动一位

2. **第二次遍历**：将所有的 1 交换到 0 之后
   - 从 ptr 位置开始遍历
   - 遇到 1 就与 ptr 位置交换
   - 交换后 ptr 向右移动一位

### 复杂度
- 时间复杂度：O(n)，需要遍历两次数组
- 空间复杂度：O(1)，只使用常数额外空间`,

  'double-pointer-p0p1': `## 双指针法 (p0, p1)

### 思路
使用两个指针 p0 和 p1，一次遍历完成排序：
- p0 用于交换 0
- p1 用于交换 1

### 关键点
当遇到 0 时，如果 p0 < p1，说明已经有一些 1 被放到了头部。
此时交换 nums[i] 和 nums[p0] 会把一个 1 换出去，
需要再将这个 1 交换到 p1 位置。

### 遍历规则
1. 遇到 1：与 nums[p1] 交换，p1++
2. 遇到 0：
   - 与 nums[p0] 交换
   - 如果 p0 < p1，再与 nums[p1] 交换
   - p0++，p1++

### 复杂度
- 时间复杂度：O(n)，只需遍历一次
- 空间复杂度：O(1)，只使用常数额外空间`,

  'double-pointer-p0p2': `## 双指针法 (p0, p2) - 荷兰国旗问题

### 思路
这是 Dijkstra 提出的经典解法：
- p0 指向下一个 0 应该放置的位置（从左向右）
- p2 指向下一个 2 应该放置的位置（从右向左）

### 遍历规则
1. 遇到 2：不断与 nums[p2] 交换，p2--
   - 注意：交换后可能还是 2，需要继续交换
2. 遇到 0：与 nums[p0] 交换，p0++
3. 遇到 1：不需要处理，继续遍历

### 终止条件
当 i > p2 时停止，因为 p2 右边都是已排好的 2

### 复杂度
- 时间复杂度：O(n)，只需遍历一次
- 空间复杂度：O(1)，只使用常数额外空间`,
};

export { singlePointerInfo, doublePointerP0P1Info, doublePointerP0P2Info };
