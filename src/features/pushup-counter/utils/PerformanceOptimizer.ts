// PERFORMANCE OPTIMIZATION UTILITIES for Extreme Performance

// Pre-allocated arrays to avoid garbage collection
const PERFORMANCE_BUFFERS = {
  // Buffer for temporary calculations
  tempArray: new Array(50),
  tempNumbers: new Array(25),
  tempBooleans: new Array(25),

  // Reusable objects to avoid object creation
  analysisResult: {
    found: false,
    confidence: 0,
    pattern: 'none',
    minY: 0,
    maxY: 0,
    range: 0,
  },

  bufferInfo: {
    bufferSize: 0,
    currentPattern: 'none',
    minY: 0,
    maxY: 0,
    range: 0,
  },
};

// PERFORMANCE: Ultra-fast array operations
export const fastArrayOperations = {
  // Fast array copy without spread operator
  copyArray: <T>(source: T[], target: T[]): void => {
    const len = source.length;
    for (let i = 0; i < len; i++) {
      target[i] = source[i];
    }
  },

  // Fast array push with pre-allocated space
  fastPush: <T>(array: T[], item: T, maxSize: number): void => {
    array.push(item);
    if (array.length > maxSize) {
      array.shift();
    }
  },

  // Fast min/max calculation in single pass
  getMinMax: (values: number[]): { min: number; max: number } => {
    let min = Infinity;
    let max = -Infinity;
    const len = values.length;

    for (let i = 0; i < len; i++) {
      const val = values[i];
      if (val < min) min = val;
      if (val > max) max = val;
    }

    return { min, max };
  },
};

// PERFORMANCE: Optimized mathematical operations
export const fastMath = {
  // Fast absolute value
  abs: (x: number): number => (x < 0 ? -x : x),

  // Fast minimum
  min: (a: number, b: number): number => (a < b ? a : b),

  // Fast maximum
  max: (a: number, b: number): number => (a > b ? a : b),

  // Fast square root approximation (for performance)
  fastSqrt: (x: number): number => Math.sqrt(x),

  // Fast distance calculation
  distance: (x1: number, y1: number, x2: number, y2: number): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },
};

// PERFORMANCE: Memory pool for object reuse
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    initialSize: number = 10,
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;

    // Pre-allocate objects
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  acquire(): T {
    return this.pool.pop() || this.createFn();
  }

  release(obj: T): void {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}

// PERFORMANCE: Frame rate optimization
export class FrameRateOptimizer {
  private lastFrameTime = 0;
  private frameCount = 0;
  private targetFPS = 30;
  private frameInterval = 1000 / 30;

  constructor(targetFPS: number = 30) {
    this.targetFPS = targetFPS;
    this.frameInterval = 1000 / targetFPS;
  }

  shouldProcessFrame(): boolean {
    const now = Date.now();
    if (now - this.lastFrameTime >= this.frameInterval) {
      this.lastFrameTime = now;
      this.frameCount++;
      return true;
    }
    return false;
  }

  getFPS(): number {
    return this.frameCount;
  }

  reset(): void {
    this.frameCount = 0;
    this.lastFrameTime = 0;
  }
}

// PERFORMANCE: Debounced function for UI updates
export const createDebouncer = (delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (fn: () => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(fn, delay);
  };
};

// PERFORMANCE: Throttled function for frequent operations
export const createThrottler = (delay: number) => {
  let lastCall = 0;

  return (fn: () => void) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn();
    }
  };
};

// PERFORMANCE: Get reusable analysis result object
export const getReusableAnalysisResult = () => {
  const result = PERFORMANCE_BUFFERS.analysisResult;
  result.found = false;
  result.confidence = 0;
  result.pattern = 'none';
  result.minY = 0;
  result.maxY = 0;
  result.range = 0;
  return result;
};

// PERFORMANCE: Get reusable buffer info object
export const getReusableBufferInfo = () => {
  const info = PERFORMANCE_BUFFERS.bufferInfo;
  info.bufferSize = 0;
  info.currentPattern = 'none';
  info.minY = 0;
  info.maxY = 0;
  info.range = 0;
  return info;
};

// PERFORMANCE: Constants for optimization
export const PERFORMANCE_CONSTANTS = {
  // Buffer sizes optimized for performance
  OPTIMAL_BUFFER_SIZE: 25,
  MIN_ANALYSIS_BUFFER: 12,

  // Timing optimizations
  FAST_ANALYSIS_INTERVAL: 30,
  QUICK_RESET_DELAY: 800,

  // Thresholds for early exits
  MIN_MOVEMENT_THRESHOLD: 35,
  CONFIDENCE_THRESHOLD: 0.75,

  // Memory optimization
  MAX_POOL_SIZE: 50,
  PRE_ALLOCATED_ARRAYS: 25,
} as const;
