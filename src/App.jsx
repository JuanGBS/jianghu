import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { supabase } from './services/supabaseClient';
import SheetManager from './pages/SheetManager.jsx';
import CharacterSheet from './pages/CharacterSheet.jsx';
import NotificationToast from './components/ui/NotificationToast.jsx';
import AuthPage from './pages/AuthPage.jsx';
import RollHistoryDrawer from './components/ui/RollHistoryDrawer.jsx';
import ImageSelectionTray from './components/ui/ImageSelectionTray.jsx';
import ProficiencyChoiceModal from './components/character-sheet/ProficiencyChoiceModal.jsx';
import { BODY_REFINEMENT_LEVELS, CULTIVATION_STAGES, MASTERY_LEVELS } from './data/gameData.js';
import GameMasterPanel from './pages/GameMasterPanel.jsx';
import InitiativeTracker from './components/combat/InitiativeTracker.jsx';
import InitiativeRollModal from './components/combat/InitiativeRollModal.jsx';

const defaultInventory = {
  weapon: { name: '', damage: '', attribute: '', properties: '' },
  armor: { type: 'none', properties: '' },
  general: [],
  money: 0
};

const mapToCamelCase = (data) => {
  if (!data) return null;
  return {
    proficientAttribute: data.proficient_attribute, 
    id: data.id, 
    userId: data.user_id, 
    name: data.name, 
    clanId: data.clan_id, 
    fightingStyle: data.fighting_style, 
    innateBodyId: data.innate_body_id, 
    imageUrl: data.image_url, 
    bodyRefinementLevel: data.body_refinement_level, 
    cultivationStage: data.cultivation_stage, 
    masteryLevel: data.mastery_level, 
    attributes: data.attributes, 
    stats: data.stats, 
    techniques: data.techniques || [], 
    proficientPericias: data.proficient_pericias || [], 
    inventory: data.inventory || defaultInventory, 
    createdAt: data.created_at,
    activeCombatId: data.active_combat_id
  };
};

