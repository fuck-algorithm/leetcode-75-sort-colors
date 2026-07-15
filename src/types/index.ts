// 颜色类型：0-红色，1-白色，2-蓝色
export type Color = 0 | 1 | 2;

// 编程语言类型
export type Language = 'java' | 'python' | 'golang' | 'javascript';

// 算法类型
export type AlgorithmType = 'single-pointer' | 'double-pointer-p0p1' | 'double-pointer-p0p2';

// 算法步骤
export interface AlgorithmStep {
  // 步骤ID
  id: number;
  // 当前数组状态
  array: Color[];
  // 高亮的代码行（按语言）
  highlightLines: Record<Language, number[]>;
  // 指针位置
  pointers: {
    i?: number;      // 当前遍历位置
    ptr?: number;    // 单指针
    p0?: number;     // 指针p0
    p1?: number;     // 指针p1
    p2?: number;     // 指针p2
  };
  // 变量值
  variables: Record<string, number | string | boolean>;
  // 步骤描述
  description: string;
  // 操作类型
  action: 'init' | 'compare' | 'swap' | 'move' | 'complete';
  // 交换的索引（如果有）
  swapIndices?: [number, number];
  // 比较的索引（如果有）
  compareIndex?: number;
  // 指针语义元数据：键名与 pointers 的键对应，提供人类可读的说明
  pointerMeta?: Record<string, PointerMeta>;
}

/** 单个指针的语义说明元数据 */
export interface PointerMeta {
  /** 指针的完整名称，如 "遍历指针 i" */
  label: string;
  /** 指针的作用说明，如 "当前正在检查的数组位置" */
  hint: string;
  /** 指针在画布上的显示颜色（hex），用于箭头与标签着色 */
  color: string;
  /** 指针指向区域的语义标签，如 "下一个0应放的位置"、"已排序0区右边界" */
  regionLabel?: string;
}

// 算法信息
export interface AlgorithmInfo {
  type: AlgorithmType;
  name: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  code: Record<Language, string>;
}

// 播放状态
export interface PlayState {
  isPlaying: boolean;
  currentStep: number;
  speed: number;
  totalSteps: number;
}

// IndexedDB存储的设置
export interface UserSettings {
  language: Language;
  speed: number;
}

// GitHub仓库信息
export interface GitHubRepoInfo {
  stars: number;
  lastFetched: number;
}
