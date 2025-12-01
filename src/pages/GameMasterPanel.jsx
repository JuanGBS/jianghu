import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { useCombatManager } from "../hooks/useCombatManager";
import { useDamageSystem } from "../hooks/useDamageSystem";

import GmCharacterCard from "../components/gm/GmCharacterCard";
import CharacterSheet from "./CharacterSheet";
import NotificationToast from "../components/ui/NotificationToast";
import GmImageUploadModal from "../components/gm/GmImageUploadModal";
import ImageViewerModal from "../components/gm/ImageViewerModal";
import StartCombatModal from "../components/gm/StartCombatModal";
import RollTestModal from "../components/character-sheet/RollTestModal";
import CombatTrackerCarousel from "../components/gm/CombatTrackerCarousel";

import {
  TrashIcon, MagnifyingGlassIcon, PlayIcon, StopIcon, ForwardIcon,
  UserPlusIcon, BoltIcon, FireIcon, UserIcon, SparklesIcon,
  ArrowPathIcon, // <--- ADICIONADO AQUI
  PencilSquareIcon, XMarkIcon
} from "@heroicons/react/24/solid";

const mapToCamelCase = (data) => {
  if (!data) return null;
  return {
    proficientAttribute: data.proficient_attribute, 
    id: data.id, userId: data.user_id, name: data.name, clanId: data.clan_id, fightingStyle: data.fighting_style, 
    innateBodyId: data.innate_body_id, imageUrl: data.image_url, image_url: data.image_url, 
    bodyRefinementLevel: data.body_refinement_level, cultivationStage: data.cultivation_stage, masteryLevel: data.mastery_level, 
    attributes: data.attributes, stats: data.stats, techniques: data.techniques || [], proficientPericias: data.proficient_pericias || [], 
    inventory: data.inventory || {}, createdAt: data.created_at, activeCombatId: data.active_combat_id, isNpc: data.is_npc, isInScene: data.is_in_scene 
  };
};

