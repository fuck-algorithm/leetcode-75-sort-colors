import { Color, AlgorithmStep, AlgorithmInfo, Language } from '../types';

// 双指针(p0,p1)算法代码
const code: Record<Language, string> = {
  java: `public void sortColors(int[] nums) {
    int n = nums.length;
    int p0 = 0, p1 = 0;
    for (int i = 0; i < n; i++) {
        if (nums[i] == 1) {
            swap(nums, i, p1);
            p1++;
        } else if (nums[i] == 0) {
            swap(nums, i, p0);
            if (p0 < p1) {
                swap(nums, i, p1);
            }
            p0++;
            p1++;
        }
    }
}`,
  python: `def sortColors(nums):
    n = len(nums)
    p0, p1 = 0, 0
    for i in range(n):
        if nums[i] == 1:
            nums[i], nums[p1] = nums[p1], nums[i]
            p1 += 1
        elif nums[i] == 0:
            nums[i], nums[p0] = nums[p0], nums[i]
            if p0 < p1:
                nums[i], nums[p1] = nums[p1], nums[i]
            p0 += 1
            p1 += 1`,
  golang: `func sortColors(nums []int) {
    n := len(nums)
    p0, p1 := 0, 0
    for i := 0; i < n; i++ {
        if nums[i] == 1 {
            nums[i], nums[p1] = nums[p1], nums[i]
            p1++
        } else if nums[i] == 0 {
            nums[i], nums[p0] = nums[p0], nums[i]
            if p0 < p1 {
                nums[i], nums[p1] = nums[p1], nums[i]
            }
            p0++
            p1++
        }
    }
}`,
  javascript: `function sortColors(nums) {
    const n = nums.length;
    let p0 = 0, p1 = 0;
    for (let i = 0; i < n; i++) {
        if (nums[i] === 1) {
            [nums[i], nums[p1]] = [nums[p1], nums[i]];
            p1++;
        } else if (nums[i] === 0) {
            [nums[i], nums[p0]] = [nums[p0], nums[i]];
            if (p0 < p1) {
                [nums[i], nums[p1]] = [nums[p1], nums[i]];
            }
            p0++;
            p1++;
        }
    }
}`,
};

export const doublePointerP0P1Info: AlgorithmInfo = {
  type: 'double-pointer-p0p1',
  name: '双指针法(p0,p1)',
  description: '一次遍历，使用p0交换0，p1交换1，需要处理p0<p1时的特殊情况',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  code,
};

// 生成双指针(p0,p1)算法的步骤
export function generateDoublePointerP0P1Steps(input: Color[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const nums = [...input];
  const n = nums.length;
  let stepId = 0;

  // 初始状态
  steps.push({
    id: stepId++,
    array: [...nums],
    highlightLines: { java: [1, 2, 3], python: [1, 2, 3], golang: [1, 2, 3], javascript: [1, 2, 3] },
    pointers: { p0: 0, p1: 0 },
    pointerMeta: {
      p0: { label: '指针 p0', hint: '0 区右边界', color: '#ff6b6b', regionLabel: '0 区' },
      p1: { label: '指针 p1', hint: '1 区右边界', color: '#f0f0f0', regionLabel: '1 区' },
    },
    variables: { n, p0: 0, p1: 0 },
    description: `初始化：n = ${n}，p0 = 0，p1 = 0`,
    action: 'init',
  });

  let p0 = 0, p1 = 0;
  for (let i = 0; i < n; i++) {
    // 比较步骤
    steps.push({
      id: stepId++,
      array: [...nums],
      highlightLines: { java: [4, 5], python: [4, 5], golang: [4, 5], javascript: [4, 5] },
      pointers: { i, p0, p1 },
      variables: { n, p0, p1, i, 'nums[i]': nums[i] },
      description: `检查 nums[${i}] = ${nums[i]}`,
      action: 'compare',
      compareIndex: i,
    });

    if (nums[i] === 1) {
      // 交换nums[i]和nums[p1]
      if (i !== p1) {
        const temp = nums[i];
        nums[i] = nums[p1];
        nums[p1] = temp;
        
        steps.push({
          id: stepId++,
          array: [...nums],
          highlightLines: { java: [6], python: [6], golang: [6], javascript: [6] },
          pointers: { i, p0, p1 },
          variables: { n, p0, p1, i },
          description: `nums[${i}] = 1，交换 nums[${i}] 和 nums[${p1}]`,
          action: 'swap',
          swapIndices: [i, p1],
        });
      }

      // p1++
      p1++;
      steps.push({
        id: stepId++,
        array: [...nums],
        highlightLines: { java: [7], python: [7], golang: [7], javascript: [7] },
        pointers: { i, p0, p1 },
        variables: { n, p0, p1, i },
        description: `p1 向右移动，p1 = ${p1}`,
        action: 'move',
      });
    } else if (nums[i] === 0) {
      // 交换nums[i]和nums[p0]
      const beforeSwap = [...nums];
      if (i !== p0) {
        const temp = nums[i];
        nums[i] = nums[p0];
        nums[p0] = temp;
        
        steps.push({
          id: stepId++,
          array: [...nums],
          highlightLines: { java: [9], python: [9], golang: [9], javascript: [9] },
          pointers: { i, p0, p1 },
          variables: { n, p0, p1, i, '交换前nums[i]': beforeSwap[i], '交换后nums[i]': nums[i] },
          description: `nums[${i}] = 0，交换 nums[${i}] 和 nums[${p0}]`,
          action: 'swap',
          swapIndices: [i, p0],
        });
      }

      // 检查是否需要额外交换
      if (p0 < p1) {
        steps.push({
          id: stepId++,
          array: [...nums],
          highlightLines: { java: [10], python: [10], golang: [10], javascript: [10] },
          pointers: { i, p0, p1 },
          variables: { n, p0, p1, i, 'p0 < p1': true },
          description: `p0(${p0}) < p1(${p1})，需要额外交换以保持1的连续性`,
          action: 'compare',
        });

        // 额外交换nums[i]和nums[p1]
        const temp = nums[i];
        nums[i] = nums[p1];
        nums[p1] = temp;
        
        steps.push({
          id: stepId++,
          array: [...nums],
          highlightLines: { java: [11], python: [11], golang: [11], javascript: [11] },
          pointers: { i, p0, p1 },
          variables: { n, p0, p1, i },
          description: `额外交换 nums[${i}] 和 nums[${p1}]，将被换出的1放到正确位置`,
          action: 'swap',
          swapIndices: [i, p1],
        });
      }

      // p0++, p1++
      p0++;
      p1++;
      steps.push({
        id: stepId++,
        array: [...nums],
        highlightLines: { java: [13, 14], python: [12, 13], golang: [13, 14], javascript: [13, 14] },
        pointers: { i, p0, p1 },
        variables: { n, p0, p1, i },
        description: `p0 和 p1 都向右移动，p0 = ${p0}，p1 = ${p1}`,
        action: 'move',
      });
    }
  }

  // 完成
  steps.push({
    id: stepId++,
    array: [...nums],
    highlightLines: { java: [17], python: [13], golang: [17], javascript: [17] },
    pointers: {},
    variables: { phase: '排序完成' },
    description: '排序完成！数组已按照红(0)、白(1)、蓝(2)的顺序排列',
    action: 'complete',
  });

  return steps;
}
