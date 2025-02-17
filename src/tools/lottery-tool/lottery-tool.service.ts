/**
 * 抽奖工具：
 * 1. 支持设置标题
 * 2. 支持增加候选人
 * 3. 支持配置中奖人数
 * 4. 支持手动暂停和自动暂停
 * 5. 支持重新开始
 * 6. 支持清空候选人
 * 7. 支持导出中奖结果
 * 8. 支持设置抽奖次数
 * 9. 支持批量添加候选人
 */

export interface LotteryResult {
  winners: string[];
  timestamp: number;
  title: string;
}

export class LotteryService {
  private candidates: string[] = [];
  private currentWinners: string[] = [];
  private results: LotteryResult[] = [];
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private currentIndex = 0;
  private currentCandidate: string = '';
  private targetWinners: number = 0;

  constructor() {}

  addCandidate(name: string) {
    const trimmedName = name.trim();
    if (trimmedName && !this.candidates.includes(trimmedName)) {
      this.candidates.push(trimmedName);
    }
    return this;
  }

  addCandidates(names: string[]) {
    const uniqueNames = [...new Set(names.map(name => name.trim()).filter(Boolean))];
    const newNames = uniqueNames.filter(name => !this.candidates.includes(name));
    this.candidates.push(...newNames);
    return this;
  }

  removeCandidate(name: string) {
    this.candidates = this.candidates.filter(c => c !== name);
  }

  clearCandidates() {
    this.candidates = [];
    this.currentWinners = [];
  }

  start(numWinners: number) {
    if (this.candidates.length < numWinners) {
      throw new Error('Not enough candidates');
    }
    
    // 设置目标获奖者数量
    this.targetWinners = numWinners;
    
    if (!this.isRunning) {
      // 只有在新一轮开始时才重置当前获奖者
      this.currentWinners = [];
    }
    
    this.isRunning = true;
    
    // 只从未中奖的候选人中选择
    const availableCandidates = this.candidates.filter(c => !this.currentWinners.includes(c));
    if (availableCandidates.length === 0) {
      throw new Error('No available candidates');
    }
    
    this.intervalId = setInterval(() => {
      this.currentIndex = Math.floor(Math.random() * availableCandidates.length);
      // 使用可用候选人列表来获取当前显示的候选人
      this.currentCandidate = availableCandidates[this.currentIndex];
    }, 50);
  }

  stop(title: string) {
    if (!this.isRunning || !this.intervalId) return;

    clearInterval(this.intervalId);
    this.isRunning = false;
    this.intervalId = null;

    // 使用当前显示的候选人作为获奖者
    if (this.currentCandidate && !this.currentWinners.includes(this.currentCandidate)) {
      this.currentWinners.push(this.currentCandidate);
    }

    // 只有在达到目标获奖者数量时才保存结果
    if (this.currentWinners.length >= this.targetWinners) {
      const result: LotteryResult = {
        winners: [...this.currentWinners],
        timestamp: Date.now(),
        title,
      };
      this.results.push(result);
      // 重置目标获奖者数量，表示本轮已结束
      this.targetWinners = 0;
    }
  }

  getCurrentCandidate(): string {
    return this.currentCandidate;
  }

  getCandidates(): string[] {
    return [...this.candidates];
  }

  getCurrentWinners(): string[] {
    return [...this.currentWinners];
  }

  getResults(): LotteryResult[] {
    return [...this.results];
  }

  isLotteryRunning(): boolean {
    return this.isRunning;
  }

  hasReachedTarget(): boolean {
    return this.currentWinners.length >= this.targetWinners;
  }

  reset() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.isRunning = false;
    this.intervalId = null;
    this.currentWinners = [];
    this.currentIndex = 0;
    this.currentCandidate = '';
    this.targetWinners = 0;  // 重置目标获奖者数量
  }

  clearResults() {
    this.results = [];
  }
}
