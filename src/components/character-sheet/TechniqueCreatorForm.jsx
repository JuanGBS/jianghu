import React, { useState, useEffect } from 'react';
import { TECHNIQUE_TYPES, ACTION_TYPES } from '../../data/gameData';
import { ATTRIBUTE_TRANSLATIONS } from '../../data/translations';
import { EyeIcon, CubeIcon } from '@heroicons/react/24/solid';

const initialTechniqueState = { 
  name: '', type: '', cost: '', damage: '', action: '', attribute: '', requirements: '', concentration: false, requiresRoll: false, effect: '' 
};

function TechniqueCreatorForm({ onSave, onCancel, initialData, characterId, userId }) {
  const [technique, setTechnique] = useState(initialTechniqueState);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setTechnique({ ...initialTechniqueState, ...initialData });
    } else {
      setTechnique(initialTechniqueState);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTechnique(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTypeSelect = (typeId) => {
    setTechnique(prev => ({ ...prev, type: prev.type === typeId ? '' : typeId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Objeto formatado para o banco de dados (snake_case)
    const finalData = { 
        name: technique.name,
        type: technique.type,
        action: technique.action,
        cost: parseInt(technique.cost, 10) || 0, 
        damage: technique.damage,
        attribute: technique.attribute,
        effect: technique.effect,
        requirements: technique.requirements,
        concentration: technique.concentration,
        
        // A LÓGICA DO NULL: Se checkado = true, senão = null
        requires_roll: technique.requiresRoll ? true : null,
        
        // Relacionamentos
        character_id: characterId,
        user_id: userId
    };
    
    onSave(finalData);
  };

  const inputStyle = "w-full p-2 border bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition-shadow";
  const labelStyle = "text-sm font-bold text-gray-600 mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-2xl font-bold text-brand-text text-center mb-6">{isEditing ? 'Editar Técnica' : 'Nova Técnica'}</h4>
      
      <div><label className={labelStyle}>Nome da Técnica</label><input name="name" value={technique.name} onChange={handleChange} className={inputStyle} required /></div>
      
      <div>
        <label className={labelStyle}>Tipo</label>
        <div className="flex space-x-2">
          {TECHNIQUE_TYPES.map((type) => (
            <button type="button" key={type.id} onClick={() => handleTypeSelect(type.id)} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${technique.type === type.id ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-500 border-gray-200'}`}>
                <type.icon className="h-6 w-6 mb-1" /><span className="text-xs font-bold uppercase">{type.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelStyle}>Custo (PC)</label><input name="cost" type="number" min="0" value={technique.cost} onChange={handleChange} className={inputStyle} /></div>
        <div className="col-span-2"><label className={labelStyle}>Ação</label><select name="action" value={technique.action} onChange={handleChange} className={inputStyle}><option value="" disabled>Selecione...</option>{ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div><label className={labelStyle}>Dano (Fórmula)</label><input name="damage" value={technique.damage} onChange={handleChange} className={`${inputStyle} bg-white`} placeholder="Ex: 2d6" /></div>
          <div><label className={labelStyle}>Atributo Chave</label><select name="attribute" value={technique.attribute} onChange={handleChange} className={`${inputStyle} bg-white`}><option value="" disabled>Selecione...</option>{Object.values(ATTRIBUTE_TRANSLATIONS).map(a => <option key={a} value={a}>{a}</option>)}</select></div>
      </div>

      <div className="flex flex-wrap gap-4 py-2">
         <label className="flex items-center cursor-pointer select-none group">
            <div className="relative"><input type="checkbox" name="concentration" checked={technique.concentration} onChange={handleChange} className="sr-only" /><div className={`block w-10 h-6 rounded-full transition-colors ${technique.concentration ? 'bg-blue-500' : 'bg-gray-300'}`}></div><div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${technique.concentration ? 'transform translate-x-4' : ''}`}></div></div><div className="ml-2 text-sm font-bold text-gray-600 group-hover:text-blue-600 flex items-center gap-1"><EyeIcon className="h-4 w-4" /> Concentração</div>
         </label>
         <label className="flex items-center cursor-pointer select-none group">
            <div className="relative"><input type="checkbox" name="requiresRoll" checked={technique.requiresRoll} onChange={handleChange} className="sr-only" /><div className={`block w-10 h-6 rounded-full transition-colors ${technique.requiresRoll ? 'bg-red-500' : 'bg-gray-300'}`}></div><div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${technique.requiresRoll ? 'transform translate-x-4' : ''}`}></div></div><div className="ml-2 text-sm font-bold text-gray-600 group-hover:text-red-600 flex items-center gap-1"><CubeIcon className="h-4 w-4" /> Exige Rolagem?</div>
         </label>
      </div>

      <div><label className={labelStyle}>Requisitos</label><input name="requirements" value={technique.requirements} onChange={handleChange} className={inputStyle} /></div>
      <div><label className={labelStyle}>Descrição do Efeito</label><textarea name="effect" value={technique.effect} onChange={handleChange} className={`${inputStyle} min-h-[100px] resize-none`} required></textarea></div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
        <button type="button" onClick={onCancel} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold border border-gray-300 transition-colors">Cancelar</button>
        <button type="submit" className="px-8 py-2 bg-brand-primary text-brand-text font-bold rounded-lg hover:brightness-110 shadow-md transition-all">Salvar</button>
      </div>
    </form>
  );
}

export default TechniqueCreatorForm;