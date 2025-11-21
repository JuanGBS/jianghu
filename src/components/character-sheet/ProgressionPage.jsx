import React, { useState } from 'react';
import { BODY_REFINEMENT_LEVELS, CULTIVATION_STAGES, MASTERY_LEVELS } from '../../data/gameData';
import { INNATE_BODIES } from '../../data/innateBodies';
import TrainingOptionsModal from './TrainingOptionsModal'; 


function ProgressionPage({ character, onTrain, showNotification, isGmMode, onUpdateCharacter }) {
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  
  const displayStyle = "w-full p-3 border bg-gray-100 rounded-md shadow-inner text-gray-800";

  const innateBody = INNATE_BODIES.find(body => body.id === character.innateBodyId);

  // Função auxiliar para atualizar os selects do GM
  const handleGmChange = (field, value) => {
    if (onUpdateCharacter) {
        onUpdateCharacter({ ...character, [field]: parseInt(value) });
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col max-h-[70vh] h-full">
        <h3 className="text-xl font-semibold text-brand-text border-b pb-2 mb-4 flex-shrink-0 flex justify-between items-center">
          <span>Progressão do Cultivador</span>
          {isGmMode && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold border border-red-200">GOD MODE</span>}
        </h3>
        <div className="space-y-4 overflow-y-auto pr-2">
          
          {/* REFINO CORPORAL */}
          <div>
            <label className="font-bold text-gray-700 block text-sm mb-1">Refino Corporal</label>
            {isGmMode ? (
                <select 
                    className="w-full p-2 border-2 border-purple-300 rounded-md bg-white focus:outline-none focus:border-purple-500"
                    value={character.bodyRefinementLevel || 0}
                    onChange={(e) => handleGmChange('bodyRefinementLevel', e.target.value)}
                >
                    {BODY_REFINEMENT_LEVELS.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                </select>
            ) : (
                <div className={displayStyle}>
                    {BODY_REFINEMENT_LEVELS.find(l => l.id === (character.bodyRefinementLevel || 0))?.name}
                </div>
            )}
          </div>

          {/* ESTÁGIO DE CULTIVO */}
          <div>
            <label className="font-bold text-gray-700 block text-sm mb-1">Estágio de Cultivo</label>
            {isGmMode ? (
                <select 
                    className="w-full p-2 border-2 border-purple-300 rounded-md bg-white focus:outline-none focus:border-purple-500"
                    value={character.cultivationStage || 0}
                    onChange={(e) => handleGmChange('cultivationStage', e.target.value)}
                >
                    {CULTIVATION_STAGES.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            ) : (
                <div className={displayStyle}>
                    {CULTIVATION_STAGES.find(s => s.id === (character.cultivationStage || 0))?.name}
                </div>
            )}
          </div>

          {/* NÍVEL DE MAESTRIA */}
          <div>
            <label className="font-bold text-gray-700 block text-sm mb-1">Nível de Maestria</label>
            {isGmMode ? (
                <select 
                    className="w-full p-2 border-2 border-purple-300 rounded-md bg-white focus:outline-none focus:border-purple-500"
                    value={character.masteryLevel || 0}
                    onChange={(e) => handleGmChange('masteryLevel', e.target.value)}
                >
                    {MASTERY_LEVELS.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                </select>
            ) : (
                <>
                    <div className={displayStyle}>
                        {MASTERY_LEVELS.find(l => l.id === (character.masteryLevel || 0))?.name}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {MASTERY_LEVELS.find(l => l.id === (character.masteryLevel || 0))?.description}
                    </p>
                </>
            )}
          </div>

          {innateBody && innateBody.id !== 'none' && (
            <div>
              <label className="font-bold text-gray-700 block text-sm mb-1">Corpo Inato</label>
              <div className={displayStyle}>
                {innateBody.name}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {innateBody.description}
              </p>
            </div>
          )}

        </div>
        <div className="mt-auto pt-4">
          {!isGmMode && (
            <button onClick={() => setIsTrainingModalOpen(true)} className="w-full bg-brand-primary hover:brightness-105 text-brand-text font-bold py-3 px-6 rounded-lg text-lg transition-all shadow-md">
                Iniciar Treinamento
            </button>
          )}
        </div>
      </div>
      <TrainingOptionsModal
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
        characterAttributes={character.attributes}
        onTrain={onTrain}
        character={character}
        showNotification={showNotification}
      />
    </>
  );
}

export default ProgressionPage; 