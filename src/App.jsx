import React, { useState, useEffect } from 'react';
import SheetManager from './components/SheetManager';
import CharacterSheet from './components/CharacterSheet';

const STORAGE_KEY = 'tales-of-jianghu-character';

function App() {
  const [character, setCharacter] = useState(null);

  useEffect(() => {
    const savedCharacter = localStorage.getItem(STORAGE_KEY);
    if (savedCharacter) {
      setCharacter(JSON.parse(savedCharacter));
    }
  }, []);

  const handleSaveCharacter = (characterData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characterData));
    setCharacter(characterData);
  };

  const handleDeleteCharacter = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCharacter(null);
  };

  return (
    // REMOVIDAS as classes de tema escuro. Agora ele vai usar o body do index.css
    <main>
      {character ? (
        <CharacterSheet character={character} onDelete={handleDeleteCharacter} />
      ) : (
        // O SheetManager agora controla todo o seu próprio layout
        <SheetManager onSave={handleSaveCharacter} />
      )}
    </main>
  );
}

export default App;