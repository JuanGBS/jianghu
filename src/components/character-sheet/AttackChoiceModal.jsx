import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { BoltIcon, SparklesIcon, PuzzlePieceIcon } from '@heroicons/react/24/solid';
import { COMBAT_MANEUVERS } from '../../data/gameData';

function AttackChoiceModal({ isOpen, onClose, character, onSelectAction }) {
  const [view, setView] = useState('main'); // 'main', 'weapons', 'techniques', 'maneuvers'

  const primaryWeapon = character.inventory?.weapon || { attribute: 'Agilidade', name: 'Desarmado', damage: '1d4' };
  const storedWeapons = character.inventory?.weapons || [];
  
  // Compila lista de todas as armas disponíveis (Equipada + Arsenal)
  // Filtra armas vazias/sem nome
  const allWeapons = [primaryWeapon, ...storedWeapons].filter(w => w && w.name && w.name.trim() !== '');

  const combatTechniques = character.techniques?.filter(t => t.type === 'Ataque') || [];

  const handleSelect = (type, data) => {
    onSelectAction(type, data);
    handleClose();
  };

  const handleClose = () => {
    setView('main');
    onClose();
  };

  const renderContent = () => {
    // SUB-MENU: LISTA DE ARMAS
    if (view === 'weapons') {
        return (
            <div>
                <h3 className="text-xl font-bold text-brand-text text-center mb-4">Escolha a Arma</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {allWeapons.map((w, index) => (
                        <button 
                            key={index} 
                            onClick={() => handleSelect('weapon', w)} 
                            className="w-full flex items-center p-3 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-lg text-left transition-colors group shadow-sm"
                        >
                            <BoltIcon className="h-8 w-8 text-red-500 mr-3 group-hover:scale-110 transition-transform" />
                            <div>
                                <p className="font-bold text-gray-800 group-hover:text-red-700">{w.name}</p>
                                <p className="text-xs text-gray-500 font-mono">
                                    {w.damage || '1d4'} • {w.attribute || 'Agilidade'} {w.category ? `(${w.category})` : ''}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
                <button onClick={() => setView('main')} className="mt-4 w-full py-2 text-sm font-bold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg">
                    Voltar
                </button>
            </div>
        );
    }

    if (view === 'techniques') {
      return (
        <div>
          <h3 className="text-xl font-bold text-brand-text text-center mb-4">Escolha a Técnica</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {combatTechniques.length > 0 ? combatTechniques.map((tech, index) => (
              <button key={index} onClick={() => handleSelect('technique', tech)} className="w-full p-3 bg-gray-100 hover:bg-purple-100 rounded-lg text-left">
                <p className="font-semibold">{tech.name}</p>
                <p className="text-xs text-gray-500">{tech.effect.substring(0, 50)}...</p>
              </button>
            )) : <p className="text-center text-gray-400 py-4">Nenhuma técnica de ataque aprendida.</p>}
          </div>
          <button onClick={() => setView('main')} className="mt-4 w-full py-2 text-sm font-bold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg">Voltar</button>
        </div>
      );
    }

    if (view === 'maneuvers') {
      return (
        <div>
          <h3 className="text-xl font-bold text-brand-text text-center mb-4">Escolha a Manobra</h3>
          <div className="space-y-2">
            {COMBAT_MANEUVERS.map((maneuver) => (
              <button key={maneuver.id} onClick={() => handleSelect('maneuver', maneuver)} className="w-full p-3 bg-gray-100 hover:bg-purple-100 rounded-lg text-left">
                <p className="font-semibold">{maneuver.name}</p>
                <p className="text-xs text-gray-500">{maneuver.description}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setView('main')} className="mt-4 w-full py-2 text-sm font-bold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg">Voltar</button>
        </div>
      );
    }

    // MENU PRINCIPAL
    return (
      <div className="text-center">
        <h3 className="text-2xl font-bold text-brand-text mb-6">Escolha sua Ação</h3>
        <div className="space-y-3">
          
          {/* Botão de Ataque inteligente: Se tiver > 1 arma, abre lista. Se não, ataca direto. */}
          <button 
            onClick={() => allWeapons.length > 1 ? setView('weapons') : handleSelect('weapon', primaryWeapon)} 
            className="w-full flex items-center p-4 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-300 rounded-xl text-left transition-all shadow-sm hover:shadow-md group"
          >
            <BoltIcon className="h-8 w-8 text-red-500 mr-4 group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-lg text-red-900">Ataque com Arma</span>
              <p className="text-sm text-red-700/80">
                  {allWeapons.length > 1 
                    ? `${allWeapons.length} armas disponíveis...` 
                    : (primaryWeapon.name || 'Desarmado')
                  }
              </p>
            </div>
          </button>

          <button onClick={() => setView('techniques')} className="w-full flex items-center p-4 bg-purple-50 hover:bg-purple-100 border border-purple-100 hover:border-purple-300 rounded-xl text-left transition-all shadow-sm hover:shadow-md group">
            <SparklesIcon className="h-8 w-8 text-purple-500 mr-4 group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-lg text-purple-900">Usar Técnica</span>
              <p className="text-sm text-purple-700/80">{combatTechniques.length} técnica(s) disponível(is)</p>
            </div>
          </button>
          
          <button onClick={() => setView('maneuvers')} className="w-full flex items-center p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-400 rounded-xl text-left transition-all shadow-sm hover:shadow-md group">
            <PuzzlePieceIcon className="h-8 w-8 text-gray-500 mr-4 group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-lg text-gray-800">Realizar Manobra</span>
              <p className="text-sm text-gray-600">Desarmar, Empurrar, Derrubar...</p>
            </div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {renderContent()}
    </Modal>
  );
}

export default AttackChoiceModal;