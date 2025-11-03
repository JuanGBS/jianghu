import React from 'react';
import { BODY_REFINEMENT_LEVELS, CULTIVATION_LEVELS } from '../data/gameData';

function ProgressionPage({ character, onProgressionChange }) {
  const inputStyle = "w-full p-2 border bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm text-gray-700";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col max-h-[70vh] space-y-4">
      <h3 className="text-xl font-semibold text-brand-text border-b pb-2">
        Progressão do Cultivador
      </h3>
      
      <div>
        <label htmlFor="bodyRefinement" className="font-bold text-gray-700 block text-sm mb-1">Refino Corporal</label>
        <select 
          id="bodyRefinement" 
          value={character.bodyRefinementLevel || 0}
          onChange={(e) => onProgressionChange('bodyRefinementLevel', parseInt(e.target.value, 10))}
          className={inputStyle}
        >
          {BODY_REFINEMENT_LEVELS.map(level => (
            <option key={level.id} value={level.id}>{level.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cultivationLevel" className="font-bold text-gray-700 block text-sm mb-1">Nível de Cultivo</label>
        <select 
          id="cultivationLevel" 
          value={character.cultivationLevel || 0}
          onChange={(e) => onProgressionChange('cultivationLevel', parseInt(e.target.value, 10))}
          className={inputStyle}
        >
          {CULTIVATION_LEVELS.map(level => (
            <option key={level.id} value={level.id}>{level.name}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {CULTIVATION_LEVELS.find(l => l.id === (character.cultivationLevel || 0))?.description}
        </p>
      </div>
    </div>
  );
}

export default ProgressionPage;