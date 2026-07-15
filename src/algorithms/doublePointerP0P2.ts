import { Color, AlgorithmStep, AlgorithmInfo, Language } from '../types';

// 双指针(p0,p2)算法代码 - 荷兰国旗问题经典解法
const code: Record<Language, string> = {
  java: `public void sortColors(int[] nums) {
    int n = nums.length;
    int p0 = 0, p2 = n - 1;
    for (int i = 0; i <= p2; i++) {
        while (i <= p2 && nums[i] == 2) {
            swap(nums, i, p2);
            p2--;
        }
        if (nums[i] == 0) {
            swap(nums, i, p0);
            p0++;
        }
    }
}`,
  python: `def sortColors(nums):
    n = len(nums)
    p0, p2 = 0, n - 1
    i = 0
    while i <= p2:
        while i <= p2 and nums[i] == 2:
            nums[i], nums[p2] = nums[p2], nums[i]
            p2 -= 1
        if nums[i] == 0:
            nums[i], nums[p0] = nums[p0], nums[i]
            p0 += 1
        i += 1`,
  golang: `func sortColors(nums []int) {
    n := len(nums)
    p0, p2 := 0, n-1
    for i := 0; i <= p2; i++ {
        for i <= p2 && nums[i] == 2 {
            nums[i], nums[p2] = nums[p2], nums[i]
            p2--
        }
        if nums[i] == 0 {
            nums[i], nums[p0] = nums[p0], nums[i]
            p0++
        }
    }
}`,
  javascript: `function sortColors(nums) {
    const n = nums.length;
    let p0 = 0, p2 = n - 1;
    for (let i = 0; i <= p2; i++) {
        while (i <= p2 && nums[i] === 2) {
            [nums[i], nums[p2]] = [nums[p2], nums[i]];
            p2--;
        }
        if (nums[i] === 0) {
            [nums[i], nums[p0]] = [nums[p0], nums[i]];
            p0++;
        }
    }
}`,
};

export const doublePointerP0P2Info: AlgorithmInfo = {
  type: 'double-pointer-p0p2',
  name: '双指针法(p0,p2)',
  description: '一次遍历，p0从左向右交换0，p2从右向左交换2，经典荷兰国旗解法',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  code,
};

