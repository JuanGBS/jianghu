import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { UserIcon, UserPlusIcon, ShieldExclamationIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/solid';

function StartCombatModal({ isOpen, onClose, characters, onStartCombat }) {
  // Lista de IDs selecionados para o combate
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Lista de NPCs temporários criados neste modal (que não existem no banco ainda)
  const [tempNpcs, setTempNpcs] = useState([]);

  const [npcName, setNpcName] = useState('');
  const [npcInitiativeBonus, setNpcInitiativeBonus] = useState(0);

  // Limpa estados ao fechar/abrir
  useEffect(() => {
    if (isOpen) {
        setSelectedIds([]);
        setTempNpcs([]);
    }
  }, [isOpen]);

  const handleAddTempNpc = (e) => {
    e.preventDefault();
    if (!npcName) return;

    const newTempNpc = {
      id: `npc_temp_${Date.now()}`, // ID único temporário
      name: npcName,
      image_url: null,
      isNpc: true,
      attributes: {
        agility: npcInitiativeBonus,
        vigor: 0, presence: 0, discipline: 0, comprehension: 0
      }
    };

    setTempNpcs(prev => [...prev, newTempNpc]);
    setSelectedIds(prev => [...prev, newTempNpc.id]); // Já seleciona automaticamente
    setNpcName('');
    setNpcInitiativeBonus(0);
  };

  const handleToggleSelection = (charId) => {
    setSelectedIds(prev => {
      if (prev.includes(charId)) {
        return prev.filter(id => id !== charId);
      } else {
        return [...prev, charId];
      }
    });
  };

  const handleRemoveTempNpc = (e, tempId) => {
    e.stopPropagation();
    setTempNpcs(prev => prev.filter(n => n.id !== tempId));
    setSelectedIds(prev => prev.filter(id => id !== tempId));
  };

  const handleStart = () => {
    // Combina os personagens reais com os temporários
    const allCandidates = [...characters, ...tempNpcs];
    
    // Filtra apenas os selecionados
    const finalCombatants = allCandidates.filter(c => selectedIds.includes(c.id));
    
    onStartCombat(finalCombatants);
    handleClose();
  };

  const handleClose = () => {
    setTempNpcs([]);
    setSelectedIds([]);
    setNpcName('');
    onClose();
  };

  // Lista unificada para exibição (Reais + Temporários)
  const displayList = [...characters, ...tempNpcs];

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-brand-text text-center">Configurar Combate</h3>
        
        {/* Formulário NPC Temporário */}
        <form onSubmit={handleAddTempNpc} className="bg-gray-100 p-3 rounded-lg space-y-2 border border-gray-200">
          <h4 className="font-semibold text-sm text-gray-600">Adicionar NPC Rápido (Sem Ficha)</h4>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Nome (ex: Lobo)"
              value={npcName}
              onChange={(e) => setNpcName(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
            />
            <input
              type="number"
              placeholder="AGI"
              value={npcInitiativeBonus}
              onChange={(e) => setNpcInitiativeBonus(parseInt(e.target.value, 10) || 0)}
              className="w-20 p-2 border rounded-md text-sm text-center"
              title="Bônus de Iniciativa"
            />
            <button type="submit" className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              <UserPlusIcon className="h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="border-t pt-2">
          <p className="text-center text-sm text-gray-500 mb-2 font-bold">Quem vai participar?</p>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
            
            {displayList.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">Nenhum personagem disponível.</p>
            )}

            {displayList.map(char => {
              const isSelected = selectedIds.includes(char.id);
              const isTemp = char.id.toString().startsWith('npc_temp');

              return (
                <div 
                  key={char.id} 
                  onClick={() => handleToggleSelection(char.id)}
                  className={`w-full flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer select-none ${
                    isSelected 
                      ? 'bg-purple-50 border-purple-500 shadow-sm' 
                      : 'bg-white border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden mr-3 flex-shrink-0 ${char.isNpc ? 'bg-red-100' : 'bg-blue-100'}`}>
                    {char.image_url ? (
                        <img src={char.image_url} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                        char.isNpc ? <ShieldExclamationIcon className="h-5 w-5 text-red-500" /> : <UserIcon className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <span className={`font-bold block truncate ${isSelected ? 'text-purple-900' : 'text-gray-600'}`}>
                        {char.name}
                    </span>
                    {char.isNpc && <span className="text-xs text-red-500 font-semibold">Iniciativa: +{char.attributes?.agility || 0}</span>}
                  </div>

                  {/* Ícone de Seleção */}
                  <div className="ml-2">
                    {isSelected && <CheckCircleIcon className="h-6 w-6 text-purple-600" />}
                  </div>

                  {/* Botão Excluir Apenas para Temporários */}
                  {isTemp && (
                      <button 
                        onClick={(e) => handleRemoveTempNpc(e, char.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500"
                        title="Remover NPC Temporário"
                      >
                          <TrashIcon className="h-5 w-5" />
                      </button>
                  )}
                </div>
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
            disabled={selectedIds.length === 0}
          >
            Iniciar Combate ({selectedIds.length})
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default StartCombatModal;