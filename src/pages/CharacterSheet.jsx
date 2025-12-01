import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { CLANS_DATA } from '../data/clans';
import { ARMOR_TYPES } from '../data/armorTypes';
import { BODY_REFINEMENT_LEVELS, CULTIVATION_STAGES, MASTERY_LEVELS, ATTRIBUTE_PERICIAS } from '../data/gameData';
import { INNATE_BODIES } from '../data/innateBodies';
import characterArt from '../assets/character-art.png';
import { ATTRIBUTE_TRANSLATIONS } from '../data/translations';
import TechniquesPage from '../components/character-sheet/TechniquesPage';
import ProgressionPage from '../components/character-sheet/ProgressionPage';
import InventoryPage from './InventoryPage';
import SheetNavigation from '../components/character-sheet/SheetNavigation';
import EditableStat from '../components/ui/EditableStat';
import Modal from '../components/ui/Modal';
import TechniqueCreatorForm from '../components/character-sheet/TechniqueCreatorForm';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import RollTestModal from '../components/character-sheet/RollTestModal';
import { PhotoIcon, StarIcon, ArrowUturnLeftIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import CombatPage from './CombatPage';
import AttackChoiceModal from '../components/character-sheet/AttackChoiceModal';
import MinorActionModal from '../components/character-sheet/MinorActionModal';
import { useAuth } from '../context/AuthContext';
import QuickStatInput from '../components/ui/QuickStatInput.jsx';

function CharacterSheet({ character, onDelete, onUpdateCharacter, showNotification, addRollToHistory, onOpenImageTray, onTrain, onBack, combatData, onEndTurn, isGmMode = false, onForceRefresh }) {
  const { signOut } = useAuth();
  const clan = CLANS_DATA[character.clanId] || { name: 'Clã Desconhecido', baseHp: 5, passiveAbility: { name: '-', description: '-' } };
  const innateBodyData = INNATE_BODIES.find(body => body.id === character.innateBodyId) || { effects: {} };

  const [activeTab, setActiveTab] = useState('sheet');
  const [editingTechnique, setEditingTechnique] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rollModalData, setRollModalData] = useState(null);
  const [hoveredAttribute, setHoveredAttribute] = useState(null);
  const hoverTimeoutRef = useRef(null);
  
  const [combatState, setCombatState] = useState({ actionsUsed: { movement: false, major: false, minor: false }, isConcentrated: false });
  const [isAttackModalOpen, setIsAttackModalOpen] = useState(false);
  const [isMinorActionModalOpen, setIsMinorActionModalOpen] = useState(false);

  // ------------------------------------------------------------------
  // CÁLCULOS DE STATUS (HP, CHI, CA)
  // ------------------------------------------------------------------
  const inventory = character.inventory || { armor: { type: 'none' } };
  const armorType = inventory.armor?.type || 'none';
  const selectedArmor = ARMOR_TYPES.find(a => a.id === armorType) || ARMOR_TYPES.find(a => a.id === 'none');
  
  // HP
  const initialClanHp = CLANS_DATA[character.clanId]?.baseHp || 0;
  const innateHpBonus = innateBodyData.effects?.stat_bonus?.baseHp || 0;
  const effectiveBaseHp = initialClanHp + innateHpBonus;
  const refinementLevel = BODY_REFINEMENT_LEVELS.find(l => l.id === (character.bodyRefinementLevel || 0));
  const refinementMultiplierBonus = innateBodyData.effects?.body_refinement_multiplier_bonus || 0;
  const finalRefinementMultiplier = (refinementLevel?.multiplier || 1) + (refinementLevel && refinementLevel.id > 0 ? refinementMultiplierBonus : 0);
  const calcMaxHp = Math.floor((effectiveBaseHp + character.attributes.vigor) * finalRefinementMultiplier);
  
  // Chi
  const baseChi = 5 + character.attributes.discipline;
  const cultivationMultiplier = CULTIVATION_STAGES.find(s => s.id === (character.cultivationStage || 0))?.multiplier || 1;
  const masteryLevelValue = character.masteryLevel || 0;
  const masteryFlatBonus = MASTERY_LEVELS.find(l => l.id === masteryLevelValue)?.bonus || 0;
  const innateChiPerMastery = innateBodyData.effects?.max_chi_per_mastery || 0;
  const calcMaxChi = Math.floor(baseChi * cultivationMultiplier) + masteryFlatBonus + (masteryLevelValue * innateChiPerMastery);
  
  // CA
  let calcArmorClass = 10; 
  let skillPenalty = 0; 

  if (selectedArmor) {
    skillPenalty = selectedArmor.effects.skillPenalty || 0;
    if (selectedArmor.effects.mode === 'fixed') {
       calcArmorClass = selectedArmor.effects.baseValue;
    } else {
       calcArmorClass = 10 + character.attributes.agility;
    }
  }

  const finalMaxHp = (isGmMode && character.stats.manualMaxHp) ? character.stats.manualMaxHp : calcMaxHp;
  const finalMaxChi = (isGmMode && character.stats.manualMaxChi) ? character.stats.manualMaxChi : calcMaxChi;
  const finalArmorClass = (isGmMode && character.stats.manualArmorClass) ? character.stats.manualArmorClass : calcArmorClass;

  // ------------------------------------------------------------------
  // LÓGICA DE TURNO (CORRIGIDA)
  // ------------------------------------------------------------------
  const currentTurnCharacter = combatData?.status === 'active' && combatData.turn_order ? combatData.turn_order[combatData.current_turn_index] : null;
  const isMyTurn = currentTurnCharacter?.character_id === character.id;
  
  // REF para evitar spam de notificação (Correção do Tooltip travado)
  const lastNotifiedTurnIndex = useRef(null);

  useEffect(() => {
    // Só roda a lógica se for meu turno E se o índice do turno mudou desde a última vez que avisei
    if (isMyTurn && combatData?.current_turn_index !== lastNotifiedTurnIndex.current) {
      
      setCombatState({ actionsUsed: { movement: false, major: false, minor: false }, isConcentrated: false });
      setActiveTab('combat');
      showNotification("É o seu turno! Ações renovadas.", "success");
      
      // Atualiza o ref para não avisar de novo até o próximo turno real
      lastNotifiedTurnIndex.current = combatData?.current_turn_index;
    }
  }, [isMyTurn, combatData?.current_turn_index, showNotification]);

  const handleActionUsed = (actionType) => {
    setCombatState(prevState => ({ ...prevState, actionsUsed: { ...prevState.actionsUsed, [actionType]: true } }));
  };

  const handleNewTurn = () => {
    setCombatState({ actionsUsed: { movement: false, major: false, minor: false }, isConcentrated: false });
    showNotification("Ações resetadas manualmente.", "success");
  };

  // ------------------------------------------------------------------
  // HANDLERS E CRUD
  // ------------------------------------------------------------------
  const calculateRollParams = (rawAttribute) => {
    let attrKey = (rawAttribute || 'agility').toLowerCase();
    const map = { 'agilidade': 'agility', 'vigor': 'vigor', 'presença': 'presence', 'disciplina': 'discipline', 'compreensão': 'comprehension', 'compreensao': 'comprehension' };
    if (map[attrKey]) attrKey = map[attrKey];
    let bonus = character.attributes[attrKey] || 0;
    if (character.proficientAttribute === attrKey) bonus *= 2;
    return { bonus, label: ATTRIBUTE_TRANSLATIONS[attrKey] || attrKey };
  };

  const handleSelectAttackAction = (type, data) => {
    const { bonus, label } = calculateRollParams(data.attribute);
    let rollData = {};
    let damageFormula = null;
    let weaponCategory = null;

    if (type === 'weapon') {
        damageFormula = data.damage || '1d4';
        weaponCategory = data.category; 
    } else if (type === 'technique') {
        damageFormula = data.damage; 
    }

    switch(type) {
      case 'weapon': rollData = { title: `Ataque com ${data.name}`, modifier: bonus, modifierLabel: label }; break;
      case 'technique': rollData = { title: `Técnica: ${data.name}`, modifier: bonus, modifierLabel: label }; break;
      case 'maneuver': rollData = { title: `Manobra: ${data.name}`, modifier: bonus, modifierLabel: ATTRIBUTE_TRANSLATIONS[data.attribute] || data.attribute }; break;
      default: return;
    }
    
    if (combatState.isConcentrated) {
      rollData.mode = 'advantage';
      showNotification("Ataque com Vantagem (Concentração)!", "success");
    }

    rollData.metaDamageFormula = damageFormula; 
    rollData.weaponCategory = weaponCategory;
    rollData.metaDamageBonus = bonus; 

    rollData.onRollConfirmed = () => {
      handleActionUsed('major');
      setCombatState(prevState => ({ ...prevState, isConcentrated: false }));
    };
    openRollModal(rollData);
  };

  const handleSelectMinorAction = (data) => {
    if (data.isTechnique) {
        const shouldRoll = data.requiresRoll === true;
        if (shouldRoll) {
             const { bonus, label } = calculateRollParams(data.attribute);
             openRollModal({ 
                title: `Técnica (Menor): ${data.name}`, 
                modifier: bonus, 
                modifierLabel: label,
                metaDamageFormula: data.damage, 
                metaDamageBonus: bonus,
                onRollConfirmed: () => handleActionUsed('minor') 
            });
        } else {
            handleActionUsed('minor');
            showNotification(`Técnica "${data.name}" utilizada!`, 'success');
        }
        return;
    }
    if (data.id === 'second_attack') {
      const weapon = character.inventory.weapon;
      const { bonus, label } = calculateRollParams('agility');
      const damageFormula = weapon.damage || '1d4';
      openRollModal({ 
          title: `Segundo Ataque (${weapon.name})`, 
          modifier: bonus, 
          modifierLabel: label, 
          metaDamageFormula: damageFormula, 
          metaDamageBonus: bonus,
          onRollConfirmed: () => handleActionUsed('minor') 
      });
      return;
    }
    if (data.id === 'focused_attack') {
      setCombatState(prevState => ({ ...prevState, isConcentrated: true }));
      handleActionUsed('minor');
      showNotification('Concentrado! Próximo ataque com Vantagem.', 'success');
      return;
    }
    if (data.rollable) {
      const { bonus, label } = calculateRollParams(data.attribute);
      openRollModal({ 
          title: `Teste de ${data.skill || 'Atributo'}`, 
          modifier: bonus, 
          modifierLabel: label, 
          onRollConfirmed: () => handleActionUsed('minor') 
      });
      return;
    } 
    handleActionUsed('minor');
    showNotification(`Ação "${data.name}" realizada!`, 'success');
  };

  const handleStatChange = (statKey, newValue) => {
    const validatedValue = Math.max(0, newValue);
    const updatedCharacter = { ...character, stats: { ...character.stats, [statKey]: validatedValue } };
    onUpdateCharacter(updatedCharacter);
  };
  
  const handleManualStatEdit = (statKey, newValue) => {
      if (!isGmMode) return;
      const val = parseInt(newValue);
      if (!isNaN(val)) {
          const newStats = { ...character.stats, [statKey]: val };
          onUpdateCharacter({ ...character, stats: newStats });
      }
  };
  
  const handleAttributeEdit = (attrKey, newValue) => {
    if (!isGmMode) return;
    const val = parseInt(newValue);
    if (!isNaN(val)) {
        const newAttributes = { ...character.attributes, [attrKey]: val };
        onUpdateCharacter({ ...character, attributes: newAttributes });
    }
  };

  const handleTechniquesUpdate = async (techniqueData) => {
    try {
        if (editingTechnique) {
            const { data, error } = await supabase.from('techniques').update(techniqueData).eq('id', editingTechnique.technique.id).select().single();
            if (error) throw error;
            const newTechniques = character.techniques.map(t => t.id === editingTechnique.technique.id ? { ...t, ...mapTechFromDB(data) } : t);
            onUpdateCharacter({ ...character, techniques: newTechniques });
            showNotification('Técnica atualizada!', 'success');
        } else {
            const { data, error } = await supabase.from('techniques').insert(techniqueData).select().single();
            if (error) throw error;
            const newTechniques = [...(character.techniques || []), mapTechFromDB(data)];
            onUpdateCharacter({ ...character, techniques: newTechniques });
            showNotification('Técnica criada!', 'success');
        }
    } catch (err) {
        console.error(err);
        showNotification('Erro ao salvar técnica.', 'error');
    }
  };
  
  const mapTechFromDB = (t) => ({
      id: t.id, name: t.name, type: t.type, action: t.action, cost: t.cost, damage: t.damage, attribute: t.attribute, effect: t.effect, requirements: t.requirements, requiresRoll: t.requires_roll, concentration: t.concentration
  });

  const handleTechniqueDelete = async (indexToDelete) => {
    const techToDelete = character.techniques[indexToDelete];
    if (!techToDelete || !techToDelete.id) return;
    try {
        const { error } = await supabase.from('techniques').delete().eq('id', techToDelete.id);
        if (error) throw error;
        const updatedTechniques = character.techniques.filter((_, index) => index !== indexToDelete);
        onUpdateCharacter({ ...character, techniques: updatedTechniques });
        showNotification('Técnica removida.', 'success');
    } catch (err) {
        console.error(err);
        showNotification('Erro ao remover técnica.', 'error');
    }
  };

  const openCreateModal = () => setIsCreating(true);
  const openEditModal = (technique, index) => setEditingTechnique({ technique, index });
  const closeFormModal = () => { setIsCreating(false); setEditingTechnique(null); };
  const handleConfirmDelete = () => { onDelete(); setIsDeleteModalOpen(false); };
  
  const openRollModal = (data) => setRollModalData(data);
  const closeRollModal = () => setRollModalData(null);
  
  const handleMouseEnter = (attributeKey) => { clearTimeout(hoverTimeoutRef.current); setHoveredAttribute(attributeKey); };
  const handleMouseLeave = () => { hoverTimeoutRef.current = setTimeout(() => { setHoveredAttribute(null); }, 200); };

  const isFormModalOpen = isCreating || editingTechnique !== null;
  const anyModalIsOpen = isFormModalOpen || isDeleteModalOpen || rollModalData !== null || isAttackModalOpen || isMinorActionModalOpen;

  // ------------------------------------------------------------------
  // RENDERIZAÇÃO
  // ------------------------------------------------------------------
  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
      <div className="flex justify-between items-center">
        {onBack && (
          <button onClick={onBack} className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 font-semibold mb-8">
            <ArrowUturnLeftIcon className="h-6 w-6" />
            <span>Voltar ao Painel</span>
          </button>
        )}
        <h1 className={`text-6xl font-bold text-center text-brand-primary mb-10 ${onBack ? 'w-full' : 'w-full text-center'}`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
          {isGmMode ? <span className="text-purple-600 flex items-center justify-center gap-2"><PencilSquareIcon className="h-10 w-10"/> Editando NPC: {character.name}</span> : 'Tales of Jianghu'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        
        {/* COLUNA 1: ATRIBUTOS */}
        <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-lg space-y-4 w-full self-start">
            <div><h2 className="text-4xl font-bold text-brand-text">{character.name}</h2><p className="text-lg text-gray-500">{clan.name}</p></div>
            <hr />
            <div>
            <h3 className="text-xl font-semibold text-brand-text flex justify-between items-center">
                Atributos Finais
                {isGmMode && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded border border-yellow-200">Modo Edição</span>}
            </h3>
            <div className="space-y-2 mt-3">
              {Object.entries(character.attributes).map(([key, value]) => {
                const isProficient = character.proficientAttribute === key;
                let attributeBonus = isProficient ? value * 2 : value;
                
                const armorPenalty = (key === 'agility') ? skillPenalty : 0;
                
                return (
                  <div key={key} className="relative" onMouseEnter={() => handleMouseEnter(key)} onMouseLeave={handleMouseLeave}>
                    <div className={`w-full flex justify-between items-center p-3 rounded-lg transition-colors ${ isProficient ? 'bg-purple-100 hover:bg-purple-200' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      <div className="flex items-center space-x-2">
                        {isProficient && <StarIcon className="h-5 w-5 text-yellow-500" />}
                        <span className="font-bold text-gray-700">{ATTRIBUTE_TRANSLATIONS[key]}</span>
                      </div>
                      {isGmMode ? (
                          <QuickStatInput value={value} onSave={(val) => handleAttributeEdit(key, val)} className="w-16 text-right text-2xl font-bold text-purple-700 bg-transparent" />
                      ) : (
                          <button className="text-2xl font-bold text-purple-700 hover:scale-110 transition-transform" onClick={() => openRollModal({ title: `Teste de ${ATTRIBUTE_TRANSLATIONS[key]}`, modifier: attributeBonus, modifierLabel: ATTRIBUTE_TRANSLATIONS[key] })}>
                            {value}
                          </button>
                      )}
                    </div>
                     <div className={`absolute left-full top-0 ml-4 w-64 bg-white p-4 rounded-lg shadow-xl border z-[60] transition-all duration-200 ${hoveredAttribute === key ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                      <h5 className="font-bold text-brand-text border-b pb-2 mb-2">Perícias de {ATTRIBUTE_TRANSLATIONS[key]}</h5>
                      <div className="space-y-1 text-sm">
                        {(ATTRIBUTE_PERICIAS[key] || []).map(periciaName => {
                          const skillBonusFromInnate = innateBodyData.effects?.skill_bonus?.[periciaName] || 0;
                          const totalBonus = attributeBonus + skillBonusFromInnate + armorPenalty;
                          return (
                            <button key={periciaName} onClick={() => openRollModal({ title: `Teste de ${periciaName}`, modifier: totalBonus, modifierLabel: 'Bônus Total' })} className="flex justify-between w-full text-left px-2 py-1 rounded hover:bg-gray-100">
                              <span className="text-gray-600">
                                {periciaName} 
                                {armorPenalty !== 0 && <span className="text-xs text-red-500 ml-1">({armorPenalty})</span>}
                              </span>
                              <span className={`font-bold ${totalBonus < 0 ? 'text-red-600' : 'text-purple-700'}`}>
                                {totalBonus >= 0 ? '+' : ''}{totalBonus}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUNA 2: IMAGEM */}
        <div className="lg:col-span-1 flex items-center justify-center self-start">
          <div className="relative group w-full max-w-sm mx-auto aspect-[3/4] bg-gray-100 rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <img src={character.imageUrl || characterArt} alt={`Arte de ${character.name}`} className="w-full h-full object-cover object-center" />
            <button onClick={onOpenImageTray} className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <PhotoIcon className="h-12 w-12 mb-2" /><span className="font-semibold">Abrir Galeria</span>
            </button>
          </div>
        </div>
        
        {/* COLUNA 3: CONTEÚDO DINÂMICO (CORRIGIDO: Removida a função interna) */}
        <div className="lg:col-span-1 w-full self-start flex flex-col space-y-6">
            
            {/* COMPONENTES DE ABAS - Renderização Condicional Direta para evitar Remount */}
            {activeTab === 'techniques' && (
                <TechniquesPage character={character} onDeleteTechnique={handleTechniqueDelete} openCreateModal={openCreateModal} openEditModal={openEditModal} />
            )}
            
            {activeTab === 'inventory' && (
                <InventoryPage character={character} onUpdateCharacter={onUpdateCharacter} isGmMode={isGmMode} />
            )}
            
            {activeTab === 'combat' && (
                <CombatPage 
                  character={character} 
                  combatState={combatState}
                  onNewTurn={handleNewTurn}
                  openRollModal={openRollModal}
                  onOpenAttackModal={() => setIsAttackModalOpen(true)}
                  onOpenMinorActionModal={() => setIsMinorActionModalOpen(true)}
                  onActionUsed={handleActionUsed}
                  isMyTurn={isGmMode ? true : isMyTurn} 
                  onEndTurn={onEndTurn}
                  combatData={combatData}
                  onRefresh={onForceRefresh}
                />
            )}
            
            {activeTab === 'progression' && (
                <ProgressionPage character={character} onTrain={onTrain} showNotification={showNotification} isGmMode={isGmMode} onUpdateCharacter={onUpdateCharacter} />
            )}

            {/* DEFAULT VIEW (FICHA) */}
            {activeTab === 'sheet' && (
                <>
                    <div className="bg-white p-6 rounded-2xl shadow-lg w-full">
                        <h3 className="text-xl font-semibold text-brand-text">Habilidade Passiva</h3>
                        <div className="bg-gray-100 p-3 rounded-lg mt-2">
                        <h4 className="font-bold text-purple-700">{clan.passiveAbility.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{clan.passiveAbility.description}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg w-full flex flex-col">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-brand-text">Status de Combate</h3>
                            {isGmMode && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">Editável</span>}
                            </div>
                            <div className="bg-gray-100 p-4 rounded-lg flex justify-around text-center gap-2">
                                <div className="flex flex-col items-center">
                                    <span className="text-sm text-gray-500 mb-1 font-semibold">PV</span>
                                    {isGmMode ? <QuickStatInput value={character.stats.currentHp} maxValue={finalMaxHp} onSave={(val) => handleManualStatEdit('currentHp', val)} className="text-2xl font-bold text-gray-700 mb-1 w-20 text-center bg-transparent" /> : <EditableStat label="" currentValue={character.stats.currentHp} maxValue={finalMaxHp} onSave={(newValue) => handleStatChange('currentHp', newValue)} colorClass="text-green-600" />}
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-sm text-gray-500 mb-1 font-semibold">Chi</span>
                                    {isGmMode ? <QuickStatInput value={character.stats.currentChi} onSave={(val) => handleManualStatEdit('currentChi', val)} className="text-2xl font-bold text-gray-700 mb-1 w-20 text-center bg-transparent" /> : <EditableStat label="" currentValue={character.stats.currentChi} maxValue={finalMaxChi} onSave={(newValue) => handleStatChange('currentChi', newValue)} colorClass="text-blue-500" />}
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-sm text-gray-500 mb-1 font-semibold">CA</span>
                                    <EditableStat label="" currentValue={finalArmorClass} onSave={() => {}} colorClass="text-red-600" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 mt-auto">
                            <button onClick={() => setIsDeleteModalOpen(true)} className="text-center text-sm text-gray-500 hover:text-red-600 font-semibold">Apagar Personagem</button>
                            {!onBack && (<button onClick={signOut} className="text-center text-sm text-gray-500 hover:text-blue-600 font-semibold">Logout</button>)}
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>
      
      {!anyModalIsOpen && <SheetNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}
      
      <AttackChoiceModal isOpen={isAttackModalOpen} onClose={() => setIsAttackModalOpen(false)} character={character} onSelectAction={handleSelectAttackAction} />
      <MinorActionModal isOpen={isMinorActionModalOpen} onClose={() => setIsMinorActionModalOpen(false)} character={character} onSelectAction={handleSelectMinorAction} />
      
      <Modal isOpen={isFormModalOpen} onClose={closeFormModal}>
          <TechniqueCreatorForm 
            onSave={(data) => { handleTechniquesUpdate(data); closeFormModal(); }} 
            onCancel={closeFormModal} 
            initialData={editingTechnique?.technique} 
            characterId={character.id}
            userId={character.userId}
          />
      </Modal>

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Apagar Personagem?" message="Esta ação é permanente. Deseja apagar esta ficha?" />
      
      <RollTestModal 
        isOpen={rollModalData !== null} 
        onClose={closeRollModal} 
        title={rollModalData?.title || ''}
        modifier={rollModalData?.modifier || 0}
        modifierLabel={rollModalData?.modifierLabel || ''}
        diceFormula={rollModalData?.diceFormula}
        onRollComplete={(result) => {
          addRollToHistory({ 
              name: rollModalData.title, 
              roll: result.roll, 
              modifier: result.modifier, 
              total: result.total, 
              damageFormula: rollModalData.metaDamageFormula || rollModalData.diceFormula || null,
              weaponCategory: rollModalData.weaponCategory || null,
              damageBonus: rollModalData.metaDamageBonus !== undefined ? rollModalData.metaDamageBonus : result.modifier
          });
          if (rollModalData.onRollConfirmed) { rollModalData.onRollConfirmed(); }
        }}
      />
    </div>
  );
}

export default CharacterSheet;