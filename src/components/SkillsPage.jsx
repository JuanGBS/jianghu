import React, { useState } from 'react';
import SkillCreatorForm from './SkillCreatorForm';
import SkillCard from './SkillCard';

function SkillsPage({ skills, onUpdateSkills }) {
  const [isCreating, setIsCreating] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleSaveSkill = (newSkill) => {
    const updatedSkills = [...skills, newSkill];
    onUpdateSkills(updatedSkills);
    setIsCreating(false);
  };

  const handleDeleteSkill = (indexToDelete) => {
    const updatedSkills = skills.filter((_, index) => index !== indexToDelete);
    onUpdateSkills(updatedSkills);
  };

  const handleToggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col max-h-[70vh]">
      {!isCreating && (
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-xl font-semibold text-brand-text">Habilidades</h3>
          <button onClick={() => setIsCreating(true)} className="px-4 py-2 bg-brand-primary text-brand-text font-semibold rounded-md text-sm hover:brightness-105">
            Adicionar Habilidade
          </button>
        </div>
      )}

      {isCreating ? (
        <SkillCreatorForm onSave={handleSaveSkill} onCancel={() => setIsCreating(false)} />
      ) : (
        <div className="space-y-3 overflow-y-auto flex-grow pr-4 min-h-0 pb-4">
          {skills.length > 0 ? (
            skills.map((skill, index) => (
              <SkillCard 
                key={index} 
                skill={skill} 
                onDelete={() => handleDeleteSkill(index)}
                isExpanded={expandedIndex === index}
                onToggle={() => handleToggleExpand(index)}
              />
            ))
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-center text-gray-400">Nenhuma habilidade adicionada.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SkillsPage;