import React, { useState, useEffect } from 'react';
import { ATTRIBUTE_TRANSLATIONS } from '../data/translations';
import { ARMOR_TYPES } from '../data/armorTypes';
import { WEAPONS_LIST, WEAPON_CATEGORIES } from '../data/weapons';
import InventoryItemCard from '../components/character-sheet/InventoryItemCard';
import InventoryItemForm from '../components/character-sheet/InventoryItemForm';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Modal from '../components/ui/Modal';
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  TrashIcon, 
  PlusCircleIcon
} from '@heroicons/react/24/solid';

const defaultInventory = {
  weapon: { name: '', damage: '', attribute: '', properties: '', category: '' },
  weapons: [], // Arsenal
  armor: { type: 'none', properties: '' },
  general: [],
  wallet: { gold: 0, silver: 0, copper: 0 }
};

// --- Componentes Auxiliares (Inputs) ---
const LazyInput = ({ value, name, onSave, className, placeholder }) => {
  const [localValue, setLocalValue] = useState(value || '');
  useEffect(() => { setLocalValue(value || ''); }, [value]);
  const handleBlur = () => { if (localValue !== value) onSave({ target: { name, value: localValue } }); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') e.target.blur(); };
  return <input name={name} value={localValue} onChange={(e) => setLocalValue(e.target.value)} onBlur={handleBlur} onKeyDown={handleKeyDown} className={className} placeholder={placeholder} />;
};

const LazyTextArea = ({ value, name, onSave, className, placeholder }) => {
  const [localValue, setLocalValue] = useState(value || '');
  useEffect(() => { setLocalValue(value || ''); }, [value]);
  const handleBlur = () => { if (localValue !== value) onSave({ target: { name, value: localValue } }); };
  return <textarea name={name} value={localValue} onChange={(e) => setLocalValue(e.target.value)} onBlur={handleBlur} className={className} placeholder={placeholder} />;
};

const MoneyInput = ({ value, onSave, label, colorClass, bgClass }) => {
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => { setLocalValue(value); }, [value]);
  const handleBlur = () => { const parsed = parseInt(localValue); if (!isNaN(parsed) && parsed !== value) onSave(parsed); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') e.target.blur(); };
  return (
    <div className={`flex flex-col items-center border rounded-lg px-2 py-2 ${bgClass} ${colorClass} flex-1`}>
      <span className="font-bold text-xs uppercase mb-1">{label}</span>
      <input type="number" value={localValue} onChange={(e) => setLocalValue(e.target.value)} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-full bg-transparent text-center font-mono font-bold text-xl focus:outline-none appearance-none m-0" placeholder="0" />
    </div>
  );
};

// --- FORMULÁRIO ESPECÍFICO PARA ARMAS ---
function WeaponForm({ onSave, onCancel }) {
    const [weapon, setWeapon] = useState({ 
        name: '', damage: '1d4', category: 'leve', attribute: 'agility', properties: '' 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setWeapon(prev => ({ ...prev, [name]: value }));
    };

    const handlePresetChange = (e) => {
        const wid = e.target.value;
        const w = WEAPONS_LIST.find(x => x.id === wid);
        if(w) {
             setWeapon({
                 name: w.name,
                 damage: w.damage,
                 category: w.category,
                 attribute: w.allowedAttributes[0],
                 properties: w.properties || ''
             });
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-brand-text text-center">Adicionar Arma ao Arsenal</h3>
            <div>
                <label className="text-xs font-bold text-gray-500">Modelo (Opcional)</label>
                <select onChange={handlePresetChange} className="w-full p-2 border rounded bg-gray-50">
                    <option value="">-- Selecione para preencher --</option>
                    {WEAPONS_LIST.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500">Nome</label>
                <input name="name" value={weapon.name} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Ex: Espada de Ferro" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold text-gray-500">Dano</label>
                    <input name="damage" value={weapon.damage} onChange={handleChange} className="w-full p-2 border rounded" placeholder="1d8" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500">Atributo</label>
                    <select name="attribute" value={weapon.attribute} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                        {Object.keys(ATTRIBUTE_TRANSLATIONS).map(k => (
                            <option key={k} value={k}>{ATTRIBUTE_TRANSLATIONS[k]}</option>
                        ))}
                    </select>
                </div>
            </div>
             <div>
                <label className="text-xs font-bold text-gray-500">Categoria</label>
                <select name="category" value={weapon.category} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                    {Object.keys(WEAPON_CATEGORIES).map(k => (
                        <option key={k} value={k}>{WEAPON_CATEGORIES[k].name}</option>
                    ))}
                </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded text-gray-700 font-bold">Cancelar</button>
                <button onClick={() => onSave(weapon)} className="px-4 py-2 bg-purple-600 text-white rounded font-bold disabled:opacity-50" disabled={!weapon.name}>Salvar</button>
            </div>
        </div>
    );
}

// --- PÁGINA PRINCIPAL ---
function InventoryPage({ character, onUpdateCharacter, isGmMode }) {
  const [activeModal, setActiveModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const inventory = {
    ...defaultInventory,
    ...character.inventory,
    weapon: { ...defaultInventory.weapon, ...(character.inventory?.weapon || {}) },
    weapons: character.inventory?.weapons || [], 
    armor: { ...defaultInventory.armor, ...(character.inventory?.armor || {}) },
    general: character.inventory?.general || [],
    wallet: character.inventory?.wallet || { gold: 0, silver: character.inventory?.money || 0, copper: 0 }
  };

  // --- LÓGICA DO ARSENAL ---
  const handleAddWeapon = (weaponData) => {
      const newWeapon = { ...weaponData, id: Date.now() };
      const newWeapons = [...inventory.weapons, newWeapon];
      onUpdateCharacter({ ...character, inventory: { ...inventory, weapons: newWeapons } });
      setActiveModal(null);
  };

  const handleUnequipToArsenal = () => {
      if (!inventory.weapon.name) return;
      const currentWeapon = { ...inventory.weapon, id: Date.now() }; 
      const newWeapons = [...inventory.weapons, currentWeapon];
      const emptyWeapon = { name: '', damage: '', attribute: '', properties: '', category: '' };
      onUpdateCharacter({ ...character, inventory: { ...inventory, weapon: emptyWeapon, weapons: newWeapons } });
  };

  const handleEquipFromArsenal = (index) => {
      const weaponToEquip = inventory.weapons[index];
      const newWeapons = inventory.weapons.filter((_, i) => i !== index);
      const currentEquipped = inventory.weapon;
      
      if (currentEquipped.name && currentEquipped.name.trim() !== '') {
          newWeapons.push({ ...currentEquipped, id: Date.now() });
      }
      
      const { id, ...finalWeapon } = weaponToEquip;
      onUpdateCharacter({ ...character, inventory: { ...inventory, weapon: finalWeapon, weapons: newWeapons } });
  };

  const handleDeleteFromArsenal = (index) => {
      if(!confirm("Jogar fora esta arma?")) return;
      const newWeapons = inventory.weapons.filter((_, i) => i !== index);
      onUpdateCharacter({ ...character, inventory: { ...inventory, weapons: newWeapons } });
  };

  // --- Lógica Padrão (Mão Principal) ---
  const handleWeaponSelect = (e) => {
    const weaponId = e.target.value;
    if (weaponId === 'custom') {
        onUpdateCharacter({ ...character, inventory: { ...inventory, weapon: { name: 'Arma Personalizada', damage: '1d4', category: 'leve', attribute: 'agility', properties: '' } } });
        return;
    }
    const w = WEAPONS_LIST.find(x => x.id === weaponId);
    if (w) {
        onUpdateCharacter({ ...character, inventory: { ...inventory, weapon: { 
            name: w.name, damage: w.damage, category: w.category, attribute: w.allowedAttributes[0], properties: w.properties || '' 
        } } });
    }
  };

  const getAvailableAttributes = () => {
      const currentWeapon = WEAPONS_LIST.find(w => w.name === inventory.weapon.name);
      return currentWeapon ? currentWeapon.allowedAttributes : Object.keys(ATTRIBUTE_TRANSLATIONS);
  };

  const handleEquippedChange = (e, section) => {
    const { name, value } = e.target;
    onUpdateCharacter({ ...character, inventory: { ...inventory, [section]: { ...inventory[section], [name]: value } } });
  };

  // --- Lógica Carteira e Itens Gerais ---
  const handleWalletChange = (curr, val) => {
      onUpdateCharacter({ ...character, inventory: { ...inventory, wallet: { ...inventory.wallet, [curr]: val } } });
  };

  const handleSaveGeneralItem = (itemData) => {
    const newGeneral = [...inventory.general];
    if (editingItem) {
      const idx = newGeneral.findIndex(i => i.id === editingItem.id);
      if (idx !== -1) newGeneral[idx] = { ...newGeneral[idx], ...itemData };
    } else { newGeneral.push({ ...itemData, id: Date.now() }); }
    onUpdateCharacter({ ...character, inventory: { ...inventory, general: newGeneral } });
    setActiveModal(null); setEditingItem(null);
  };
  
  const handleDeleteGeneralItem = () => {
    if (itemToDelete === null) return;
    const newGeneral = inventory.general.filter((_, i) => i !== itemToDelete);
    onUpdateCharacter({ ...character, inventory: { ...inventory, general: newGeneral } });
    setItemToDelete(null);
  };
  
  const inputStyle = "w-full p-2 border bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm";
  const labelStyle = "font-bold text-gray-600 block text-xs uppercase tracking-wide mb-1";
  
  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col max-h-[70vh]">
        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* --- SEÇÃO 1: COMBATE --- */}
          <div>
            <h3 className="text-xl font-semibold text-brand-text border-b pb-2 mb-4 flex justify-between items-center">
                Equipamento de Combate
                {isGmMode && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">GM</span>}
            </h3>
            <div className="space-y-4">
              
              {/* Mão Principal */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 relative">
                <div className="flex justify-between items-center mb-2">
                    <label className={labelStyle}>Arma Principal (Mão)</label>
                    {inventory.weapon.name && (
                        <button onClick={handleUnequipToArsenal} className="text-xs flex items-center gap-1 text-purple-700 hover:bg-purple-100 px-2 py-1 rounded transition-colors border border-purple-200 bg-white shadow-sm">
                            <ArrowDownTrayIcon className="h-3 w-3" /> Guardar no Arsenal
                        </button>
                    )}
                </div>
                <select onChange={handleWeaponSelect} className="w-full p-2 mb-2 border bg-white rounded-md text-purple-900 font-semibold" value={WEAPONS_LIST.find(w => w.name === inventory.weapon.name)?.id || 'custom'}>
                    <option value="custom">-- Selecionar da Lista --</option>
                    {Object.keys(WEAPON_CATEGORIES).map(catKey => (
                        <optgroup key={catKey} label={WEAPON_CATEGORIES[catKey].name}>
                            {WEAPONS_LIST.filter(w => w.category === catKey).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </optgroup>
                    ))}
                </select>
                <LazyInput name="name" value={inventory.weapon.name} onSave={(e) => handleEquippedChange(e, 'weapon')} className={inputStyle} placeholder="Nome da Arma" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div><label className="text-xs text-gray-500 ml-1">Dano</label><LazyInput name="damage" value={inventory.weapon.damage} onSave={(e) => handleEquippedChange(e, 'weapon')} className={inputStyle} placeholder="Ex: 1d8" /></div>
                  <div><label className="text-xs text-gray-500 ml-1">Atributo</label>
                      <select name="attribute" value={inventory.weapon.attribute} onChange={(e) => handleEquippedChange(e, 'weapon')} className={`${inputStyle} bg-white`}>
                        {getAvailableAttributes().map(attr => (
                            <option key={attr} value={attr}>{ATTRIBUTE_TRANSLATIONS[attr]}</option>
                        ))}
                      </select>
                  </div>
                </div>
              </div>

              {/* ARSENAL */}
              <div>
                 <div className="flex justify-between items-center border-b pb-2 mb-2 mt-6">
                    <h3 className="text-lg font-bold text-gray-700">Arsenal (Armas Guardadas)</h3>
                    <button onClick={() => setActiveModal('weapon')} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded font-bold flex items-center gap-1">
                        <PlusCircleIcon className="h-4 w-4"/> Add Arma
                    </button>
                 </div>
                 {inventory.weapons.length === 0 ? (
                     <p className="text-sm text-gray-400 italic text-center py-2">Nenhuma arma guardada.</p>
                 ) : (
                     <div className="space-y-2">
                         {inventory.weapons.map((w, idx) => (
                             <div key={idx} className="flex items-center justify-between bg-white border-l-4 border-red-400 p-3 rounded shadow-sm">
                                 <div>
                                     <span className="font-bold text-gray-800 block">{w.name}</span>
                                     <span className="text-xs text-gray-500 font-mono">{w.damage} • {ATTRIBUTE_TRANSLATIONS[w.attribute]} • {w.category}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                     <button onClick={() => handleEquipFromArsenal(idx)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold hover:bg-green-200 flex items-center gap-1">
                                         <ArrowUpTrayIcon className="h-3 w-3"/> Equipar
                                     </button>
                                     <button onClick={() => handleDeleteFromArsenal(idx)} className="text-red-400 hover:text-red-600 p-1"><TrashIcon className="h-4 w-4"/></button>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
              </div>
              
              {/* ARMADURA */}
              <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 mt-4">
                <label className={labelStyle}>Armadura</label>
                <select name="type" value={inventory.armor.type} onChange={(e) => handleEquippedChange(e, 'armor')} className="w-full p-2 mb-2 border bg-white rounded-md focus:ring-2 focus:ring-purple-400">
                  {ARMOR_TYPES.map(armor => <option key={armor.id} value={armor.id}>{armor.name} {armor.effects.skillPenalty ? `(${armor.effects.skillPenalty})` : ''}</option>)}
                </select>
                <LazyTextArea name="properties" value={inventory.armor.properties} onSave={(e) => handleEquippedChange(e, 'armor')} className={`${inputStyle} min-h-[40px]`} placeholder="Descrição da vestimenta..." />
              </div>
            </div>
          </div>
          
          {/* --- SEÇÃO 3: INVENTÁRIO GERAL --- */}
          <div className="mt-6">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-xl font-semibold text-brand-text">Mochila & Tesouros</h3>
              <button onClick={() => { setEditingItem(null); setActiveModal('general_item'); }} className="px-3 py-1 bg-brand-primary text-brand-text font-bold rounded-lg text-sm hover:brightness-105 shadow-sm">
                + Item Comum
              </button>
            </div>
            
            <div className="flex gap-3 mb-6">
                <MoneyInput label="Ouro (TO)" value={inventory.wallet.gold} onSave={(v) => handleWalletChange('gold', v)} colorClass="text-yellow-700 border-yellow-300" bgClass="bg-yellow-50" />
                <MoneyInput label="Prata (TP)" value={inventory.wallet.silver} onSave={(v) => handleWalletChange('silver', v)} colorClass="text-slate-600 border-slate-300" bgClass="bg-slate-100" />
                <MoneyInput label="Cobre (TC)" value={inventory.wallet.copper} onSave={(v) => handleWalletChange('copper', v)} colorClass="text-orange-800 border-orange-300" bgClass="bg-orange-50" />
            </div>

            <div className="space-y-3">
              {inventory.general.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-400 font-medium">Mochila vazia.</p>
                </div>
              ) : (
                inventory.general.map((item, index) => (
                  <InventoryItemCard 
                    key={item.id || index} 
                    item={item}
                    onEdit={() => { setEditingItem(item); setActiveModal('general_item'); }}
                    onDelete={() => setItemToDelete(index)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAIS */}
      <Modal isOpen={activeModal === 'general_item'} onClose={() => setActiveModal(null)}>
        <InventoryItemForm onSave={handleSaveGeneralItem} onCancel={() => setActiveModal(null)} initialData={editingItem} />
      </Modal>

      <Modal isOpen={activeModal === 'weapon'} onClose={() => setActiveModal(null)}>
          <WeaponForm onSave={handleAddWeapon} onCancel={() => setActiveModal(null)} />
      </Modal>

      <ConfirmationModal 
        isOpen={itemToDelete !== null} 
        onClose={() => setItemToDelete(null)} 
        onConfirm={handleDeleteGeneralItem} // <--- CORREÇÃO AQUI
        title="Descartar Item?" 
        message={`Deseja jogar fora "${inventory.general[itemToDelete]?.name}"?`} 
      />
    </>
  );
}

export default InventoryPage;