import React, { useState } from 'react';

const initialSkillState = {
  name: '',
  type: '',
  cost: '',
  action: '',
  attribute: '',
  requirements: '',
  effect: '',
};

function SkillCreatorForm({ onSave, onCancel }) {
  const [skill, setSkill] = useState(initialSkillState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSkill(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(skill);
    setSkill(initialSkillState); // Reseta o formulário após salvar
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
      <h4 className="text-lg font-semibold text-brand-text">Nova Habilidade</h4>
      <input name="name" value={skill.name} onChange={handleChange} placeholder="Nome da Habilidade" className="w-full p-2 border rounded-md" required />
      <div className="grid grid-cols-2 gap-4">
        <input name="type" value={skill.type} onChange={handleChange} placeholder="Tipo (Ex: Ataque)" className="w-full p-2 border rounded-md" />
        <input name="cost" value={skill.cost} onChange={handleChange} placeholder="Custo (Ex: 2 PC)" className="w-full p-2 border rounded-md" />
        <input name="action" value={skill.action} onChange={handleChange} placeholder="Ação (Ex: Ação Maior)" className="w-full p-2 border rounded-md" />
        <input name="attribute" value={skill.attribute} onChange={handleChange} placeholder="Atributo Chave (Ex: Vigor)" className="w-full p-2 border rounded-md" />
      </div>
      <input name="requirements" value={skill.requirements} onChange={handleChange} placeholder="Requisitos (Ex: Compreensão Rasa)" className="w-full p-2 border rounded-md" />
      <textarea name="effect" value={skill.effect} onChange={handleChange} placeholder="Descrição do Efeito" className="w-full p-2 border rounded-md" rows="3" required></textarea>
      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-brand-primary text-brand-text font-semibold rounded-md hover:brightness-105">Salvar Habilidade</button>
      </div>
    </form>
  );
}

export default SkillCreatorForm;