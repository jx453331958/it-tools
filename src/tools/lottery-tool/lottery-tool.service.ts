/**
 * 抽奖工具：
 * 1. 支持设置标题
 * 2. 支持增加参与者
 * 3. 支持配置中奖人数
 * 4. 支持手动暂停和自动暂停
 * 5. 支持重新开始
 * 6. 支持清空参与者
 * 7. 支持导出中奖结果
 * 8. 支持设置抽奖次数
 * 9. 支持批量添加参与者
 */

import { ref } from 'vue';

export interface LotteryResult {
  winners: string[];
  drawTime: Date;
}

export class LotteryToolService {
  private title = ref<string>('');
  private candidates = ref<string[]>([]);
  private winnerCount = ref<number>(1);
  private isRunning = ref<boolean>(false);
  private currentWinners = ref<string[]>([]);
  private results = ref<LotteryResult[]>([]);
  private timer: NodeJS.Timer | null = null;

  setTitle(title: string) {
    this.title.value = title;
  }

  getTitle() {
    return this.title;
  }

  addCandidate(candidate: string) {
    if (candidate && !this.candidates.value.includes(candidate)) {
      this.candidates.value.push(candidate);
    }
  }

  addCandidates(candidatesText: string) {
    const newCandidates = candidatesText
      .split('\n')
      .map(c => c.trim())
      .filter(c => c && !this.candidates.value.includes(c));
    
    this.candidates.value.push(...newCandidates);
  }

  getCandidates() {
    return this.candidates;
  }

  clearCandidates() {
    this.candidates.value = [];
    this.currentWinners.value = [];
  }

  setWinnerCount(count: number) {
    this.winnerCount.value = count;
  }

  getWinnerCount() {
    return this.winnerCount;
  }

  getCurrentWinners() {
    return this.currentWinners;
  }

  getResults() {
    return this.results;
  }

  isLotteryRunning() {
    return this.isRunning;
  }

  startLottery() {
    if (this.isRunning.value) return;
    
    this.isRunning.value = true;
    this.timer = setInterval(() => {
      this.drawRandomWinners();
    }, 100);
  }

  stopLottery() {
    if (!this.isRunning.value) return;
    
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    this.isRunning.value = false;
    this.results.value.push({
      winners: [...this.currentWinners.value],
      drawTime: new Date()
    });
  }

  reset() {
    this.currentWinners.value = [];
    this.results.value = [];
  }

  private drawRandomWinners() {
    const availableCandidates = this.candidates.value.filter(
      c => !this.currentWinners.value.includes(c)
    );
    
    if (availableCandidates.length === 0) return;

    this.currentWinners.value = [];
    const shuffled = [...availableCandidates].sort(() => Math.random() - 0.5);
    this.currentWinners.value = shuffled.slice(0, this.winnerCount.value);
  }

  exportResults(): string {
    return this.results.value
      .map((result, index) => {
        const time = result.drawTime.toLocaleString();
        const winners = result.winners.join(', ');
        return `第${index + 1}次抽奖 (${time}):\n中奖者: ${winners}\n`;
      })
      .join('\n');
  }

  removeCandidate(candidate: string) {
    const index = this.candidates.value.indexOf(candidate);
    if (index > -1) {
      this.candidates.value.splice(index, 1);
      // 如果当前中奖者中包含被删除的候选人，也需要移除
      const winnerIndex = this.currentWinners.value.indexOf(candidate);
      if (winnerIndex > -1) {
        this.currentWinners.value.splice(winnerIndex, 1);
      }
    }
  }
}

export const lotteryToolService = new LotteryToolService();