function AppContent() {
  const { user, profile, isLoading } = useAuth();
  const [character, setCharacter] = useState(null);
  const [characterLoading, setCharacterLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [rollHistory, setRollHistory] = useState(() => JSON.parse(localStorage.getItem('rollHistory') || '[]'));
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isImageTrayOpen, setIsImageTrayOpen] = useState(false);
  const [userImages, setUserImages] = useState([]);
  const [isProficiencyModalOpen, setIsProficiencyModalOpen] = useState(false);
  const [combatData, setCombatData] = useState(null);
  const [showInitiativeRoll, setShowInitiativeRoll] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };
  
  const fetchUserImages = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .storage
      .from('character-images')
      .list(`public/${user.id}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Erro ao buscar imagens:', error);
      showNotification('Erro ao carregar galeria.', 'error');
    } else {
      const imagesWithUrls = data.map(file => {
        const { data: publicUrlData } = supabase
          .storage
          .from('character-images')
          .getPublicUrl(`public/${user.id}/${file.name}`);
        
        return {
          id: file.id,
          name: file.name,
          publicURL: publicUrlData.publicUrl
        };
      });
      setUserImages(imagesWithUrls);
    }
  };

  const handlePlayerInitiativeRoll = async (initiativeValue) => {
    if (!combatData || !character) return;
    
    const { data: freshCombatData, error: fetchError } = await supabase
      .from('combat')
      .select('*')
      .eq('id', combatData.id)
      .single();

    if (fetchError || !freshCombatData) {
      showNotification("Erro ao sincronizar combate.", "error");
      return;
    }

    const participantIndex = freshCombatData.turn_order.findIndex(p => p.character_id === character.id);
    if (participantIndex === -1 || freshCombatData.turn_order[participantIndex].initiative !== null) {
        setShowInitiativeRoll(false);
        return;
    }

    const updatedTurnOrder = [...freshCombatData.turn_order];
    updatedTurnOrder[participantIndex] = { ...updatedTurnOrder[participantIndex], initiative: initiativeValue };
    
    const { error } = await supabase.from('combat').update({ turn_order: updatedTurnOrder }).eq('id', combatData.id);

    if (error) { showNotification("Erro ao enviar iniciativa.", "error"); } 
    else { showNotification(`Iniciativa ${initiativeValue} enviada!`, "success"); setShowInitiativeRoll(false); }
  };
  
  const handleNextTurn = async () => {
    if (!combatData) return;
    const nextIndex = (combatData.current_turn_index + 1) % combatData.turn_order.length;
    await supabase.from('combat').update({ current_turn_index: nextIndex }).eq('id', combatData.id);
  };
  
  const handleEndPlayerTurn = () => {
    if (!combatData || !character) return;
    const currentTurnCharacterId = combatData.turn_order[combatData.current_turn_index].character_id;
    if (character.id !== currentTurnCharacterId) {
      showNotification("Não é o seu turno para finalizar!", "error");
      return;
    }
    handleNextTurn();
  };

  const handleEndCombat = async () => {
    if (!combatData || profile?.role !== 'gm') return;
    // Apenas deleta. Os personagens serão limpos pelo GM Panel antes disso, ou pelo Realtime
    const { error } = await supabase.from('combat').delete().eq('id', combatData.id);
    if (error) { showNotification("Erro ao encerrar combate.", "error"); } 
    else { showNotification("Combate encerrado.", "success"); }
  };

  // --- LOGICA DE COMBATE REVISADA ---
  useEffect(() => {
    if (!user || !character) return;

    const loadCombat = async (combatId) => {
      if (!combatId) {
        setCombatData(null);
        return;
      }

      const { data, error } = await supabase
        .from('combat')
        .select('*')
        .eq('id', combatId)
        .single();

      if (data) {
        console.log("Combate carregado via active_combat_id:", data);
        setCombatData(data);
        
        // Checa Iniciativa
        if (data.status === 'pending_initiative') {
          const myParticipantData = data.turn_order.find(p => p.character_id === character.id);
          if (myParticipantData && myParticipantData.initiative === null) {
            setShowInitiativeRoll(true);
          }
        }
      } else {
        console.log("Combate não encontrado (talvez deletado).");
        setCombatData(null);
      }
    };

    // 1. Carrega combate se o personagem já tiver um ID ativo ao logar
    if (character.activeCombatId) {
      loadCombat(character.activeCombatId);
    } else {
      setCombatData(null); // Garante limpeza se não tiver ID
    }

    // 2. Listener para ATUALIZAÇÕES DO PERSONAGEM (Receber convite)
    const charChannel = supabase
      .channel(`public-character-updates-${character.id}`)
      .on(
        'postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'characters', filter: `id=eq.${character.id}` }, 
        (payload) => {
          const newCharData = mapToCamelCase(payload.new);
          setCharacter(newCharData); // Atualiza estado local do char

          // Se o activeCombatId mudou...
          if (newCharData.activeCombatId !== character.activeCombatId) {
            if (newCharData.activeCombatId) {
              showNotification("Você entrou em combate!", "warning");
              loadCombat(newCharData.activeCombatId);
            } else {
              showNotification("Combate finalizado.", "info");
              setCombatData(null);
              setShowInitiativeRoll(false);
            }
          }
        }
      )
      .subscribe();

    // 3. Listener para ATUALIZAÇÕES DO COMBATE (Turnos, Iniciativa)
    // Só precisamos ouvir UPDATEs, pois a entrada/saída é via 'characters'
    const combatChannel = supabase
      .channel('public-combat-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'combat' },
        (payload) => {
          // Só atualiza se for o combate que estamos participando
          if (character.activeCombatId && payload.new.id === character.activeCombatId) {
             setCombatData(payload.new);
          }
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(charChannel); 
      supabase.removeChannel(combatChannel);
    };
  }, [user, character?.id, character?.activeCombatId]); // Dependências ajustadas

  // Fetch inicial do personagem
  useEffect(() => {
    if (user && profile && profile.role !== 'gm') {
      const fetchCharacter = async () => {
        setCharacterLoading(true);
        const { data, error } = await supabase.from('characters').select('*').eq('user_id', user.id).single();
        if (error && error.code !== 'PGRST116') console.error("Erro ao buscar personagem:", error);
        else setCharacter(mapToCamelCase(data));
        setCharacterLoading(false);
      };
      fetchCharacter();
    } else {
      setCharacterLoading(false);
      setCharacter(null);
    }
  }, [user, profile]);

  const handleSaveCharacter = async (characterData) => {
    const { data, error } = await supabase.from('characters').insert([{ user_id: user.id, ...characterData, inventory: defaultInventory }]).select().single();
    if (error) { showNotification("Falha ao criar personagem.", "error"); } 
    else { setCharacter(mapToCamelCase(data)); }
  };

  const handleDeleteCharacter = async () => {
    if (!character) return;
    const { error } = await supabase.from('characters').delete().eq('id', character.id);
    if (error) { showNotification("Falha ao apagar personagem.", "error"); } 
    else { setCharacter(null); setRollHistory([]); showNotification("Personagem apagado com sucesso.", "success"); }
  };

  const handleUpdateCharacter = async (updatedCharacter) => {
    const dataToUpdate = {
      proficient_attribute: updatedCharacter.proficientAttribute, 
      name: updatedCharacter.name, 
      clan_id: updatedCharacter.clanId, 
      fighting_style: updatedCharacter.fightingStyle, 
      innate_body_id: updatedCharacter.innateBodyId, 
      image_url: updatedCharacter.imageUrl, 
      body_refinement_level: updatedCharacter.bodyRefinementLevel, 
      cultivation_stage: updatedCharacter.cultivationStage, 
      mastery_level: updatedCharacter.masteryLevel, 
      attributes: updatedCharacter.attributes, 
      stats: updatedCharacter.stats, 
      techniques: updatedCharacter.techniques, 
      proficient_pericias: updatedCharacter.proficientPericias, 
      inventory: updatedCharacter.inventory,
      // Não enviamos active_combat_id aqui para evitar que o player sobrescreva acidentalmente,
      // mas se precisar, adicione. O GM controla isso.
    };
    const { data, error } = await supabase.from('characters').update(dataToUpdate).eq('id', updatedCharacter.id).select().single();
    if (error) { showNotification("Falha ao salvar alterações.", "error"); } 
    else {
      const updatedData = mapToCamelCase(data);
      setCharacter(updatedData);
      if (updatedData.cultivationStage === 1 && !updatedData.proficientAttribute) {
        setIsProficiencyModalOpen(true);
      }
    }
  };
  
  const handleProgressionChange = (updates) => {
    if (updates.type === 'attribute_increase' && updates.attribute) {
      const attrToUpdate = updates.attribute;
      const newAttributes = { ...character.attributes, [attrToUpdate]: character.attributes[attrToUpdate] + 1 };
      handleUpdateCharacter({ ...character, attributes: newAttributes });
    } else {
      const newCharacterState = { ...character, ...updates };
      if (newCharacterState.bodyRefinementLevel >= BODY_REFINEMENT_LEVELS.length || newCharacterState.cultivationStage >= CULTIVATION_STAGES.length || newCharacterState.masteryLevel >= MASTERY_LEVELS.length) return;
      handleUpdateCharacter(newCharacterState);
    }
  };

  const handleImageUpload = async (file) => {
    if (!user) return;
    showNotification("Enviando imagem...", "success");
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `public/${user.id}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('character-images').upload(filePath, file);
    if (uploadError) { showNotification("Falha ao enviar imagem.", "error"); return; }
    await fetchUserImages();
    showNotification("Imagem enviada!", "success");
  };

  const handleSelectImage = async (imageUrl) => {
    await handleUpdateCharacter({ ...character, imageUrl });
    setIsImageTrayOpen(false);
  };

  const handleProficiencySelect = async (attribute) => {
    await handleUpdateCharacter({ ...character, proficientAttribute: attribute });
    setIsProficiencyModalOpen(false);
    showNotification(`Proficiência em ${attribute.charAt(0).toUpperCase() + attribute.slice(1)} adquirida!`, "success");
  };

  const addRollToHistory = (rollData) => {
    setRollHistory(prev => [rollData, ...prev].slice(0, 15));
    setIsHistoryOpen(true);
  };

  const handleClearHistory = () => {
    setRollHistory([]);
    showNotification("Histórico de rolagens limpo!", "success");
  };

  const handleOpenImageTray = () => {
    fetchUserImages();
    setIsImageTrayOpen(true);
  };

  if (isLoading) { return <div className="min-h-screen flex items-center justify-center">Carregando...</div>; }
  if (!user) { return <AuthPage />; }

  return (
    <div className="relative min-h-screen">
      {combatData?.status === 'active' && (
        <InitiativeTracker turnOrder={combatData.turn_order} currentIndex={combatData.current_turn_index} />
      )}
      
      {profile?.role === 'gm' ? (
        <GameMasterPanel 
          combatData={combatData}
          onNextTurn={handleNextTurn}
          onEndCombat={handleEndCombat}
        />
      ) : (
        <main>
          {character && (
            <InitiativeRollModal
              isOpen={showInitiativeRoll}
              onRollInitiative={handlePlayerInitiativeRoll}
              agilityBonus={character.attributes.agility}
            />
          )}
          {characterLoading ? (
            <div className="min-h-screen flex items-center justify-center">Carregando Ficha...</div>
          ) : (
            character ? (
              <CharacterSheet 
                character={character} 
                onDelete={handleDeleteCharacter} 
                onUpdateCharacter={handleUpdateCharacter}
                showNotification={showNotification}
                addRollToHistory={addRollToHistory}
                onOpenImageTray={handleOpenImageTray}
                onTrain={handleProgressionChange}
                combatData={combatData}
                onEndTurn={handleEndPlayerTurn}
              />
            ) : (
              <SheetManager onSave={handleSaveCharacter} />
            )
          )}
        </main>
      )}

      {(character || profile?.role === 'gm') && (
        <RollHistoryDrawer 
          history={rollHistory} 
          isOpen={isHistoryOpen} 
          onToggle={() => setIsHistoryOpen(!isHistoryOpen)} 
          onClearHistory={handleClearHistory} 
        />
      )}

      <ImageSelectionTray isOpen={isImageTrayOpen} onClose={() => setIsImageTrayOpen(false)} images={userImages} onSelect={handleSelectImage} onUpload={handleImageUpload} />
      <ProficiencyChoiceModal isOpen={isProficiencyModalOpen} onSelect={handleProficiencySelect} />
      {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
}

function App() { return <AuthProvider><AppContent /></AuthProvider>; }
export default App;