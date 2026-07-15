import { Color, AlgorithmStep, AlgorithmInfo, Language } from '../types';

// 单指针算法代码
const code: Record<Language, string> = {
  java: `public void sortColors(int[] nums) {
    int n = nums.length;
    int ptr = 0;
    // 第一次遍历：将所有0交换到头部
    for (int i = 0; i < n; i++) {
        if (nums[i] == 0) {
            swap(nums, i, ptr);
            ptr++;
        }
    }
    // 第二次遍历：将所有1交换到0之后
    for (int i = ptr; i < n; i++) {
        if (nums[i] == 1) {
            swap(nums, i, ptr);
            ptr++;
        }
    }
}`,
  python: `def sortColors(nums):
    n = len(nums)
    ptr = 0
    # 第一次遍历：将所有0交换到头部
    for i in range(n):
        if nums[i] == 0:
            nums[i], nums[ptr] = nums[ptr], nums[i]
            ptr += 1
    # 第二次遍历：将所有1交换到0之后
    for i in range(ptr, n):
        if nums[i] == 1:
            nums[i], nums[ptr] = nums[ptr], nums[i]
            ptr += 1`,
  golang: `func sortColors(nums []int) {
    n := len(nums)
    ptr := 0
    // 第一次遍历：将所有0交换到头部
    for i := 0; i < n; i++ {
        if nums[i] == 0 {
            nums[i], nums[ptr] = nums[ptr], nums[i]
            ptr++
        }
    }
    // 第二次遍历：将所有1交换到0之后
    for i := ptr; i < n; i++ {
        if nums[i] == 1 {
            nums[i], nums[ptr] = nums[ptr], nums[i]
            ptr++
        }
    }
}`,
  javascript: `function sortColors(nums) {
    const n = nums.length;
    let ptr = 0;
    // 第一次遍历：将所有0交换到头部
    for (let i = 0; i < n; i++) {
        if (nums[i] === 0) {
            [nums[i], nums[ptr]] = [nums[ptr], nums[i]];
            ptr++;
        }
    }
    // 第二次遍历：将所有1交换到0之后
    for (let i = ptr; i < n; i++) {
        if (nums[i] === 1) {
            [nums[i], nums[ptr]] = [nums[ptr], nums[i]];
            ptr++;
        }
    }
}`,
};

export const singlePointerInfo: AlgorithmInfo = {
  type: 'single-pointer',
  name: '单指针法',
  description: '两次遍历，第一次将所有0交换到头部，第二次将所有1交换到0之后',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  code,
};

// 生成单指针算法的步骤
export function generateSinglePointerSteps(input: Color[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const nums = [...input];
  const n = nums.length;
  let stepId = 0;

  // 初始状态
  steps.push({
    id: stepId++,
    array: [...nums],
    highlightLines: { java: [1, 2, 3], python: [1, 2, 3], golang: [1, 2, 3], javascript: [1, 2, 3] },
    pointers: { ptr: 0 },
    pointerMeta: {
      ptr: { label: '交换指针 ptr', hint: '已排序区右边界', color: '#4ecdc4', regionLabel: '已排序区' },
    },
    variables: { n, ptr: 0, phase: '初始化' },
    description: `初始化：n = ${n}，ptr = 0，准备开始第一次遍历`,
    action: 'init',
  });

  // 第一次遍历：将所有0交换到头部
  let ptr = 0;
  for (let i = 0; i < n; i++) {
    // 比较步骤
    steps.push({
      id: stepId++,
      array: [...nums],
      highlightLines: { java: [5], python: [5], golang: [5], javascript: [5] },
      pointers: { i, ptr },
      variables: { n, ptr, i, 'nums[i]': nums[i], phase: '第一次遍历' },
      description: `第一次遍历：检查 nums[${i}] = ${nums[i]}${nums[i] === 0 ? '，等于0，需要交换' : '，不等于0，跳过'}`,
      action: 'compare',
      compareIndex: i,
    });

    if (nums[i] === 0) {
      // 交换步骤
      if (i !== ptr) {
        const temp = nums[i];
        nums[i] = nums[ptr];
        nums[ptr] = temp;
        
        steps.push({
          id: stepId++,
          array: [...nums],
          highlightLines: { java: [6], python: [6], golang: [6], javascript: [6] },
          pointers: { i, ptr },
          variables: { n, ptr, i, phase: '第一次遍历' },
          description: `交换 nums[${i}] 和 nums[${ptr}]`,
          action: 'swap',
          swapIndices: [i, ptr],
        });
      }

      // 移动ptr
      ptr++;
      steps.push({
        id: stepId++,
        array: [...nums],
        highlightLines: { java: [7], python: [7], golang: [7], javascript: [7] },
        pointers: { i, ptr },
        variables: { n, ptr, i, phase: '第一次遍历' },
        description: `ptr 向右移动，ptr = ${ptr}`,
        action: 'move',
      });
    }
  }

  // 第一次遍历完成
  steps.push({
    id: stepId++,
    array: [...nums],
    highlightLines: { java: [10], python: [8], golang: [10], javascript: [10] },
    pointers: { ptr },
    variables: { n, ptr, phase: '第一次遍历完成' },
    description: `第一次遍历完成，所有0已移到头部，ptr = ${ptr}`,
    action: 'move',
  });

  // 第二次遍历：将所有1交换到0之后
  for (let i = ptr; i < n; i++) {
    // 比较步骤
    steps.push({
      id: stepId++,
      array: [...nums],
      highlightLines: { java: [11], python: [10], golang: [11], javascript: [11] },
      pointers: { i, ptr },
      variables: { n, ptr, i, 'nums[i]': nums[i], phase: '第二次遍历' },
      description: `第二次遍历：检查 nums[${i}] = ${nums[i]}${nums[i] === 1 ? '，等于1，需要交换' : '，不等于1，跳过'}`,
      action: 'compare',
      compareIndex: i,
    });

    if (nums[i] === 1) {
      // 交换步骤
      if (i !== ptr) {
        const temp = nums[i];
        nums[i] = nums[ptr];
        nums[ptr] = temp;
        
        steps.push({
          id: stepId++,
          array: [...nums],
          highlightLines: { java: [12], python: [11], golang: [12], javascript: [12] },
          pointers: { i, ptr },
          variables: { n, ptr, i, phase: '第二次遍历' },
          description: `交换 nums[${i}] 和 nums[${ptr}]`,
          action: 'swap',
          swapIndices: [i, ptr],
        });
      }

      // 移动ptr
      ptr++;
      steps.push({
        id: stepId++,
        array: [...nums],
        highlightLines: { java: [13], python: [12], golang: [13], javascript: [13] },
        pointers: { i, ptr },
        variables: { n, ptr, i, phase: '第二次遍历' },
        description: `ptr 向右移动，ptr = ${ptr}`,
        action: 'move',
      });
    }
  }

  // 完成
  steps.push({
    id: stepId++,
    array: [...nums],
    highlightLines: { java: [15], python: [12], golang: [15], javascript: [15] },
    pointers: {},
    variables: { phase: '排序完成' },
    description: '排序完成！数组已按照红(0)、白(1)、蓝(2)的顺序排列',
    action: 'complete',
  });

  return steps;
}