function GameMasterPanel() {
  const { user, signOut } = useAuth();
  const [notification, setNotification] = useState(null);
  const showNotification = (msg, type = 'success') => setNotification({ message: msg, type });

  const { combatData, localLogs, createCombat, startRound, nextTurn, endCombat, gmRoll, updateStat, sendCombatLog, addCombatLog } = useCombatManager(user, showNotification);
  const { calculateDamage } = useDamageSystem();

  const [characters, setCharacters] = useState([]); 
  const [activeNpcs, setActiveNpcs] = useState([]); 
  const [npcTemplates, setNpcTemplates] = useState([]); 
  const [gmImages, setGmImages] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewingCharacter, setViewingCharacter] = useState(null); 
  const [isViewingTemplate, setIsViewingTemplate] = useState(false); 
  
  const viewingCharacterRef = useRef(null);
  const isViewingTemplateRef = useRef(false);
  useEffect(() => { viewingCharacterRef.current = viewingCharacter; }, [viewingCharacter]);
  useEffect(() => { isViewingTemplateRef.current = isViewingTemplate; }, [isViewingTemplate]);

  const [viewingImage, setViewingImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isStartCombatModalOpen, setIsStartCombatModalOpen] = useState(false);
  const [rollModalData, setRollModalData] = useState(null); 
  
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (localLogs && localLogs.length > 0) {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [localLogs]);

  const fetchAllData = async () => {
    try {
        const [charsRes, tempsRes, imgsRes] = await Promise.all([
            supabase.from("characters").select("*").order("name", { ascending: true }),
            supabase.from("npc_templates").select("*").order("name", { ascending: true }),
            supabase.from("gm_images").select("*").order("created_at", { ascending: false }).limit(50)
        ]);

        if (charsRes.data) {
            setCharacters(charsRes.data.filter(c => !c.is_npc).map(mapToCamelCase));
            setActiveNpcs(charsRes.data.filter(c => c.is_npc).map(mapToCamelCase));
        }
        if (tempsRes.data) setNpcTemplates(tempsRes.data.map(mapToCamelCase));
        if (imgsRes.data) setGmImages(imgsRes.data);

    } catch (error) {
        console.error("Erro fetch:", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => { if (user) fetchAllData(); }, [user]);

  useEffect(() => {
    if (!user) return;

    const charChannel = supabase.channel('gm-realtime-chars')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'characters' }, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        if (eventType === 'INSERT') {
          const mapped = mapToCamelCase(newRecord);
          if (mapped.isNpc) setActiveNpcs(prev => [...prev, mapped]);
          else setCharacters(prev => [...prev, mapped]);
        } 
        else if (eventType === 'UPDATE') {
          const mapped = mapToCamelCase(newRecord);
          if (mapped.isNpc) setActiveNpcs(prev => prev.map(c => c.id === mapped.id ? mapped : c));
          else setCharacters(prev => prev.map(c => c.id === mapped.id ? mapped : c));
          
          if (viewingCharacterRef.current?.id === mapped.id && !isViewingTemplateRef.current) {
             setViewingCharacter(mapped);
          }
        } 
        else if (eventType === 'DELETE') {
          setActiveNpcs(prev => prev.filter(c => c.id !== oldRecord.id));
          setCharacters(prev => prev.filter(c => c.id !== oldRecord.id));
          if (viewingCharacterRef.current?.id === oldRecord.id) setViewingCharacter(null);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(charChannel); };
  }, [user]);

  // --- AÇÕES ---
  const handleCreateTemplateFromImage = async (imageUrl) => {
    const npcName = prompt("Nome do Modelo de NPC:");
    if (!npcName) return;
    const newTemplate = { user_id: user.id, name: npcName, image_url: imageUrl, clan_id: 'wang', attributes: { vigor: 1, agility: 1, discipline: 1, comprehension: 1, presence: 1 }, stats: { currentHp: 10, currentChi: 10, maxHp: 10, maxChi: 10, armorClass: 10 }, inventory: { weapon: { name: 'Desarmado', attribute: 'Agilidade' }, armor: { type: 'none' }, general: [] }, techniques: [] };
    const { error } = await supabase.from('npc_templates').insert(newTemplate);
    if (!error) {
        showNotification("Modelo criado!");
        fetchAllData(); 
    }
  };

  const handleInstantiateNpc = async (template) => {
      const instanceName = prompt(`Nome para o NPC em cena:`, template.name);
      if (instanceName === null) return; 
      const newInstance = { user_id: user.id, name: instanceName || template.name, image_url: template.imageUrl, is_npc: true, is_in_scene: true, clan_id: template.clanId, fighting_style: template.fightingStyle, innate_body_id: template.innateBodyId, body_refinement_level: template.bodyRefinement_level, cultivation_stage: template.cultivation_stage, mastery_level: template.mastery_level, attributes: template.attributes, stats: template.stats, techniques: template.techniques, inventory: template.inventory, proficient_pericias: template.proficientPericias };
      const { error } = await supabase.from('characters').insert(newInstance);
      if (!error) showNotification("NPC em cena!"); 
  };

  const handleRemoveFromScene = async (npcId) => {
      if(!confirm("Remover da cena?")) return;
      setActiveNpcs(prev => prev.filter(n => n.id !== npcId));
      await supabase.from('characters').delete().eq('id', npcId);
  };

  const handleDeleteTemplate = async (templateId) => {
    if(!confirm("Apagar Modelo?")) return;
    setNpcTemplates(prev => prev.filter(t => t.id !== templateId));
    await supabase.from('npc_templates').delete().eq('id', templateId);
  };

  const handleUpdateCharacter = async (u) => {
      if (isViewingTemplate) setNpcTemplates(prev => prev.map(t => t.id === u.id ? u : t));
      else if (u.isNpc) setActiveNpcs(prev => prev.map(c => c.id === u.id ? u : c));
      else setCharacters(prev => prev.map(c => c.id === u.id ? u : c));

      const d = { name: u.name, clan_id: u.clanId, fighting_style: u.fightingStyle, innate_body_id: u.innateBodyId, body_refinement_level: u.bodyRefinement_level, cultivation_stage: u.cultivation_stage, mastery_level: u.mastery_level, attributes: u.attributes, stats: u.stats, techniques: u.techniques, inventory: u.inventory, is_in_scene: u.isInScene };
      const table = isViewingTemplate ? 'npc_templates' : 'characters';
      const { error } = await supabase.from(table).update(d).eq('id', u.id);
      if (!error) showNotification("Salvo!");
  };

  const handleImageUpload = async (file, category) => {
      if(!file) return; const ext=file.name.split('.').pop(); const path=`public/gm/${category}/${Date.now()}.${ext}`;
      await supabase.storage.from("character-images").upload(path, file);
      const {data} = supabase.storage.from("character-images").getPublicUrl(path);
      await supabase.from("gm_images").insert({uploader_id:user.id, category, file_path:path, image_url:data.publicUrl});
      showNotification("Imagem enviada!"); 
      fetchAllData();
  };
  
  const handleDeleteImage = async (img) => { 
      if(!confirm("Apagar imagem?")) return; 
      await supabase.storage.from("character-images").remove([img.file_path]); 
      await supabase.from("gm_images").delete().eq("id", img.id); 
      fetchAllData(); 
  };

  const handleQuickStatChange = async (charId, statField, newValue) => {
     const val = parseInt(newValue) || 0;
     const updateList = (list) => list.map(c => c.id === charId ? { ...c, stats: { ...c.stats, [statField]: val } } : c);
     setCharacters(prev => updateList(prev));
     setActiveNpcs(prev => updateList(prev));
     updateStat(charId, statField, newValue);
  };

  const handleRollDamageFromLog = (logEntry) => {
      if (!logEntry.damageFormula) return;
      const attacker = [...characters, ...activeNpcs].find(c => c.id === logEntry.characterId);
      if (attacker) {
          const result = calculateDamage(attacker, logEntry.type === 'crit', logEntry.damageFormula, logEntry.damageBonus);
          addCombatLog(result.message, 'damage');
      }
  };

  const handleGmActionRoll = (npc, actionName, bonus, label, damageFormula = null, weaponCategory = null) => {
    setRollModalData({ 
        title: `${actionName}`, modifier: bonus, modifierLabel: label, 
        onRollConfirmed: (result) => {
            const { total, roll } = result;
            const isCrit = roll === 20; const isFail = roll === 1;
            let logMsg = `${npc.name} usou **${actionName}**: Rolou **${total}** (${roll}${bonus >= 0 ? '+' : ''}${bonus}).`;
            if (isCrit) logMsg += " **CRÍTICO!**"; if (isFail) logMsg += " **FALHA CRÍTICA!**";
            sendCombatLog(logMsg, isCrit ? 'crit' : (isFail ? 'fail' : 'info'), damageFormula, weaponCategory, bonus, npc.id);
        } 
    });
  };

  const handleOpenNpcAttackMenu = (charId) => {
    const char = [...activeNpcs, ...characters].find(c => c.id === charId);
    if (!char) return;
    const weapon = char.inventory?.weapon || { name: 'Desarmado', attribute: 'Agilidade', damage: '1d4', category: 'leve' };
    const attrKey = weapon.attribute?.toLowerCase() || 'agility';
    const attrValue = char.attributes?.[attrKey] || 0;
    const bonus = attrValue * (char.proficientAttribute === attrKey ? 2 : 1);
    handleGmActionRoll(char, `Ataque: ${weapon.name}`, bonus, attrKey, weapon.damage || '1d4', weapon.category);
  };

  const handleOpenNpcDamageMenu = (charId) => {
    const char = [...activeNpcs, ...characters].find(c => c.id === charId);
    if (!char) return;
    const result = calculateDamage(char, false);
    addCombatLog(result.message, 'damage');
  };

  const handleViewCharacter = (c, isTemplate = false) => { setViewingCharacter(c); setIsViewingTemplate(isTemplate); };
  const handleBackToList = () => { setViewingCharacter(null); setIsViewingTemplate(false); };

  const renderCombatView = () => {
    const turnOrder = combatData.turn_order || [];
    const currentIdx = combatData.current_turn_index;
    const activeCombatant = turnOrder[currentIdx];
    const activeFullData = [...activeNpcs, ...characters].find(c => c.id === activeCombatant?.character_id);
    const isActiveNpc = activeCombatant?.is_npc;
    const logs = localLogs || [];

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                <div><h2 className="text-3xl font-bold text-brand-text">Mesa de Combate</h2><p className="text-gray-500 text-sm">{combatData.status === 'pending_initiative' ? 'Aguardando Iniciativas...' : 'Rodada Ativa.'}</p></div>
                <div className="flex gap-3">
                    {combatData.status === 'pending_initiative' ? (
                        <button onClick={startRound} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 animate-pulse"><PlayIcon className="h-6 w-6" /> Iniciar Rodada</button>
                    ) : (
                        <button onClick={nextTurn} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700"><ForwardIcon className="h-6 w-6" /> Próximo Turno</button>
                    )}
                    <button onClick={endCombat} className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-3 rounded-xl font-bold hover:bg-red-200 border border-red-200"><StopIcon className="h-6 w-6" /> Encerrar</button>
                </div>
            </div>

            {combatData.status === 'pending_initiative' && (
                <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-yellow-200">
                    <h4 className="font-bold text-gray-600 mb-2">Aguardando:</h4>
                    <div className="flex flex-wrap gap-3">
                        {turnOrder.map((p, idx) => (
                            <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${p.initiative !== null ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                <span className="font-semibold">{p.name}</span>
                                {p.initiative === null && <button onClick={() => gmRoll(idx)} className="ml-2 p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Rolar pelo jogador"><BoltIcon className="h-4 w-4" /></button>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-8">
                <CombatTrackerCarousel turnOrder={turnOrder} currentIdx={currentIdx} combatStatus={combatData.status} allCharacters={[...characters, ...activeNpcs]} onStatChange={handleQuickStatChange} onAttackClick={handleOpenNpcAttackMenu} />
            </div>

            {combatData.status === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
                    <div className="md:col-span-2 bg-white rounded-xl shadow-lg border-2 border-red-100 flex flex-col h-full overflow-hidden">
                        <div className="flex-none flex items-center justify-between p-6 pb-4 border-b border-red-50">
                            <h3 className="text-xl font-bold text-brand-text flex items-center gap-2"><BoltIcon className="h-6 w-6 text-red-500" /> Ações de {activeCombatant?.name}</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar min-h-0">
                            {isActiveNpc && activeFullData ? (
                                <div className="space-y-6">
                                     <div>
                                        <h4 className="font-bold text-gray-500 text-sm mb-2 uppercase tracking-wide">Ataque & Dano</h4>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenNpcAttackMenu(activeFullData.id)} className="flex-1 flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors group">
                                                <span className="font-bold text-red-900">Ataque: {activeFullData.inventory?.weapon?.name || "Desarmado"}</span>
                                            </button>
                                            <button onClick={() => handleOpenNpcDamageMenu(activeFullData.id)} className="flex-none flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg w-32 group">
                                                <FireIcon className="h-6 w-6 text-orange-500 group-hover:scale-110" />
                                                <span className="text-xs text-orange-500">{activeFullData.inventory?.weapon?.damage || '1d4'}</span>
                                            </button>
                                        </div>
                                    </div>
                                    {activeFullData.techniques?.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {activeFullData.techniques.map((tech, i) => (
                                                <button key={i} onClick={() => {
                                                    const attr = tech.attribute?.toLowerCase() || 'agility';
                                                    const bonus = (activeFullData.attributes?.[attr] || 0) * (activeFullData.proficientAttribute === attr ? 2 : 1);
                                                    handleGmActionRoll(activeFullData, `Técnica: ${tech.name}`, bonus, attr);
                                                }} className="flex flex-col p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left">
                                                    <div className="flex justify-between"><span className="font-bold text-purple-900">{tech.name}</span><span className="text-xs bg-white px-2 rounded text-purple-700">{tech.cost}</span></div>
                                                    <p className="text-xs text-purple-700 line-clamp-1">{tech.effect}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400"><p>Turno de Jogador ou NPC não encontrado.</p></div>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-1 bg-gray-900 rounded-xl shadow-lg border border-gray-700 flex flex-col h-full overflow-hidden">
                        <div className="flex-none p-4 pb-2 border-b border-gray-700"><h3 className="text-lg font-bold text-gray-100">Histórico</h3></div>
                        <div className="flex-1 overflow-y-auto p-4 pt-2 custom-scrollbar min-h-0">
                            {logs.map((log, idx) => (
                                <div key={idx} className={`p-2 rounded text-sm border-l-4 mb-2 ${log.type === 'crit' ? 'bg-yellow-900/30 border-yellow-500 text-yellow-100' : 'bg-gray-800 border-purple-500 text-gray-300'}`}>
                                    <p dangerouslySetInnerHTML={{ __html: log.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    {log.damageFormula && <button onClick={() => handleRollDamageFromLog(log)} className="mt-1 text-xs text-orange-400 hover:text-orange-300 underline">Rolar Dano</button>}
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                </div>
            )}
            <RollTestModal isOpen={rollModalData !== null} onClose={() => setRollModalData(null)} title={rollModalData?.title} modifier={rollModalData?.modifier} modifierLabel={rollModalData?.modifierLabel} onRollComplete={(res) => { if(rollModalData?.onRollConfirmed) rollModalData.onRollConfirmed(res); }} />
        </div>
    );
  };

  const renderDashboardView = () => {
    const categories = ["todos", ...new Set(gmImages.map((img) => img.category))];
    const filteredImages = activeCategory === "todos" ? gmImages : gmImages.filter((img) => img.category === activeCategory);

    return (
        <>
            <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-4">
                    <div><h1 className="text-5xl font-bold text-brand-primary">Painel do Mestre</h1></div>
                </div>
                <div className="flex gap-4">
                    <button onClick={endCombat} className="text-red-500 text-sm font-bold flex items-center"><ArrowPathIcon className="h-4 w-4 mr-1"/> Reset</button>
                    <button onClick={() => setIsStartCombatModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2" disabled={!!combatData}><PlayIcon className="h-5 w-5" /> Novo Combate</button>
                    <button onClick={signOut} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Logout</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-bold text-brand-text mb-4 border-b pb-2">Jogadores</h2>
                        {characters.length === 0 && isLoading ? <p className="text-gray-400">Carregando...</p> : (
                            <div className="space-y-3">{characters.map((char) => <GmCharacterCard key={char.id} character={char} onViewCharacter={(c) => handleViewCharacter(c, false)} />)}</div>
                        )}
                    </div>
                    
                    <div className="bg-purple-50 p-6 rounded-2xl shadow-lg border border-purple-100">
                        <div className="flex justify-between items-center mb-4 border-b pb-2 border-purple-200"><h2 className="text-2xl font-bold text-purple-900">Em Cena (Ativos)</h2></div>
                        <div className="space-y-3">
                            {activeNpcs.length === 0 && isLoading ? <p className="text-purple-400">Carregando...</p> : (
                                activeNpcs.length === 0 ? <p className="text-gray-400 italic">Nenhum NPC instanciado na cena.</p> : activeNpcs.map((char) => (
                                    <div key={char.id} className="relative group">
                                        <GmCharacterCard character={char} onViewCharacter={(c) => handleViewCharacter(c, false)} />
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveFromScene(char.id); }} className="absolute top-2 right-2 bg-red-100 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Remover da Cena"><XMarkIcon className="h-4 w-4" /></button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-4 border-b pb-4"><h2 className="text-3xl font-bold text-brand-text">Galeria & Bestiário</h2><button onClick={() => setIsUploadModalOpen(true)} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg">Upload Imagem</button></div>
                <div className="flex space-x-2 border-b mb-4 pb-2 overflow-x-auto">{categories.map((cat) => (<button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 text-sm font-semibold rounded-t-lg capitalize ${activeCategory === cat ? "bg-purple-500 text-white" : "text-gray-500"}`}>{cat}</button>))}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredImages.map((img) => {
                        const template = npcTemplates.find(t => t.imageUrl === img.image_url);
                        return (
                            <div key={img.id} className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${template ? 'border-purple-400' : 'border-transparent'}`}>
                                <img src={img.image_url} alt={img.category} className="w-full h-full object-cover" />
                                {template && <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white bg-blue-500 shadow-sm">{template.name}</div>}
                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2 px-2 text-center">
                                    {!template ? (
                                        <button onClick={() => handleCreateTemplateFromImage(img.image_url)} className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold w-full flex justify-center items-center"><UserPlusIcon className="h-4 w-4 mr-1"/> Criar Modelo</button>
                                    ) : (
                                        <>
                                            <button onClick={() => handleInstantiateNpc(template)} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs font-bold w-full flex justify-center items-center"><SparklesIcon className="h-4 w-4 mr-1"/> Por em Cena</button>
                                            <button onClick={() => handleViewCharacter(template, true)} className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold w-full flex justify-center items-center"><PencilSquareIcon className="h-4 w-4 mr-1"/> Editar Modelo</button>
                                            <button onClick={() => handleDeleteTemplate(template.id)} className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold w-full flex justify-center items-center"><TrashIcon className="h-4 w-4 mr-1"/> Apagar Modelo</button>
                                        </>
                                    )}
                                    <div className="flex space-x-2 mt-2"><button onClick={() => setViewingImage(img.image_url)} className="p-2 bg-gray-600 rounded-full text-white"><MagnifyingGlassIcon className="h-4 w-4" /></button><button onClick={() => handleDeleteImage(img)} className="p-2 bg-red-600 rounded-full text-white"><TrashIcon className="h-4 w-4" /></button></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <StartCombatModal isOpen={isStartCombatModalOpen} onClose={() => setIsStartCombatModalOpen(false)} characters={[...characters, ...activeNpcs]} onStartCombat={createCombat} />
            <GmImageUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleImageUpload} existingCategories={[...new Set(gmImages.map((img) => img.category))]} />
            <ImageViewerModal isOpen={viewingImage !== null} onClose={() => setViewingImage(null)} imageUrl={viewingImage} />
        </>
    );
  };

  if (viewingCharacter) {
    const isMyNpc = viewingCharacter.isNpc && viewingCharacter.userId === user.id;
    return (<> 
        <div className="bg-yellow-100 p-2 text-center text-yellow-800 font-bold border-b border-yellow-300">
            {isViewingTemplate ? "MODO EDIÇÃO DE MODELO (BESTIÁRIO)" : "MODO EDIÇÃO DE INSTÂNCIA"}
        </div>
        <CharacterSheet character={viewingCharacter} onBack={handleBackToList} showNotification={showNotification} onUpdateCharacter={isMyNpc || isViewingTemplate ? handleUpdateCharacter : () => {}} isGmMode={true} /> 
        {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />} 
    </>);
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen">
      {combatData ? renderCombatView() : renderDashboardView()}
      {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
}

export default GameMasterPanel;