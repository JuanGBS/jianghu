import React, { useState, useEffect } from 'react';
import { ATTRIBUTE_TRANSLATIONS } from '../data/translations';
import { ARMOR_TYPES } from '../data/armorTypes';
import { WEAPONS_LIST, WEAPON_CATEGORIES } from '../data/weapons';
import InventoryItemCard from '../components/character-sheet/InventoryItemCard';
import InventoryItemForm from '../components/character-sheet/InventoryItemForm';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Modal from '../components/ui/Modal';

const defaultInventory = {
  weapon: { name: '', damage: '', attribute: '', properties: '', category: '' },
  armor: { type: 'none', properties: '' },
  general: [],
  wallet: { gold: 0, silver: 0, copper: 0 }
};

const LazyInput = ({ value, name, onSave, className, placeholder }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => { setLocalValue(value || ''); }, [value]);

  const handleBlur = () => {
    if (localValue !== value) onSave({ target: { name, value: localValue } });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  return (
    <input
      name={name}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
      placeholder={placeholder}
    />
  );
};

const LazyTextArea = ({ value, name, onSave, className, placeholder }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => { setLocalValue(value || ''); }, [value]);

  const handleBlur = () => {
    if (localValue !== value) onSave({ target: { name, value: localValue } });
  };

  return (
    <textarea
      name={name}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
    />
  );
};

const MoneyInput = ({ value, onSave, label, colorClass, bgClass }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => { setLocalValue(value); }, [value]);

  const handleBlur = () => {
    const parsed = parseInt(localValue);
    if (!isNaN(parsed) && parsed !== value) onSave(parsed);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') e.target.blur(); };

  return (
    <div className={`flex flex-col items-center border rounded-lg px-2 py-2 ${bgClass} ${colorClass} flex-1`}>
      <span className="font-bold text-xs uppercase mb-1">{label}</span>
      <input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent text-center font-mono font-bold text-xl focus:outline-none appearance-none m-0"
        placeholder="0"
      />
    </div>
  );
};

