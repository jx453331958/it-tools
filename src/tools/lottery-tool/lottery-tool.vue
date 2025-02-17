<template>
  <div class="lottery-tool">
    <n-space vertical size="large">
      <n-card>
        <n-space vertical>
          <n-form-item label="抽奖标题">
            <n-input
              v-model:value="title"
              placeholder="请输入抽奖标题"
              @update:value="service.setTitle($event)"
            />
          </n-form-item>
          
          <n-form-item label="中奖人数">
            <n-input-number
              v-model:value="winnerCount"
              :min="1"
              :max="candidates.length"
              placeholder="中奖人数"
              @update:value="service.setWinnerCount($event)"
            />
          </n-form-item>

          <n-space>
            <n-button
              type="primary"
              :disabled="candidates.length === 0"
              @click="handleStartStop"
            >
              {{ isRunning ? '停止' : '开始' }}
            </n-button>
            <n-button @click="service.reset()">重新开始</n-button>
            <n-button @click="service.clearCandidates()">清空候选人</n-button>
            <n-button
              :disabled="results.length === 0"
              @click="handleExport"
            >
              导出结果
            </n-button>
          </n-space>
        </n-space>
      </n-card>

      <n-card title="参与者">
        <template #header-extra>
          <n-button size="small" @click="showAddModal = true">
            添加参与者
          </n-button>
        </template>
        <n-empty v-if="candidates.length === 0" description="暂无参与者" />
        <n-space v-else wrap>
          <n-tag
            v-for="candidate in candidates"
            :key="candidate"
            :bordered="false"
            closable
            @close="service.removeCandidate(candidate)"
          >
            {{ candidate }}
          </n-tag>
        </n-space>
      </n-card>
      
      <n-card title="当前中奖">
        <n-empty
          v-if="currentWinners.length === 0"
          description="等待抽奖结果"
        />
        <n-space v-else wrap>
          <n-tag
            v-for="winner in currentWinners"
            :key="winner"
            type="success"
            :bordered="false"
          >
            {{ winner }}
          </n-tag>
        </n-space>
      </n-card>

      <n-card title="历史记录">
        <n-empty v-if="results.length === 0" description="暂无抽奖记录" />
        <n-timeline v-else>
          <n-timeline-item
            v-for="(result, index) in results"
            :key="index"
            :title="`第${index + 1}次抽奖`"
            :time="result.drawTime.toLocaleString()"
          >
            <n-space>
              <n-tag
                v-for="winner in result.winners"
                :key="winner"
                type="success"
                :bordered="false"
              >
                {{ winner }}
              </n-tag>
            </n-space>
          </n-timeline-item>
        </n-timeline>
      </n-card>
    </n-space>

    <n-modal v-model:show="showAddModal" preset="dialog" title="添加参与者">
      <n-input
        v-model:value="newCandidates"
        type="textarea"
        placeholder="请输入参与者名单，每行一个"
        :rows="10"
      />
      <template #action>
        <n-button type="primary" @click="handleAddCandidates">
          确定
        </n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { lotteryToolService } from './lottery-tool.service';

const service = lotteryToolService;
const message = useMessage();

const title = computed(() => service.getTitle().value);
const candidates = computed(() => service.getCandidates().value);
const winnerCount = computed(() => service.getWinnerCount().value);
const currentWinners = computed(() => service.getCurrentWinners().value);
const results = computed(() => service.getResults().value);
const isRunning = computed(() => service.isLotteryRunning().value);

const showAddModal = ref(false);
const newCandidates = ref('');

const handleStartStop = () => {
  if (isRunning.value) {
    service.stopLottery();
  } else {
    service.startLottery();
  }
};

const handleAddCandidates = () => {
  service.addCandidates(newCandidates.value);
  showAddModal.value = false;
  newCandidates.value = '';
  message.success('添加成功');
};

const handleExport = () => {
  const results = service.exportResults();
  const blob = new Blob([results], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `抽奖结果_${new Date().toLocaleString()}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  message.success('导出成功');
};
</script>

<style scoped>
.lottery-tool {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
