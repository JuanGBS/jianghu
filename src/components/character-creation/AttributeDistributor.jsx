import React, { useState } from 'react';
import { ATTRIBUTE_TRANSLATIONS } from '../../data/translations';

const ATTRIBUTE_NAMES = ['vigor', 'agility', 'discipline', 'comprehension', 'presence'];

function AttributeDistributor({ points, clanBonus, onPointsChange }) {
  const [totalPoints, setTotalPoints] = useState(5);
  const totalPointsSpent = Object.values(points).reduce((sum, point) => sum + point, 0);
  const pointsRemaining = totalPoints - totalPointsSpent;

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

  const handleTotalPointsChange = (e) => {
    const newTotal = parseInt(e.target.value, 10);
    if (newTotal >= 0) {
      setTotalPoints(newTotal);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-brand-text">Distribua seus Atributos</h3>
        <div className="flex items-center">
          <input
            type="number"
            value={totalPoints}
            onChange={handleTotalPointsChange}
            min="0"
            max="12"
            className="w-16 px-2 py-1 text-lg font-bold rounded-md border-gray-300"
          />
          <span className="bg-brand-accent/80 text-purple-900 font-bold text-lg rounded-lg px-3 py-1 min-w-[40px] text-center ml-2">
            {pointsRemaining}
          </span>
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
