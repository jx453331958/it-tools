import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Lottery tool',
  path: '/lottery-tool',
  description: '',
  keywords: ['lottery', 'tool'],
  component: () => import('./lottery-tool.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2025-02-17'),
});