function InventoryPage({ character, onUpdateCharacter, isGmMode }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const inventory = {
    ...defaultInventory,
    ...character.inventory,
    weapon: { ...defaultInventory.weapon, ...(character.inventory?.weapon || {}) },
    armor: { ...defaultInventory.armor, ...(character.inventory?.armor || {}) },
    general: character.inventory?.general || [],
    wallet: character.inventory?.wallet || { gold: 0, silver: character.inventory?.money || 0, copper: 0 }
  };

  const handleWeaponSelect = (e) => {
    const weaponId = e.target.value;
    
    if (weaponId === 'custom') {
        onUpdateCharacter({
            ...character,
            inventory: {
                ...inventory,
                weapon: { name: 'Arma Personalizada', damage: '1d4', category: 'leve', attribute: 'agility', properties: '' }
            }
        });
        return;
    }

    const selectedWeapon = WEAPONS_LIST.find(w => w.id === weaponId);
    if (selectedWeapon) {
        const catData = WEAPON_CATEGORIES[selectedWeapon.category];
        
        onUpdateCharacter({
            ...character,
            inventory: {
                ...inventory,
                weapon: { 
                    name: selectedWeapon.name, 
                    damage: selectedWeapon.damage, 
                    category: selectedWeapon.category,
                    attribute: selectedWeapon.allowedAttributes[0],
                    properties: catData ? `${catData.name}: ${catData.description}` : ''
                }
            }
        });
    }
  };

  const getAvailableAttributes = () => {
      const currentWeapon = WEAPONS_LIST.find(w => w.name === inventory.weapon.name);
      return currentWeapon ? currentWeapon.allowedAttributes : Object.keys(ATTRIBUTE_TRANSLATIONS);
  };

  // --- HANDLERS GENÉRICOS ---
  const handleEquippedChange = (e, section) => {
    const { name, value } = e.target;
    onUpdateCharacter({
        ...character,
        inventory: { ...inventory, [section]: { ...inventory[section], [name]: value } }
    });
  };

  const handleWalletChange = (currency, value) => {
      onUpdateCharacter({
          ...character,
          inventory: { ...inventory, wallet: { ...inventory.wallet, [currency]: value } }
      });
  };

  // --- CRUD ITENS GERAIS ---
  const handleSaveItem = (itemData) => {
    const newGeneral = [...inventory.general];
    if (editingItem) {
      const idx = newGeneral.findIndex(i => i.id === editingItem.id);
      if (idx !== -1) newGeneral[idx] = { ...newGeneral[idx], ...itemData };
    } else {
      newGeneral.push({ ...itemData, id: Date.now() });
    }
    onUpdateCharacter({ ...character, inventory: { ...inventory, general: newGeneral } });
    setIsFormOpen(false); setEditingItem(null);
  };
  
  const handleDeleteItem = () => {
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
          
          {/* --- SEÇÃO DE EQUIPAMENTO --- */}
          <div>
            <h3 className="text-xl font-semibold text-brand-text border-b pb-2 mb-4 flex justify-between items-center">
                Equipamento de Combate
                {isGmMode && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">GM</span>}
            </h3>
            <div className="space-y-4">
              
              {/* ARMA */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <label className={labelStyle}>Arma Principal</label>
                <select 
                    onChange={handleWeaponSelect} 
                    className="w-full p-2 mb-2 border bg-white rounded-md focus:ring-2 focus:ring-purple-400 text-purple-900 font-semibold"
                    value={WEAPONS_LIST.find(w => w.name === inventory.weapon.name)?.id || 'custom'}
                >
                    <option value="custom">-- Selecionar / Personalizada --</option>
                    {Object.keys(WEAPON_CATEGORIES).map(catKey => (
                        <optgroup key={catKey} label={WEAPON_CATEGORIES[catKey].name}>
                            {WEAPONS_LIST.filter(w => w.category === catKey).map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>

                <LazyInput name="name" value={inventory.weapon.name} onSave={(e) => handleEquippedChange(e, 'weapon')} className={inputStyle} placeholder="Nome da Arma" />
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                      <label className="text-xs text-gray-500 ml-1">Dano</label>
                      <LazyInput name="damage" value={inventory.weapon.damage} onSave={(e) => handleEquippedChange(e, 'weapon')} className={inputStyle} placeholder="Ex: 1d8" />
                  </div>
                  <div>
                      <label className="text-xs text-gray-500 ml-1">Atributo</label>
                      <select name="attribute" value={inventory.weapon.attribute} onChange={(e) => handleEquippedChange(e, 'weapon')} className={`${inputStyle} bg-white`}>
                        {getAvailableAttributes().map(attr => (
                            <option key={attr} value={attr}>{ATTRIBUTE_TRANSLATIONS[attr]}</option>
                        ))}
                      </select>
                  </div>
                </div>
                <LazyTextArea name="properties" value={inventory.weapon.properties} onSave={(e) => handleEquippedChange(e, 'weapon')} className={`${inputStyle} mt-2 min-h-[60px]`} placeholder="Propriedades..." />
              </div>
              
              <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                <label className={labelStyle}>Armadura</label>
                <select name="type" value={inventory.armor.type} onChange={(e) => handleEquippedChange(e, 'armor')} className="w-full p-2 mb-2 border bg-white rounded-md focus:ring-2 focus:ring-purple-400">
                  {ARMOR_TYPES.map(armor => (
                    <option key={armor.id} value={armor.id}>{armor.name} {armor.effects.skillPenalty ? `(${armor.effects.skillPenalty})` : ''}</option>
                  ))}
                </select>
                <LazyTextArea name="properties" value={inventory.armor.properties} onSave={(e) => handleEquippedChange(e, 'armor')} className={`${inputStyle} min-h-[40px]`} placeholder="Descrição da vestimenta..." />
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-xl font-semibold text-brand-text">Mochila & Tesouros</h3>
              <button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="px-3 py-1 bg-brand-primary text-brand-text font-bold rounded-lg text-sm hover:brightness-105 shadow-sm">
                + Item
              </button>
            </div>
            
            {/* CARTEIRA */}
            <div className="flex gap-3 mb-6">
                <MoneyInput label="Ouro (TO)" value={inventory.wallet.gold} onSave={(v) => handleWalletChange('gold', v)} colorClass="text-yellow-700 border-yellow-300" bgClass="bg-yellow-50" />
                <MoneyInput label="Prata (TP)" value={inventory.wallet.silver} onSave={(v) => handleWalletChange('silver', v)} colorClass="text-slate-600 border-slate-300" bgClass="bg-slate-50" />
                <MoneyInput label="Cobre (TC)" value={inventory.wallet.copper} onSave={(v) => handleWalletChange('copper', v)} colorClass="text-orange-800 border-orange-300" bgClass="bg-orange-50" />
            </div>

            {/* LISTA DE ITENS */}
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
                    onEdit={() => { setEditingItem(item); setIsFormOpen(true); }}
                    onDelete={() => setItemToDelete(index)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <InventoryItemForm onSave={handleSaveItem} onCancel={() => setIsFormOpen(false)} initialData={editingItem} />
      </Modal>
      <ConfirmationModal isOpen={itemToDelete !== null} onClose={() => setItemToDelete(null)} onConfirm={handleDeleteItem} title="Descartar Item?" message={`Deseja jogar fora "${inventory.general[itemToDelete]?.name}"?`} />
    </>
  );
}

export default InventoryPage;