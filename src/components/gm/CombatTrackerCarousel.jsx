import React from 'react';
import { 
  HeartIcon, BoltIcon, ShieldCheckIcon, ClockIcon, UserIcon 
} from '@heroicons/react/24/solid';
import QuickStatInput from '../ui/QuickStatInput';

// Importações de Dados para cálculo de status
import { CLANS_DATA } from '../../data/clans';
import { ARMOR_TYPES } from '../../data/armorTypes';
import { BODY_REFINEMENT_LEVELS, CULTIVATION_STAGES, MASTERY_LEVELS } from '../../data/gameData';
import { INNATE_BODIES } from '../../data/innateBodies';

function CombatTrackerCarousel({ 
  turnOrder, 
  currentIdx, 
  combatStatus, 
  allCharacters, // Array combinado de characters + allNpcs
  onStatChange, 
  onAttackClick 
}) {

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-4">
      <div className="flex gap-4 min-w-max px-1">
        {turnOrder.map((participant, idx) => {
          const isTurn = idx === currentIdx && combatStatus === 'active';
          const realData = allCharacters.find(c => c.id === participant.character_id);
          const rawStats = realData?.stats || {};

          // --- Lógica de Cálculo de Stats (Com Bônus de GM) ---
          const calculateDynamicStats = () => {
            if (!realData) return { calcMaxHp: 10, calcMaxChi: 10, calcAC: 10 };
            
            const inventory = realData.inventory || { armor: { type: 'none' } };
            const attributes = realData.attributes || { vigor: 0, agility: 0, discipline: 0 };
            const clan = CLANS_DATA[realData.clanId] || { baseHp: 5 };
            
            // CORREÇÃO: Nome da variável padronizado para innateBodyData
            const innateBodyData = INNATE_BODIES.find(b => b.id === realData.innateBodyId) || { effects: {} };
            
            // 1. Recupera Bônus
            const bonusMaxHp = rawStats.bonusMaxHp || 0;
            const bonusMaxChi = rawStats.bonusMaxChi || 0;
            const bonusAC = rawStats.bonusArmorClass || 0;

            // 2. Cálculos Base
            // CA
            const armorType = inventory.armor?.type || 'none';
            const selectedArmor = ARMOR_TYPES.find(a => a.id === armorType) || ARMOR_TYPES.find(a => a.id === 'none');
            
            let baseAC = 10;
            if (selectedArmor.effects.mode === 'fixed') {
                baseAC = selectedArmor.effects.baseValue;
            } else {
                baseAC = 10 + attributes.agility;
            }

            // HP
            const baseHp = (clan.baseHp || 5) + (innateBodyData.effects?.stat_bonus?.baseHp || 0);
            const refLevel = BODY_REFINEMENT_LEVELS.find(l => l.id === (realData.bodyRefinementLevel || 0));
            const refMult = (refLevel?.multiplier || 1) + (innateBodyData.effects?.body_refinement_multiplier_bonus || 0);
            const calculatedHp = Math.floor(((baseHp + attributes.vigor) * refMult));

            // Chi
            const baseChi = 5 + attributes.discipline;
            const cultStage = CULTIVATION_STAGES.find(s => s.id === (realData.cultivationStage || 0));
            const cultMult = cultStage?.multiplier || 1;
            const masteryBonus = MASTERY_LEVELS.find(l => l.id === (realData.masteryLevel || 0))?.bonus || 0;
            
            // CORREÇÃO: Agora usa a variável correta definida acima
            const innateChiPerMastery = innateBodyData.effects?.max_chi_per_mastery || 0;
            
            const masteryChiBonus = masteryBonus + ((realData.masteryLevel || 0) * innateChiPerMastery);
            const calculatedChi = Math.floor((baseChi * cultMult) + masteryChiBonus);

            // 3. Aplicação da Prioridade: (Manual OU Calculado) + Bônus
            
            // Se tiver valor manual salvo, usa ele como base. Se não, usa o calculado.
            const effectiveBaseHp = (rawStats.manualMaxHp !== undefined && rawStats.manualMaxHp !== null) ? rawStats.manualMaxHp : calculatedHp;
            const effectiveBaseChi = (rawStats.manualMaxChi !== undefined && rawStats.manualMaxChi !== null) ? rawStats.manualMaxChi : calculatedChi;
            const effectiveBaseAC = (rawStats.manualArmorClass !== undefined && rawStats.manualArmorClass !== null) ? rawStats.manualArmorClass : baseAC;

            // Soma os bônus no final
            return { 
                calcMaxHp: effectiveBaseHp + bonusMaxHp, 
                calcMaxChi: effectiveBaseChi + bonusMaxChi, 
                calcAC: effectiveBaseAC + bonusAC 
            };
          };

          const { calcMaxHp, calcMaxChi, calcAC } = calculateDynamicStats();

          // Objeto final para renderização
          const stats = {
              currentHp: rawStats.currentHp || 0,
              currentChi: rawStats.currentChi || 0,
              maxHp: calcMaxHp,
              maxChi: calcMaxChi,
              armorClass: calcAC
          };

          return (
            <div 
              key={idx} 
              className={`flex-shrink-0 w-72 bg-white rounded-xl shadow-md border-2 transition-all overflow-hidden ${
                isTurn ? 'border-green-500 ring-4 ring-green-100 z-10 transform scale-[1.02]' : 'border-gray-200 opacity-90'
              }`}
            >
              {/* Cabeçalho do Card */}
              <div className={`p-3 flex items-center gap-3 border-b ${isTurn ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className="w-10 h-10 rounded-lg bg-gray-300 overflow-hidden flex-shrink-0 border border-gray-200">
                  {participant.image_url ? (
                    <img src={participant.image_url} className="w-full h-full object-cover" alt={participant.name} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400"><UserIcon className="h-6 w-6" /></div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-gray-800 truncate text-sm">{participant.name}</h4>
                  <div className="flex items-center text-[10px] text-gray-500 gap-2 mt-0.5">
                    <span className="flex items-center bg-gray-200 px-1.5 py-0.5 rounded">
                      <ClockIcon className="h-3 w-3 mr-1"/> {participant.initiative ?? '-'}
                    </span>
                    {participant.is_npc && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold border border-red-200">NPC</span>}
                  </div>
                </div>
                {isTurn && <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">ATIVO</div>}
              </div>

              {/* Status do Card */}
              <div className="p-3 space-y-2">
                <div className="flex justify-between items-center px-1">
                  {/* HP */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-green-700 font-bold">
                      <HeartIcon className="h-4 w-4" />
                      <QuickStatInput 
                          value={stats.currentHp} 
                          maxValue={stats.maxHp}
                          onSave={(val) => onStatChange(participant.character_id, 'currentHp', val)} 
                          className="w-8 text-center border-b border-green-300 bg-transparent text-sm"
                      />
                    </div>
                    <span className="text-gray-400 text-[10px] font-semibold">/ {stats.maxHp}</span>
                  </div>

                  {/* Chi */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-blue-600 font-bold">
                      <BoltIcon className="h-4 w-4" />
                      <QuickStatInput 
                          value={stats.currentChi} 
                          maxValue={stats.maxChi}
                          onSave={(val) => onStatChange(participant.character_id, 'currentChi', val)} 
                          className="w-8 text-center border-b border-blue-300 bg-transparent text-sm"
                      />
                    </div>
                    <span className="text-gray-400 text-[10px] font-semibold">/ {stats.maxChi}</span>
                  </div>

                  {/* CA */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-red-600 font-bold">
                      <ShieldCheckIcon className="h-4 w-4" />
                      <span className="text-sm">{stats.armorClass}</span>
                    </div>
                    <span className="text-gray-400 text-[10px] font-semibold">CA</span>
                  </div>
                </div>

                <button 
                  onClick={() => onAttackClick(participant.character_id)} 
                  className="w-full mt-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  <BoltIcon className="h-3 w-3" /> Ação Rápida
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CombatTrackerCarousel;