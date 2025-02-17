import { Gift } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.lottery-tool.title'),
  path: '/lottery-tool',
  description: translate('tools.lottery-tool.description'),
  keywords: ['lottery', 'random', 'draw', 'winner'],
  component: () => import('./lottery-tool.vue'),
  icon: Gift,
  createdAt: new Date('2025-02-17'),
});