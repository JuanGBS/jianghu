import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { supabase } from './services/supabaseClient';

import SheetManager from './components/SheetManager';
import CharacterSheet from './components/CharacterSheet';
import NotificationToast from './components/NotificationToast';
import AuthPage from './pages/AuthPage';

// Função auxiliar para mapear de snake_case (banco de dados) para camelCase (React)
const mapToCamelCase = (data) => {
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    clanId: data.clan_id,
    fightingStyle: data.fighting_style,
    imageUrl: data.image_url,
    bodyRefinementLevel: data.body_refinement_level,
    cultivationStage: data.cultivation_stage,
    masteryLevel: data.mastery_level,
    attributes: data.attributes,
    stats: data.stats,
    techniques: data.techniques || [],
    proficientPericias: data.proficient_pericias || [],
    createdAt: data.created_at,
  };
};

function AppContent() {
  const { user, isLoading, signOut } = useAuth();
  const [character, setCharacter] = useState(null);
  const [characterLoading, setCharacterLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchCharacter = async () => {
        setCharacterLoading(true);
        const { data, error } = await supabase
          .from('characters')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Erro ao buscar personagem:", error);
        } else {
          setCharacter(mapToCamelCase(data)); // USA O MAPEAMENTO
        }
        setCharacterLoading(false);
      };
      fetchCharacter();
    } else {
      setCharacterLoading(false);
      setCharacter(null);
    }
  }, [user]);

  const handleSaveCharacter = async (characterData) => {
    const { data, error } = await supabase
      .from('characters')
      .insert([
        { 
          user_id: user.id,
          name: characterData.name,
          clan_id: characterData.clanId,
          fighting_style: characterData.fightingStyle,
          attributes: characterData.attributes,
          stats: characterData.stats,
          proficient_pericias: characterData.proficientPericias,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar personagem:", error);
      showNotification("Falha ao criar personagem.", "error");
    } else {
      setCharacter(mapToCamelCase(data)); // USA O MAPEAMENTO
    }
  };

  const handleDeleteCharacter = async () => {
    const { error } = await supabase.from('characters').delete().eq('user_id', user.id);
    if (error) {
      console.error("Erro ao apagar personagem:", error);
      showNotification("Falha ao apagar personagem.", "error");
    } else {
      setCharacter(null);
    }
  };

  const handleUpdateCharacter = async (updatedCharacter) => {
    // Mapeia de camelCase (React) para snake_case (banco de dados) antes de salvar
    const dataToUpdate = {
      id: updatedCharacter.id,
      user_id: updatedCharacter.userId,
      name: updatedCharacter.name,
      clan_id: updatedCharacter.clanId,
      fighting_style: updatedCharacter.fightingStyle,
      image_url: updatedCharacter.imageUrl,
      body_refinement_level: updatedCharacter.bodyRefinementLevel,
      cultivation_stage: updatedCharacter.cultivationStage,
      mastery_level: updatedCharacter.masteryLevel,
      attributes: updatedCharacter.attributes,
      stats: updatedCharacter.stats,
      techniques: updatedCharacter.techniques,
      proficient_pericias: updatedCharacter.proficientPericias,
    };

    const { data, error } = await supabase
      .from('characters')
      .update(dataToUpdate)
      .eq('id', updatedCharacter.id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar personagem:", error);
      showNotification("Falha ao salvar alterações.", "error");
    } else {
      setCharacter(mapToCamelCase(data)); // USA O MAPEAMENTO
    }
  };
  
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  if (isLoading || characterLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return <AuthPage />;
  }
  
  return (
    <>
      {character ? (
        <CharacterSheet 
          character={character} 
          onDelete={handleDeleteCharacter} 
          onUpdateCharacter={handleUpdateCharacter}
          showNotification={showNotification}
          signOut={signOut}
        />
      ) : (
        <SheetManager onSave={handleSaveCharacter} />
      )}
      {notification && (
        <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;