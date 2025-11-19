import React, { useState } from 'react';
import Modal from '../ui/Modal';
// --- CORREÇÃO: Adicionado CheckCircleIcon na importação ---
import { UserIcon, UserPlusIcon, ShieldExclamationIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

function StartCombatModal({ isOpen, onClose, characters, onStartCombat }) {
  const [combatants, setCombatants] = useState([]); 
  const [npcName, setNpcName] = useState('');
  const [npcInitiativeBonus, setNpcInitiativeBonus] = useState(0);

  const handleAddNpc = (e) => {
    e.preventDefault();
    if (!npcName) return;

    const newNpc = {
      id: `npc_${Date.now()}`, 
      name: npcName,
      image_url: null, 
      isNpc: true,
      attributes: {
        agility: npcInitiativeBonus, 
        vigor: 0, 
        presence: 0,
        discipline: 0,
        comprehension: 0
      }
    };

    setCombatants(prev => [...prev, newNpc]);
    setNpcName('');
    setNpcInitiativeBonus(0);
  };

  const handleToggleParticipant = (char) => {
    const isSelected = combatants.some(c => c.id === char.id);
    if (isSelected) {
      setCombatants(prev => prev.filter(c => c.id !== char.id));
    } else {
      setCombatants(prev => [...prev, char]);
    }
  };

  const handleStart = () => {
    onStartCombat(combatants);
    handleClose();
  };

  const handleClose = () => {
    setCombatants([]);
    setNpcName('');
    setNpcInitiativeBonus(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-brand-text text-center">Configurar Combate</h3>
        
        {/* Formulário NPC */}
        <form onSubmit={handleAddNpc} className="bg-gray-100 p-3 rounded-lg space-y-2 border border-gray-200">
          <h4 className="font-semibold text-sm text-gray-600">Adicionar NPC / Monstro</h4>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Nome (ex: Bandido)"
              value={npcName}
              onChange={(e) => setNpcName(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="number"
              placeholder="Bonus AGI"
              value={npcInitiativeBonus}
              onChange={(e) => setNpcInitiativeBonus(parseInt(e.target.value, 10) || 0)}
              className="w-24 p-2 border rounded-md"
              title="Bônus de Iniciativa"
            />
            <button type="submit" className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              <UserPlusIcon className="h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="border-t pt-2">
          <p className="text-center text-sm text-gray-500 mb-2">Selecione os Jogadores:</p>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
            {/* Lista Combinada: Personagens REAIS + NPCs criados */}
            {[...characters, ...combatants.filter(c => c.isNpc)].map(char => {
              const isSelected = combatants.some(c => c.id === char.id);
              return (
                <button 
                  key={char.id} 
                  onClick={() => handleToggleParticipant(char)}
                  className={`w-full flex items-center p-3 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'bg-purple-100 border-purple-500 shadow-md' 
                      : 'bg-white border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden mr-3 flex-shrink-0 ${char.isNpc ? 'bg-red-100' : 'bg-gray-200'}`}>
                    {char.image_url ? <img src={char.image_url} alt={char.name} className="w-full h-full object-cover" /> 
                    : (char.isNpc ? <ShieldExclamationIcon className="h-6 w-6 text-red-500" /> : <UserIcon className="h-6 w-6 text-gray-400" />)}
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-brand-text block">{char.name}</span>
                    {char.isNpc && <span className="text-xs text-red-500 font-semibold">Iniciativa: +{char.attributes.agility}</span>}
                  </div>
                  {isSelected && <CheckCircleIcon className="h-6 w-6 text-purple-600 ml-auto" />}
                </button>
              )
            })}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md font-semibold">Cancelar</button>
          <button 
            type="button" 
            onClick={handleStart} 
            className="px-6 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={combatants.length === 0}
          >
            Iniciar Combate ({combatants.length})
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default StartCombatModal;