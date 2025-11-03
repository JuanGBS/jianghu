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

export const FIGHTING_STYLES = [
  { id: 'lâmina', name: 'Caminho da Lâmina' },
  { id: 'lança', name: 'Caminho da Lança' },
  { id: 'sombra', name: 'Caminho da Sombra' },
  { id: 'punho', name: 'Caminho do Punho' },
  { id: 'instrumentalista', name: 'Caminho do Instrumentalista' },
  { id: 'arco', name: 'Caminho do Arco' },
];

export const ATTRIBUTE_PERICIAS = {
  vigor: ['Resistência', 'Atletismo'],
  agility: ['Acrobacia', 'Furtividade', 'Prestidigitação', 'Reflexo'],
  discipline: ['Meditação', 'Força de Vontade', 'Controle do Chi'],
  comprehension: ['Conhecimento do Jianghu', 'Análise Tática', 'Percepção', 'Estratégia'],
  presence: ['Persuasão', 'Liderança', 'Performance', 'Etiqueta Social', 'Intimidação', 'Intuição'],
};

export const BODY_REFINEMENT_LEVELS = [
  { id: 0, name: 'Nenhum', multiplier: 1 },
  { id: 1, name: 'Nível 1: Pele de Ferro', multiplier: 1.2 },
  { id: 2, name: 'Nível 2: Ossos de Aço', multiplier: 1.5 },
  { id: 3, name: 'Nível 3: Coração Inabalável', multiplier: 1.8 },
  { id: 4, name: 'Nível 4: Músculos de Dragão', multiplier: 2.2 },
  { id: 5, name: 'Nível 5: Forja Dourada', multiplier: 2.8 },
  { id: 6, name: 'Nível 6: Vasculho Indestrutível', multiplier: 3.5 },
];

export const CULTIVATION_LEVELS = [
  { id: 0, name: 'Nenhum', description: 'Ainda não iniciou a jornada.' },
  { id: 1, name: 'Inicial', description: 'Acesso a novas técnicas.' },
  { id: 2, name: 'Intermediário', description: 'Aumenta Pontos de Chi Máximos em +5.' },
  { id: 3, name: 'Especialista', description: 'Ganha um ponto para aumentar um atributo.' },
];