<template>
  <div class="lottery-container">
    <NSpace vertical size="large">
      <!-- 标题和候选人输入 -->
      <NCard title="设置">
        <NSpace vertical>
          <NInput v-model:value="title" placeholder="请输入抽奖标题" />
          <NSpace align="center">
            <NInput v-model:value="newCandidate" placeholder="输入候选人" @keyup.enter="addCandidate" />
            <NButton type="primary" @click="addCandidate">添加</NButton>
            <NPopconfirm @positive-click="clearCandidates">
              <template #trigger>
                <NButton>清空候选人</NButton>
              </template>
              确定要清空所有候选人吗？
            </NPopconfirm>
          </NSpace>
          <NSpace vertical>
            <NInput
              v-model:value="batchCandidates"
              type="textarea"
              placeholder="批量添加候选人（每行一个名字）"
              :rows="4"
            />
            <NButton type="primary" @click="addBatchCandidates">批量添加</NButton>
          </NSpace>
          <NSpace align="center">
            <span>中奖人数：</span>
            <NInputNumber v-model:value="numWinners" :min="1" :max="candidates.length" />
          </NSpace>
        </NSpace>
      </NCard>

      <!-- 候选人列表 -->
      <NCard title="候选人列表">
        <NList>
          <NListItem v-for="candidate in candidates" :key="candidate">
            {{ candidate }}
            <template #suffix>
              <NButton size="small" @click="removeCandidate(candidate)">删除</NButton>
            </template>
          </NListItem>
        </NList>
      </NCard>

      <!-- 抽奖区域 -->
      <NCard title="抽奖区域">
        <NSpace vertical align="center">
          <div class="lottery-display">
            <h2>{{ currentCandidate || '等待开始...' }}</h2>
          </div>
          <NDivider />
          <div class="winners-display">
            <h3>本轮获奖者：</h3>
            <NSpace>
              <NTag v-for="winner in currentWinners" :key="winner" type="success">
                {{ winner }}
              </NTag>
            </NSpace>
          </div>
          <NSpace>
            <NButton type="primary" size="large" @click="startLottery" :disabled="lotteryService.isLotteryRunning()">
              开始
            </NButton>
            <NButton type="warning" size="large" @click="stopLottery" :disabled="!lotteryService.isLotteryRunning()">
              停止
            </NButton>
            <NButton @click="reset">重置</NButton>
          </NSpace>
        </NSpace>
      </NCard>

      <!-- 历史记录 -->
      <NCard title="历史记录">
        <NSpace vertical>
          <NList>
            <NListItem v-for="result in results" :key="result.timestamp">
              <NSpace vertical>
                <strong>{{ result.title }}</strong>
                <NSpace>
                  <NTag v-for="winner in result.winners" :key="winner" type="success">
                    {{ winner }}
                  </NTag>
                </NSpace>
                <small>{{ new Date(result.timestamp).toLocaleString() }}</small>
              </NSpace>
            </NListItem>
          </NList>
          <NSpace justify="end">
            <NButton @click="exportResults" :disabled="results.length === 0">导出结果</NButton>
            <NPopconfirm @positive-click="clearResults">
              <template #trigger>
                <NButton :disabled="results.length === 0">清空记录</NButton>
              </template>
              确定要清空所有记录吗？
            </NPopconfirm>
          </NSpace>
        </NSpace>
      </NCard>
    </NSpace>
  </div>
</template>

<script setup lang="ts">
import { LotteryService, type LotteryResult } from './lottery-tool.service';
import { onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { NButton, NInput, NInputNumber, NSpace, NCard, NList, NListItem, NPopconfirm, NDivider, NTag } from 'naive-ui';

const { t } = useI18n();
const lotteryService = new LotteryService();

const title = ref('');
const newCandidate = ref('');
const batchCandidates = ref('');
const numWinners = ref(1);
const candidates = ref<string[]>([]);
const currentCandidate = ref('');
const currentWinners = ref<string[]>([]);
const results = ref<LotteryResult[]>([]);

const addCandidate = () => {
  if (newCandidate.value.trim()) {
    lotteryService.addCandidate(newCandidate.value.trim());
    candidates.value = lotteryService.getCandidates();
    newCandidate.value = '';
  }
};

const addBatchCandidates = () => {
  if (!batchCandidates.value.trim()) return;
  
  const names = batchCandidates.value
    .split('\n')
    .map(name => name.trim())
    .filter(Boolean);
  
  lotteryService.addCandidates(names);
  batchCandidates.value = '';
  candidates.value = [...lotteryService.getCandidates()];
};

const removeCandidate = (name: string) => {
  lotteryService.removeCandidate(name);
  candidates.value = lotteryService.getCandidates();
};

const clearCandidates = () => {
  lotteryService.clearCandidates();
  candidates.value = [];
  currentWinners.value = [];
};

const startLottery = () => {
  try {
    lotteryService.start(numWinners.value);
    updateCurrentCandidate();
  } catch (error) {
    if (error instanceof Error) {
      window.$message.error(error.message);
    }
  }
};

const stopLottery = () => {
  lotteryService.stop(title.value);
  currentWinners.value = lotteryService.getCurrentWinners();
  
  // 如果达到目标人数，更新结果列表
  if (lotteryService.hasReachedTarget()) {
    results.value = lotteryService.getResults();
  } else {
    // 如果还没有达到目标人数，自动开始下一轮
    startLottery();
  }
};

const reset = () => {
  lotteryService.reset();
  currentWinners.value = [];
  currentCandidate.value = '';  // 重置当前显示的候选人
};

const clearResults = () => {
  lotteryService.clearResults();
  results.value = [];
};

const updateCurrentCandidate = () => {
  if (lotteryService.isLotteryRunning()) {
    currentCandidate.value = lotteryService.getCurrentCandidate();
    requestAnimationFrame(updateCurrentCandidate);
  }
};

const exportResults = () => {
  const resultsText = results.value.map(result => {
    return `${result.title}\n获奖者: ${result.winners.join(', ')}\n时间: ${new Date(result.timestamp).toLocaleString()}\n`;
  }).join('\n');
  
  const blob = new Blob([resultsText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '抽奖结果.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

onBeforeUnmount(() => {
  lotteryService.reset();
});
</script>

<style scoped>
.lottery-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.lottery-display {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  margin: 20px 0;
}

.winners-display {
  text-align: center;
  margin: 20px 0;
}
</style>