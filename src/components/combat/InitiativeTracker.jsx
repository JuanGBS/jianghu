import React from 'react';
import { UserIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/solid';

function InitiativeTracker({ turnOrder, currentIndex, isDrawerOpen }) {
  if (!turnOrder || turnOrder.length === 0) {
    return null;
  }

  // Se tiver poucos participantes (3 ou menos), mostra lista estática para não confundir
  const isSmallList = turnOrder.length <= 3;

  let visibleParticipants;
  
  if (isSmallList) {
    visibleParticipants = turnOrder.map((p, idx) => ({ ...p, realIndex: idx }));
  } else {
    // Lógica de carrossel para muitos participantes
    visibleParticipants = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % turnOrder.length;
      visibleParticipants.push({ ...turnOrder[index], realIndex: index });
    }
  }

  // Define a posição baseada se a gaveta está aberta ou não
  // 320px (gaveta) + 20px (margem) = 340px
  const positionClass = isDrawerOpen ? 'right-[340px]' : 'right-4';

  return (
    <div 
      className={`fixed top-4 ${positionClass} z-50 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-2xl border-2 border-purple-100 transition-all duration-300 ease-in-out`}
    >
      <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2 text-center">
        {isSmallList ? "Ordem de Turno" : "Iniciativa"}
      </h4>
      <div className="flex space-x-3 justify-center">
        {visibleParticipants.map((participant, idx) => {
          // Determina se este card é o ativo
          const isActive = isSmallList 
            ? participant.realIndex === currentIndex 
            : idx === 0; // No carrossel, o primeiro é sempre o ativo

          return (
            <div 
              key={`${participant.character_id}-${idx}`} 
              className={`flex flex-col items-center transition-all duration-300 ${
                isActive ? 'scale-110 opacity-100' : 'scale-90 opacity-60 grayscale'
              }`}
            >
              <div 
                className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shadow-sm ${
                  isActive ? 'border-purple-600 ring-2 ring-purple-200' : 'border-gray-200'
                }`}
              >
                {participant.image_url ? (
                  <img src={participant.image_url} alt={participant.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                {/* Badge de Iniciativa */}
                <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1 font-bold">
                    {participant.initiative}
                </div>
              </div>
              
              <p className={`text-xs font-bold mt-1 truncate w-16 text-center ${isActive ? 'text-purple-700' : 'text-gray-500'}`}>
                {participant.name}
              </p>
              
              {isActive && <ChevronDoubleRightIcon className="h-4 w-4 text-purple-600 absolute -bottom-3 animate-bounce" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InitiativeTracker;