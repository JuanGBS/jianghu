import React, { useState } from 'react';
import { CLANS_DATA } from '../data/clans';
import characterArt from '../assets/character-art.png';
import { ATTRIBUTE_TRANSLATIONS } from '../data/translations';
import SkillsPage from './SkillsPage';
import SheetNavigation from './SheetNavigation';
import EditableStat from './EditableStat';

function CharacterSheet({ character, onDelete, onUpdateCharacter }) {
  const clan = CLANS_DATA[character.clanId];
  const [activeTab, setActiveTab] = useState('sheet');

  const handleStatChange = (statKey, newValue) => {
    const validatedValue = Math.max(0, newValue);
    
    const updatedCharacter = {
      ...character,
      stats: {
        ...character.stats,
        [statKey]: validatedValue,
      },
    };
    onUpdateCharacter(updatedCharacter);
  };
  
  const handleSkillsUpdate = (newSkills) => {
     const updatedCharacter = { ...character, skills: newSkills };
     onUpdateCharacter(updatedCharacter);
  };

  const RightColumnContent = () => {
    if (activeTab === 'skills') {
      return <SkillsPage skills={character.skills || []} onUpdateSkills={handleSkillsUpdate} />;
    }

    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col justify-between min-h-[300px] w-full">
        <div>
          <h3 className="text-xl font-semibold text-brand-text mb-4">Status de Combate</h3>
          <div className="bg-gray-100 p-4 rounded-lg flex justify-around text-center">
            <EditableStat 
              label="PV"
              currentValue={character.stats.currentHp}
              maxValue={character.stats.maxHp}
              onSave={(newValue) => handleStatChange('currentHp', newValue)}
              colorClass="text-green-600"
            />
            <EditableStat 
              label="Chi"
              currentValue={character.stats.currentChi}
              maxValue={character.stats.maxChi}
              onSave={(newValue) => handleStatChange('currentChi', newValue)}
              colorClass="text-blue-500"
            />
            <EditableStat 
              label="CA"
              currentValue={character.stats.armorClass}
              onSave={(newValue) => handleStatChange('armorClass', newValue)}
              colorClass="text-red-600"
            />
          </div>
        </div>
        <button 
          onClick={onDelete}
          className="w-full text-gray-500 hover:text-red-600 hover:bg-red-100 font-bold py-3 px-4 rounded-lg transition-colors text-center mt-6"
        >
          Apagar Personagem
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
      <h1 className="text-6xl font-bold text-center text-brand-primary mb-10" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
        Tales of Jianghu
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-lg space-y-4 w-full self-start">
          <div>
            <h2 className="text-4xl font-bold text-brand-text">{character.name}</h2>
            <p className="text-lg text-gray-500">{clan.name}</p>
          </div>
          <hr />
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Atributos Finais</h3>
            <div className="space-y-2 mt-3">
              {Object.entries(character.attributes).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                  <span className="font-bold text-gray-700">{ATTRIBUTE_TRANSLATIONS[key]}</span>
                  <span className="text-2xl font-bold text-purple-700">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex justify-center -mx-8 hidden lg:flex self-end">
          <img 
            src={characterArt} 
            alt="Arte do Personagem" 
            className="max-h-[75vh] object-contain [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]" 
          />
        </div>
        
        <div className="lg:col-span-1 w-full self-start">
          <RightColumnContent />
        </div>
      </div>
      <SheetNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default CharacterSheet;