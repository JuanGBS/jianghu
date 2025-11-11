import React, { useState, useEffect } from 'react';
import { CLANS_DATA } from '../data/clans';
import { INNATE_BODIES } from '../data/innateBodies';
import ClanSelector from '../components/character-creation/ClanSelector';
import AttributeDistributor from '../components/character-creation/AttributeDistributor';
import CalculatedStats from '../components/character-creation/CalculatedStats';
import FightingStyleSelector from '../components/character-creation/FightingStyleSelector';
import StyleInfoModal from '../components/character-creation/StyleInfoModal';
import characterArt from '../assets/character-art.png';
import InnateBodySelector from '../components/character-creation/InnateBodySelector';
import InnateBodyInfoModal from '../components/character-creation/InnateBodyInfoModal';

const initialCharacter = {
  name: 'Herói Sem Nome',
  clan: null,
  fightingStyle: '',
  innateBody: 'none',
  bodyRefinementLevel: 0,
  cultivationStage: 0,
  masteryLevel: 0,
  distributedPoints: { vigor: 0, agility: 0, discipline: 0, comprehension: 0, presence: 0 },
};

const initialClanBonus = { vigor: 0, agility: 0, discipline: 0, comprehension: 0, presence: 0 };

function SheetManager({ onSave }) {
  const [character, setCharacter] = useState(initialCharacter);
  const [calculatedStats, setCalculatedStats] = useState({ maxHp: 0, maxChi: 0, armorClass: 0 });
  const [isStyleInfoModalOpen, setIsStyleInfoModalOpen] = useState(false);
  
  const [isBodyInfoModalOpen, setIsBodyInfoModalOpen] = useState(false);
  const [selectedBodyInfo, setSelectedBodyInfo] = useState(null);

  useEffect(() => {
    if (!character.clan) {
        setCalculatedStats({ maxHp: 0, maxChi: 0, armorClass: 0 });
        return;
    };

    const clanData = CLANS_DATA[character.clan];
    const baseHp = clanData.baseHp;
    const clanBonus = clanData.attributeBonus || initialClanBonus;

    const finalAttributes = Object.keys(character.distributedPoints).reduce((acc, attr) => {
      acc[attr] = (clanBonus[attr] || 0) + (character.distributedPoints[attr] || 0);
      return acc;
    }, {});
    
    const selectedInnateBody = INNATE_BODIES.find(body => body.id === character.innateBody);
    const innateHpBonus = selectedInnateBody?.effects?.stat_bonus?.baseHp || 0;

    setCalculatedStats({
      maxHp: (baseHp + innateHpBonus) + finalAttributes.vigor,
      maxChi: 5 + finalAttributes.discipline,
      armorClass: 10 + finalAttributes.agility,
    });
  }, [character.clan, character.distributedPoints, character.innateBody]);

  const handleClanSelect = (clanId) => {
    setCharacter({ ...initialCharacter, name: character.name, clan: clanId });
  };
  const handlePointsChange = (newPoints) => {
    setCharacter(prev => ({ ...prev, distributedPoints: newPoints }));
  };
  const handleStyleChange = (e) => {
    setCharacter(prev => ({ ...prev, fightingStyle: e.target.value }));
  };
  const handleBodyChange = (e) => {
    setCharacter(prev => ({ ...prev, innateBody: e.target.value }));
  };
  
  const handleOpenBodyInfoModal = () => {
    const bodyData = INNATE_BODIES.find(b => b.id === character.innateBody);
    if (bodyData) {
      setSelectedBodyInfo(bodyData);
      setIsBodyInfoModalOpen(true);
    }
  };

  const handleFinishCreation = () => {
    const clanData = CLANS_DATA[character.clan];
    const clanBonus = clanData.attributeBonus || initialClanBonus;
    const finalAttributes = Object.keys(character.distributedPoints).reduce((acc, attr) => {
      acc[attr] = (clanBonus[attr] || 0) + (character.distributedPoints[attr] || 0);
      return acc;
    }, {});

    const finalCharacterData = {
      name: character.name,
      clanId: character.clan,
      fightingStyle: character.fightingStyle,
      innateBodyId: character.innateBody,
      attributes: finalAttributes,
      stats: {
        ...calculatedStats,
        currentHp: calculatedStats.maxHp,
        currentChi: calculatedStats.maxChi,
      },
      proficientPericias: clanData.proficientPericias,
      bodyRefinementLevel: 0,
      cultivationStage: 0,
      masteryLevel: 0,
      techniques: [],
    };
    onSave(finalCharacterData);
  };
  
  const clanBonusForDistributor = character.clan ? CLANS_DATA[character.clan].attributeBonus : initialClanBonus;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-6xl font-bold text-center text-brand-primary mb-10" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
        Tales of Jianghu
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
          <div>
            <label htmlFor="charName" className="text-xl font-semibold text-brand-text mb-2 block">Nome do Personagem</label>
            <input 
              type="text" 
              id="charName" 
              className="w-full bg-white border-2 border-gray-300 rounded-lg py-3 px-4 text-lg focus:outline-none focus:border-purple-400 shadow-md"
              value={character.name}
              onChange={(e) => setCharacter({ ...character, name: e.target.value })}
            />
          </div>
          {character.clan ? (
            <>
              <CalculatedStats stats={calculatedStats} />
              <AttributeDistributor 
                points={character.distributedPoints} 
                clanBonus={clanBonusForDistributor}
                onPointsChange={handlePointsChange} 
              />
            </>
          ) : (
            <div className="text-center text-gray-400 pt-16">
              <p>Selecione um clã para continuar a criação.</p>
            </div>
          )}
        </div>
        <div className="lg:col-span-1 flex justify-center -mx-8 hidden lg:flex self-end">
          <img 
            src={characterArt} 
            alt="Arte do Personagem" 
            className="max-h-[75vh] object-contain [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]" 
          />
        </div>
        <div className="lg:col-span-1 space-y-6 flex flex-col justify-between min-h-[500px]">
          <ClanSelector clans={CLANS_DATA} onClanSelect={handleClanSelect} selectedClan={character.clan} />
          {character.clan && (
            <div className="mt-auto space-y-6">
              <InnateBodySelector 
                selectedBody={character.innateBody}
                onBodyChange={handleBodyChange}
                onInfoClick={handleOpenBodyInfoModal}
              />
              <FightingStyleSelector 
                selectedStyle={character.fightingStyle} 
                onStyleChange={handleStyleChange}
                onInfoClick={() => setIsStyleInfoModalOpen(true)}
              />
            </div>
          )}
          {character.clan && (
             <button
              onClick={handleFinishCreation}
              disabled={!character.fightingStyle}
              className="w-full bg-brand-primary hover:brightness-105 text-brand-text font-bold py-4 px-6 rounded-lg text-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Finalizar Criação
            </button>
          )}
        </div>
      </div>
      
      <StyleInfoModal 
        isOpen={isStyleInfoModalOpen}
        onClose={() => setIsStyleInfoModalOpen(false)}
      />
      <InnateBodyInfoModal
        isOpen={isBodyInfoModalOpen}
        onClose={() => setIsBodyInfoModalOpen(false)}
        body={selectedBodyInfo}
      />
    </div>
  );
}

export default SheetManager;