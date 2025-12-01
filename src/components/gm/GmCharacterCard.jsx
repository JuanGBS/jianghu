import React from 'react';
import { CLANS_DATA } from '../../data/clans';
import { UserIcon } from '@heroicons/react/24/solid';

function GmCharacterCard({ character, onViewCharacter }) {
  // Garante que o ID do clã seja tratado corretamente (caso venha null ou undefined)
  const clanId = character.clanId || character.clan_id;
  const clan = CLANS_DATA[clanId] || { name: 'Clã Desconhecido' };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm transition-all hover:shadow-md hover:border-purple-300">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-brand-text">{character.name}</h3>
          <p className="text-sm text-gray-500 font-semibold">{clan.name}</p>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-300">
          {character.image_url || character.imageUrl ? (
            <img 
              src={character.image_url || character.imageUrl} 
              alt={character.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <UserIcon className="h-8 w-8 text-gray-400" />
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-end">
          <button 
            onClick={() => onViewCharacter(character)}
            className="text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Ver Ficha
          </button>
        </div>
      </div>
    </div>
  );
}

export default GmCharacterCard;