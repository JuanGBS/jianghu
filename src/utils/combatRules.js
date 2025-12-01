import { parseDiceString, rollDice } from './dice';
import { WEAPONS_LIST } from '../data/weapons'; // <--- 1. Importar a lista oficial

// Normaliza a categoria
export const normalizeCategory = (category) => {
    if (!category) return 'normal';
    const cat = category.toLowerCase().trim();
    
    if (cat === 'p' || cat.includes('pesada') || cat.includes('heavy')) return 'pesada';
    if (cat === 'l' || cat.includes('leve') || cat.includes('light')) return 'leve';
    if (cat === 'm' || cat.includes('media') || cat.includes('medium')) return 'media';
    
    return 'normal';
};

export const calculateAttackDamage = (character, equippedWeapon, isCrit) => {
    // --- 2. LÓGICA DE FONTE ÚNICA DE VERDADE ---
    // Tenta encontrar a arma na lista oficial pelo nome exato
    const officialWeapon = WEAPONS_LIST.find(w => w.name === equippedWeapon.name);
    
    // Se achar a arma oficial, usa os status dela. Se não, usa o que está na ficha (Custom)
    const weaponData = officialWeapon ? {
        ...equippedWeapon, // Mantém propriedades extras se houver
        damage: officialWeapon.damage,
        category: officialWeapon.category,
        attribute: officialWeapon.allowedAttributes[0] // Usa o atributo padrão da arma oficial
    } : equippedWeapon;
    // ----------------------------------------------------

    // 1. Dados da Arma (Usando os dados higienizados acima)
    const damageStr = weaponData.damage || '1d4';
    const category = normalizeCategory(weaponData.category);
    
    // Normalização do atributo
    let attrKey = (weaponData.attribute || 'agility').toLowerCase();
    const attrMap = { 
        'agilidade': 'agility', 
        'vigor': 'vigor', 
        'força': 'vigor',
        'presença': 'presence', 
        'disciplina': 'discipline', 
        'compreensão': 'comprehension' 
    };
    if (attrMap[attrKey]) attrKey = attrMap[attrKey];

    // 2. Configuração do Dado
    const diceConfig = parseDiceString(damageStr);

    // 3. Regra de Crítico (PDF Pág. 21)
    let multiplier = 1;
    if (isCrit) {
        multiplier = (category === 'pesada') ? 3 : 2;
    }

    const count = diceConfig.count * multiplier;

    // 4. Bônus de Atributo
    let attributeBonus = 0;
    if (character && character.attributes) {
        attributeBonus = character.attributes[attrKey] || 0;
    }

    const finalBonus = diceConfig.modifier + attributeBonus;

    // 5. Rolagem
    const { total, rolls } = rollDice(count, diceConfig.faces);
    const finalTotal = total + finalBonus;

    // 6. Formatação
    const critLabel = isCrit ? (multiplier === 3 ? " (CRÍTICO DEVASTADOR x3!)" : " (Crítico x2!)") : "";
    const bonusStr = finalBonus !== 0 ? (finalBonus > 0 ? ` + ${finalBonus}` : ` - ${Math.abs(finalBonus)}`) : '';
    
    const message = `Dano: **${finalTotal}** [${rolls.join('+')}${bonusStr}]${critLabel}`;

    return {
        total: finalTotal,
        rolls: rolls,
        bonus: finalBonus,
        multiplier: multiplier,
        isCrit: isCrit,
        message: message
    };
};