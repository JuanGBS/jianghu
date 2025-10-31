import React from 'react';

// Novas props: isExpanded para saber se está aberto, e onToggle para ser chamado ao clicar.
function SkillCard({ skill, onDelete, isExpanded, onToggle }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <button 
        onClick={onToggle} 
        className="w-full text-left p-4 space-y-2 focus:outline-none"
      >
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-lg text-brand-text">{skill.name}</h4>
          {/* O botão de deletar agora é independente do toggle */}
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Impede que o clique no 'x' também ative o toggle
              onDelete();
            }} 
            className="text-lg text-red-400 hover:text-red-600 leading-none"
          >
            &times;
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
          <span><strong>Tipo:</strong> {skill.type || '-'}</span>
          <span><strong>Custo:</strong> {skill.cost || '-'}</span>
          <span><strong>Ação:</strong> {skill.action || '-'}</span>
          <span><strong>Atributo:</strong> {skill.attribute || '-'}</span>
        </div>
      </button>

      {/* Seção da Descrição com Animação */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-800 pt-2 border-t">{skill.effect}</p>
        </div>
      </div>
    </div>
  );
}

export default SkillCard;