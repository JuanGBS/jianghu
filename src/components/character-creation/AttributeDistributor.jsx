import React, { useState, useEffect, useRef } from 'react';
import { ATTRIBUTE_TRANSLATIONS } from '../../data/translations';

const ATTRIBUTE_NAMES = ['vigor', 'agility', 'discipline', 'comprehension', 'presence'];

function AttributeDistributor({ points, clanBonus, onPointsChange, initialTotalPoints = 5, onTotalPointsChange }) {
  const [totalPoints, setTotalPoints] = useState(initialTotalPoints);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  const totalPointsSpent = Object.values(points).reduce((sum, point) => sum + point, 0);
  const pointsRemaining = totalPoints - totalPointsSpent;

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handlePointChange = (attribute, delta) => {
    const bonusValue = clanBonus[attribute] || 0;
    const currentPoints = points[attribute];
    const finalAttributeValue = currentPoints + bonusValue;

    if (delta > 0 && (pointsRemaining <= 0 || finalAttributeValue >= 3)) return;
    if (delta < 0) {
      if (bonusValue > 0 && currentPoints <= 0) return;
      if (bonusValue === 0 && currentPoints <= -1) return;
    }

    const newPoints = { ...points, [attribute]: currentPoints + delta };
    onPointsChange(newPoints);
  };

  const handleSaveTotalPoints = (e) => {
    const newTotal = parseInt(e.target.value, 10);
    if (!isNaN(newTotal) && newTotal >= totalPointsSpent) {
      setTotalPoints(newTotal);
      if (onTotalPointsChange) {
        onTotalPointsChange(newTotal);
      }
    } else {
      setTotalPoints(totalPoints);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveTotalPoints(e);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-brand-text">Distribua seus Atributos</h3>
        
        <div className="relative h-10 w-16">
          {isEditing ? (
            <input
              ref={inputRef}
              type="number"
              defaultValue={totalPoints}
              onBlur={handleSaveTotalPoints}
              onKeyDown={handleKeyDown}
              className="w-full h-full text-center text-lg font-bold bg-white border-2 border-purple-400 rounded-lg focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full h-full bg-brand-accent/80 text-purple-900 font-bold text-lg rounded-lg flex items-center justify-center cursor-pointer hover:bg-brand-accent"
              title="Clique para editar o total de pontos"
            >
              <span>{pointsRemaining}</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {ATTRIBUTE_NAMES.map((attr) => {
          const bonus = clanBonus[attr] || 0;
          
          return (
            <div key={attr} className="flex items-center justify-between bg-white px-3 py-2 rounded-full shadow-md border border-gray-200">
              <span className="font-semibold text-brand-text">{ATTRIBUTE_TRANSLATIONS[attr]}</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handlePointChange(attr, -1)}
                  className="font-bold text-xl text-gray-500 hover:text-red-600 disabled:opacity-50"
                  disabled={(bonus > 0 && points[attr] <= 0) || (bonus === 0 && points[attr] <= -1)}
                >
                  &ndash;
                </button>
                <span className="text-lg font-bold w-4 text-center text-brand-text">{points[attr] + bonus}</span>
                <button 
                  onClick={() => handlePointChange(attr, 1)}
                  className="font-bold text-xl text-gray-500 hover:text-green-600 disabled:opacity-50"
                  disabled={pointsRemaining <= 0 || points[attr] + bonus >= 3}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AttributeDistributor;