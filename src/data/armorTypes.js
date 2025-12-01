export const ARMOR_TYPES = [
  {
    id: 'none',
    name: 'Nenhuma',
    effects: {
      mode: 'agility',
      baseValue: 10,
      skillPenalty: 0 
    }
  },
  {
    id: 'light', 
    name: 'Leve',
    effects: {
      mode: 'agility', 
      baseValue: 10,
      skillPenalty: 0
    }
  },
  {
    id: 'medium',
    name: 'Média',
    effects: {
      mode: 'fixed',
      baseValue: 14, 
      skillPenalty: -2
    }
  },
  {
    id: 'heavy',
    name: 'Pesada',
    effects: {
      mode: 'fixed',
      baseValue: 16, 
      skillPenalty: -4 
    }
  }
];