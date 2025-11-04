import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx'; // Certifique-se que a extensão está correta
import * as apiService from './services/apiService'; // <-- ESTA É A LINHA QUE FALTAVA

import SheetManager from './components/SheetManager';
import CharacterSheet from './components/CharacterSheet';
import NotificationToast from './components/NotificationToast';
import AuthPage from './pages/AuthPage';

function AppContent() {
  const { sessionId, isLoading, logout } = useAuth();
  const [character, setCharacter] = useState(null);
  const [characterLoading, setCharacterLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (sessionId) {
      setCharacterLoading(true); // Começa a carregar quando temos uma sessão
      apiService.getCharacter()
        .then(response => {
          setCharacter(response.data);
        })
        .catch(error => {
          if (error.response && error.response.status === 404) {
            setCharacter(null);
          } else {
            console.error("Erro ao buscar personagem:", error);
            logout();
          }
        })
        .finally(() => {
          setCharacterLoading(false);
        });
    } else {
      setCharacterLoading(false);
      setCharacter(null); // Limpa o personagem se a sessão terminar
    }
  }, [sessionId, logout]);

  const handleSaveCharacter = async (characterData) => {
    try {
      const response = await apiService.createCharacter(characterData);
      setCharacter({ ...response.data, techniques: [] });
    } catch (error) {
      console.error("Erro ao criar personagem:", error);
      showNotification("Falha ao criar personagem.", "error");
    }
  };

  const handleDeleteCharacter = async () => {
    try {
      await apiService.deleteCharacter();
      setCharacter(null);
      logout();
    } catch (error) {
      console.error("Erro ao apagar personagem:", error);
      showNotification("Falha ao apagar personagem.", "error");
    }
  };

  const handleUpdateCharacter = async (updatedCharacter) => {
    try {
      const response = await apiService.updateCharacter(updatedCharacter);
      setCharacter(response.data);
    } catch (error) {
      console.error("Erro ao atualizar personagem:", error);
      showNotification("Falha ao salvar alterações.", "error");
    }
  };
  
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  if (isLoading || characterLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!sessionId) {
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
        />
      ) : (
        <SheetManager onSave={handleSaveCharacter} />
      )}

      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
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