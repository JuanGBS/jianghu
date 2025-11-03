export const CLANS_DATA = {
  wang: {
    id: 'wang',
    name: 'Wáng (王)',
    description: 'O Caminho da Pedra e do Cedro...',
    attributeBonus: { presence: 2, vigor: 1 },
    baseHp: 8,
    proficientPericias: ['Liderança', 'Etiqueta Social'],
    passiveAbility: {
      name: 'Autoridade',
      description: 'Sua presença inquestionável emana uma aura de poder. Você ganha Vantagem em testes de Intimidação contra oponentes com Nível de Cultivo inferior ao seu.'
    }
  },
  ming: {
    id: 'ming',
    name: 'Míng (明)',
    description: 'O Caminho do Trovão Sutil...',
    attributeBonus: { comprehension: 2, agility: 1 },
    baseHp: 8,
    proficientPericias: ['Análise Tática', 'Furtividade'],
    passiveAbility: {
      name: 'Olhar de Jade',
      description: 'Sua percepção é tão aguçada que você nota detalhes que outros ignoram. Você ganha Vantagem em testes de Percepção para detectar objetos escondidos ou perigos.'
    }
  },
  sun: {
    id: 'sun',
    name: 'Sūn (孙)',
    description: 'O Caminho do Salgueiro...',
    attributeBonus: { vigor: 2, discipline: 1 },
    baseHp: 12,
    proficientPericias: ['Resistência', 'Força de Vontade'],
    passiveAbility: {
      name: 'Espírito Inabalável',
      description: 'Sua tolerância à dor é extraordinária. Você ganha Vantagem em testes de Resistência contra efeitos de fadiga e dano persistente.'
    }
  },
  zhu: {
    id: 'zhu',
    name: 'Zhū (朱)',
    description: 'O Caminho do Sábio Estrategista...',
    attributeBonus: { discipline: 2, comprehension: 1 },
    baseHp: 6,
    proficientPericias: ['Controle do Chi', 'Estratégia e Tática'],
    passiveAbility: {
      name: 'Mente de Dragão',
      description: 'Sua conexão com o Chi é profunda e inabalável. Você ganha Vantagem em todos os Testes de Chi (cultivo, técnicas ou resistir a influências mentais).'
    }
  },
};