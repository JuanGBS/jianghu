import React from 'react';
import Modal from '../ui/Modal';
import { MINOR_ACTIONS, LIGHT_WEAPONS } from '../../data/gameData'; 
import { ViewfinderCircleIcon, SparklesIcon, BoltIcon, FireIcon } from '@heroicons/react/24/solid';

function MinorActionModal({ isOpen, onClose, character, onSelectAction }) {
  // Filtra técnicas configuradas explicitamente como "Ação Menor" na criação
  const minorActionTechniques = character.techniques?.filter(
    t => t.action === 'Ação Menor'
  ) || [];

  // Filtra técnicas antigas de suporte/cura (Legado/Fallback)
  const supportTechniques = character.techniques?.filter(
    t => (t.type === 'Suporte' || t.type === 'Cura') && t.action !== 'Ação Menor'
  ) || [];

  const equippedWeaponName = character.inventory?.weapon?.name || '';
  // Verifica também a categoria 'leve' se o nome não estiver na lista hardcoded
  const isWieldingLightWeapon = LIGHT_WEAPONS.includes(equippedWeaponName) || character.inventory?.weapon?.category === 'leve';

  const handleSelect = (type, data) => {
    if (type === 'technique') {
        // Marca como técnica para a CombatPage saber tratar (rolar se for ataque/exigir rolagem)
        onSelectAction({ ...data, isTechnique: true }); 
    } else {
        onSelectAction(data);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <h3 className="text-2xl font-bold text-brand-text mb-6">Escolha sua Ação Menor</h3>
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* 1. Ação de Arma Leve (Segundo Ataque) */}
          {isWieldingLightWeapon && (
            <div>
              <h4 className="font-bold text-gray-500 text-sm mb-2 text-left uppercase tracking-wide">Combate com Duas Armas</h4>
              <button 
                onClick={() => handleSelect('action', { id: 'second_attack', name: 'Segundo Ataque', description: 'Realiza um ataque adicional com sua arma leve.' })} 
                className="w-full flex items-center p-3 mb-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-left transition-colors"
              >
                <BoltIcon className="h-6 w-6 text-orange-600 mr-4 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-orange-900">Segundo Ataque</span>
                  <p className="text-xs text-orange-700">Ataque extra com a arma secundária.</p>
                </div>
              </button>
            </div>
          )}

          {/* 2. Técnicas de Ação Menor (Aqui entram os ataques rápidos/buffs) */}
          {minorActionTechniques.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-500 text-sm mb-2 text-left uppercase tracking-wide">Técnicas Rápidas</h4>
              {minorActionTechniques.map((tech, index) => (
                <button 
                  key={index} 
                  onClick={() => handleSelect('technique', tech)} 
                  className={`w-full flex items-center p-3 mb-2 border rounded-lg text-left transition-colors ${
                    tech.type === 'Ataque' 
                        ? 'bg-red-50 hover:bg-red-100 border-red-200' 
                        : 'bg-purple-50 hover:bg-purple-100 border-purple-200'
                  }`}
                >
                  {tech.type === 'Ataque' 
                    ? <FireIcon className="h-6 w-6 text-red-500 mr-4 flex-shrink-0" /> 
                    : <SparklesIcon className="h-6 w-6 text-purple-500 mr-4 flex-shrink-0" />
                  }
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <span className={`font-semibold ${tech.type === 'Ataque' ? 'text-red-900' : 'text-purple-900'}`}>{tech.name}</span>
                        <span className="text-xs bg-white px-2 py-0.5 rounded border shadow-sm font-mono">
                            {tech.cost ? `${tech.cost} PC` : '0 PC'}
                        </span>
                    </div>
                    <div className="flex gap-2 mt-1">
                        {tech.damage && (
                            <span className="text-[10px] font-bold bg-white/50 px-1.5 rounded text-gray-700 border border-gray-200">
                                Dano: {tech.damage}
                            </span>
                        )}
                        <p className={`text-xs truncate ${tech.type === 'Ataque' ? 'text-red-700' : 'text-purple-700'}`}>
                            {tech.effect}
                        </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 3. Ações Padrão */}
          <div>
            <h4 className="font-bold text-gray-500 text-sm mb-2 text-left uppercase tracking-wide">Ações Gerais</h4>
            {MINOR_ACTIONS.map((action) => (
              <button 
                key={action.id} 
                onClick={() => handleSelect('action', action)} 
                className="w-full flex items-center p-3 mb-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition-colors"
              >
                <ViewfinderCircleIcon className="h-6 w-6 text-gray-500 mr-4 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-gray-800">{action.name}</span>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* 4. Técnicas de Suporte Legadas (caso não tenham action definida) */}
          {supportTechniques.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-500 text-sm mb-2 text-left uppercase tracking-wide">Outros Suportes</h4>
              {supportTechniques.map((tech, index) => (
                <button 
                  key={index} 
                  onClick={() => handleSelect('technique', tech)} 
                  className="w-full flex items-center p-3 mb-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition-colors"
                >
                  <SparklesIcon className="h-6 w-6 text-blue-500 mr-4 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-blue-900">{tech.name}</span>
                    <p className="text-xs text-blue-700 line-clamp-1">{tech.effect}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default MinorActionModal;