// 生成双指针(p0,p2)算法的步骤
export function generateDoublePointerP0P2Steps(input: Color[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const nums = [...input];
  const n = nums.length;
  let stepId = 0;

  // 初始状态
  steps.push({
    id: stepId++,
    array: [...nums],
    highlightLines: { java: [1, 2, 3], python: [1, 2, 3, 4], golang: [1, 2, 3], javascript: [1, 2, 3] },
    pointers: { p0: 0, p2: n - 1 },
    pointerMeta: {
      p0: { label: '指针 p0', hint: '0 区右边界', color: '#ff6b6b', regionLabel: '0 区' },
      p2: { label: '指针 p2', hint: '2 区左边界', color: '#4ecdc4', regionLabel: '2 区' },
    },
    variables: { n, p0: 0, p2: n - 1 },
    description: `初始化：n = ${n}，p0 = 0（左边界），p2 = ${n - 1}（右边界）`,
    action: 'init',
  });

  let p0 = 0, p2 = n - 1;
  let i = 0;
  
  while (i <= p2) {
    // 检查当前位置
    steps.push({
      id: stepId++,
      array: [...nums],
      highlightLines: { java: [4], python: [5], golang: [4], javascript: [4] },
      pointers: { i, p0, p2 },
      variables: { n, p0, p2, i, 'nums[i]': nums[i], 'i <= p2': i <= p2 },
      description: `遍历位置 i = ${i}，检查 nums[${i}] = ${nums[i]}`,
      action: 'compare',
      compareIndex: i,
    });

    // 处理2：不断将2交换到右边
    while (i <= p2 && nums[i] === 2) {
      steps.push({
        id: stepId++,
        array: [...nums],
        highlightLines: { java: [5], python: [6], golang: [5], javascript: [5] },
        pointers: { i, p0, p2 },
        variables: { n, p0, p2, i, 'nums[i]': nums[i], 'nums[p2]': nums[p2] },
        description: `nums[${i}] = 2，需要交换到右边`,
        action: 'compare',
      });

      // 交换
      const temp = nums[i];
      nums[i] = nums[p2];
      nums[p2] = temp;
      
      steps.push({
        id: stepId++,
        array: [...nums],
        highlightLines: { java: [6], python: [7], golang: [6], javascript: [6] },
        pointers: { i, p0, p2 },
        variables: { n, p0, p2, i, '交换后nums[i]': nums[i] },
        description: `交换 nums[${i}] 和 nums[${p2}]`,
        action: 'swap',
        swapIndices: [i, p2],
      });

      // p2--
      p2--;
      steps.push({
        id: stepId++,
        array: [...nums],
        highlightLines: { java: [7], python: [8], golang: [7], javascript: [7] },
        pointers: { i, p0, p2 },
        variables: { n, p0, p2, i },
        description: `p2 向左移动，p2 = ${p2}`,
        action: 'move',
      });

      // 检查是否继续循环
      if (i <= p2 && nums[i] === 2) {
        steps.push({
          id: stepId++,
          array: [...nums],
          highlightLines: { java: [5], python: [6], golang: [5], javascript: [5] },
          pointers: { i, p0, p2 },
          variables: { n, p0, p2, i, 'nums[i]': nums[i] },
          description: `交换后 nums[${i}] = ${nums[i]}，仍然是2，继续交换`,
          action: 'compare',
        });
      }
    }

    // 检查是否越界
    if (i > p2) {
      break;
    }

    // 处理0：将0交换到左边
    if (nums[i] === 0) {
      steps.push({
        id: stepId++,
        array: [...nums],
        highlightLines: { java: [9], python: [9], golang: [9], javascript: [9] },
        pointers: { i, p0, p2 },
        variables: { n, p0, p2, i, 'nums[i]': nums[i] },
        description: `nums[${i}] = 0，需要交换到左边`,
        action: 'compare',
      });

      if (i !== p0) {
        const temp = nums[i];
        nums[i] = nums[p0];
        nums[p0] = temp;
        
        steps.push({
          id: stepId++,
          array: [...nums],
          highlightLines: { java: [10], python: [10], golang: [10], javascript: [10] },
          pointers: { i, p0, p2 },
          variables: { n, p0, p2, i },
          description: `交换 nums[${i}] 和 nums[${p0}]`,
          action: 'swap',
          swapIndices: [i, p0],
        });
      }

      // p0++
      p0++;
      steps.push({
        id: stepId++,
        array: [...nums],
        highlightLines: { java: [11], python: [11], golang: [11], javascript: [11] },
        pointers: { i, p0, p2 },
        variables: { n, p0, p2, i },
        description: `p0 向右移动，p0 = ${p0}`,
        action: 'move',
      });
    } else if (nums[i] === 1) {
      steps.push({
        id: stepId++,
        array: [...nums],
        highlightLines: { java: [9], python: [9], golang: [9], javascript: [9] },
        pointers: { i, p0, p2 },
        variables: { n, p0, p2, i, 'nums[i]': nums[i] },
        description: `nums[${i}] = 1，已在正确区域，无需处理`,
        action: 'compare',
      });
    }

    i++;
  }

  // 完成
  steps.push({
    id: stepId++,
    array: [...nums],
    highlightLines: { java: [13], python: [12], golang: [13], javascript: [13] },
    pointers: {},
    variables: { phase: '排序完成' },
    description: '排序完成！数组已按照红(0)、白(1)、蓝(2)的顺序排列',
    action: 'complete',
  });

  return steps;
}
