import React from 'react';
import Modal from '../ui/Modal';
import { ATTRIBUTE_TRANSLATIONS } from '../../data/translations';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

const ATTRIBUTES = ['vigor', 'agility', 'discipline', 'comprehension', 'presence'];

function ProficiencyChoiceModal({ isOpen, onSelect }) {
  const handleClose = () => {};

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="text-center">
        <ShieldCheckIcon className="h-12 w-12 mx-auto text-purple-600 mb-4" />
        <h3 className="text-2xl font-bold text-brand-text">Proficiência Alcançada!</h3>
        <p className="text-gray-600 my-2">
          Você atingiu o Estágio II de Cultivo. Escolha um atributo para se tornar proficiente.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Você receberá um bônus de +2 em todos os testes do atributo escolhido.
        </p>
        
        <div className="space-y-3">
          {ATTRIBUTES.map((attr) => (
            <button
              key={attr}
              onClick={() => onSelect(attr)}
              className="w-full p-4 bg-gray-100 rounded-lg text-lg font-semibold text-brand-text hover:bg-purple-200 hover:shadow-lg transition-all"
            >
              {ATTRIBUTE_TRANSLATIONS[attr]}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default ProficiencyChoiceModal;