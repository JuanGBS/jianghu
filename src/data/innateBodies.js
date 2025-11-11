export const INNATE_BODIES = [
  {
    id: 'none',
    name: 'Nenhum / Não Rolou',
    description: 'Um físico comum, sem bônus ou penalidades inatas.',
    effects: {}
  },
  {
    id: 'dao_body',
    name: 'Corpo Inato do Dao',
    description: 'O corpo de um predestinado.',
    effects: {}
  },
  {
    id: 'divine_furnace_body',
    name: 'Corpo da Fornalha Divina',
    description: 'Você absorve e refina a energia externa. Vantagem: A cada vez que sofre dano de Chi de um oponente, você recupera 1 PC.',
    effects: { passive: 'recupera_chi' }
  },
  {
    id: 'world_tribulation_body',
    name: 'Corpo da Tribulação Mundial',
    description: 'Seu corpo atrai e resiste à adversidade. Vantagem: Custo de Chi reduzido em -1 PC para todas as técnicas de Suporte ☯️ e ganha +1 em testes de Resistência.',
    effects: { skill_bonus: { 'Resistência': 1 }, technique_cost_reduction: { type: 'Suporte', amount: 1 } }
  },
  {
    id: 'dual_yin_yang_physique',
    name: 'Físico Yin-Yang Duplo',
    description: 'Afinidade com Chi oposto. Vantagem: Pode aprender técnicas de Chi de dois elementos opostos sem penalidade, e ganha +1 em um atributo de sua escolha.',
    effects: { attribute_choice: 1 }
  },
  {
    id: 'dragon_phoenix_physique',
    name: 'Físico do Dragão-Fênix',
    description: 'Corpo com potencial lendário. Vantagem: Ao subir de Nível de Refino Corporal, o multiplicador aumenta em +0.1 adicional.',
    effects: { body_refinement_multiplier_bonus: 0.1 }
  },
  {
    id: 'poisonous_widow_body',
    name: 'Corpo Venenoso',
    description: 'Vantagem: Imunidade a todos os venenos não-míticos. Desvantagem: Seu toque físico é tóxico; aliados tratados com seu Chi (Cura/Purificação 🌱) perdem 1 PV no processo.',
    effects: { is_poison_immune: true, passive: 'toque_toxico' }
  },
  {
    id: 'chaotic_chi_vessel',
    name: 'Vaso de Chi Caótico',
    description: 'Seu Chi é abundante, mas difícil de controlar. Vantagem: Ganha +2 PC Máximo por nível de Maestria. Desvantagem: -1 em testes de Controle do Chi.',
    effects: { skill_bonus: { 'Controle do Chi': -1 }, max_chi_per_mastery: 2 }
  },
  {
    id: 'spectral_body',
    name: 'Corpo Espectral',
    description: 'Sua conexão com o corpo é fraca, mas o espírito é forte. Vantagem: Ganha +2 em testes de Força de Vontade. Desvantagem: O PV Base do Clã é reduzido em -2.',
    effects: { skill_bonus: { 'Força de Vontade': 2 }, stat_bonus: { baseHp: -2 } }
  },
  {
    id: 'cold_blood_physique',
    name: 'Físico de Sangue Frio',
    description: 'Sua vitalidade é lenta e difícil de estimular. Vantagem: Ganha +1 em testes de Resistência. Desvantagem: -2 em todos os testes de Iniciativa.',
    effects: { skill_bonus: { 'Resistência': 1 }, initiative_penalty: -2 }
  },
  {
    id: 'fragile_vessel',
    name: 'Vaso Frágil',
    description: 'Desvantagem: Sofre -1 em todos os testes de Resistência e tem o PV Base do Clã reduzido em -1.',
    effects: { skill_bonus: { 'Resistência': -1 }, stat_bonus: { baseHp: -1 } }
  },
  {
    id: 'common_body',
    name: 'Corpo Comum',
    description: 'Um físico comum, com potencial médio. Não há bônus ou penalidades.',
    effects: {}
  },
  {
    id: 'bad_affinity',
    name: 'Afinidade Ruim',
    description: 'Seu Chi é naturalmente disperso. Desvantagem: Custo de Chi de todas as técnicas aumenta em +1 PC (mínimo 2 PC).',
    effects: { technique_cost_increase: 1 }
  },
  {
    id: 'cursed_physique',
    name: 'Físico Amaldiçoado',
    description: 'Você carrega um fardo cármico. (Efeitos a critério do Mestre de Jogo)',
    effects: {}
  }
];