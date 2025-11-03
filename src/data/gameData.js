import { SparklesIcon, ShieldCheckIcon, HeartIcon } from '@heroicons/react/24/solid';

export const SKILL_TYPES = [
  { id: 'Ataque', label: 'Ataque', icon: SparklesIcon },
  { id: 'Suporte', label: 'Suporte', icon: ShieldCheckIcon },
  { id: 'Cura', label: 'Cura/Purificação', icon: HeartIcon }
];

export const ACTION_TYPES = [
  'Ação Maior',
  'Ação Menor',
  'Reação',
  'Nenhuma',
];