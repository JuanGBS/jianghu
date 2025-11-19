// ARQUIVO: src/components/combat/InitiativeRollModal.jsx

import React from 'react';
import Modal from '../ui/Modal';
import { CubeIcon } from '@heroicons/react/24/solid';

function InitiativeRollModal({ isOpen, onRollInitiative, agilityBonus }) {
  const handleClose = () => {}; 

  const handleRoll = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const totalInitiative = roll + agilityBonus;
    onRollInitiative(totalInitiative);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="text-center p-4">
        <div className="flex flex-col items-center justify-center mb-6">
          <CubeIcon className="h-12 w-12 text-purple-600 mb-2 animate-bounce" />
          <h3 className="text-2xl font-bold text-brand-text">Combate Iniciado!</h3>
          <p className="text-gray-500 mt-1">O Mestre convocou você para a batalha. Role sua iniciativa.</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={handleRoll}
            className="w-full px-8 py-4 bg-red-600 text-white font-bold text-xl rounded-xl hover:bg-red-700 shadow-lg transition-all transform hover:scale-105"
          >
            Rolar Iniciativa (1d20 + {agilityBonus})
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default InitiativeRollModal;