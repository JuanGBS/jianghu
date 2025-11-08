import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { ATTRIBUTE_TRANSLATIONS } from '../../data/translations';
import { SparklesIcon, FireIcon, ArrowTrendingUpIcon, UserGroupIcon, CubeIcon } from '@heroicons/react/24/solid';

const trainingOptions = [
  { id: 'common_training', label: 'Treinamento Comum', icon: UserGroupIcon, description: 'Aumente um atributo através de um teste.' },
  { id: 'body_refinement', label: 'Refino Corporal', icon: FireIcon, attribute: 'vigor', description: 'Aumenta seu nível de Refino Corporal.' },
  { id: 'cultivation', label: 'Cultivo Espiritual', icon: ArrowTrendingUpIcon, attribute: 'discipline', description: 'Progride em seu Estágio de Cultivo.' },
];

const ATTRIBUTES_KEYS = Object.keys(ATTRIBUTE_TRANSLATIONS);
const getRandomRoll = () => Math.floor(Math.random() * 20) + 1;

function TrainingOptionsModal({ isOpen, onClose, character, showNotification, onTrain }) {
  const [step, setStep] = useState('options');
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [cdValue, setCdValue] = useState(10);
  
  const [rollResult, setRollResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(null);

  useEffect(() => {
    if (!isRolling) return;
    
    const handleRollCompletion = (result) => {
      if (result.isSuccess) {
        showNotification('Treinamento bem-sucedido!', 'success');
        if (selectedTraining.id === 'common_training') {
          onTrain({ type: 'attribute_increase', attribute: selectedAttribute });
        } else if (selectedTraining.id === 'body_refinement') {
          const currentLevel = character.bodyRefinementLevel || 0;
          onTrain({ bodyRefinementLevel: currentLevel + 1 });
        } else if (selectedTraining.id === 'cultivation') {
          const currentMastery = character.masteryLevel || 0;
          const currentStage = character.cultivationStage || 0;
          if (currentMastery < 3) {
            onTrain({ masteryLevel: currentMastery + 1 });
          } else {
            onTrain({ cultivationStage: currentStage + 1, masteryLevel: 1 });
          }
        }
      } else {
        showNotification('Falha no treinamento.', 'error');
      }
    };

    const timeouts = [];
    const finalRoll = rollResult.roll;
    for (let i = 0; i < 8; i++) {
      timeouts.push(setTimeout(() => setDisplayNumber(getRandomRoll()), i * 50));
    }
    for (let i = 0; i < 5; i++) {
      timeouts.push(setTimeout(() => setDisplayNumber(getRandomRoll()), 400 + i * 120));
    }
    for (let i = 0; i < 3; i++) {
      timeouts.push(setTimeout(() => setDisplayNumber(getRandomRoll()), 1000 + i * 250));
    }
    timeouts.push(setTimeout(() => {
      setDisplayNumber(finalRoll);
      setIsRolling(false);
      handleRollCompletion(rollResult); 
    }, 1750));

    return () => timeouts.forEach(clearTimeout);
  }, [isRolling, rollResult, onTrain, character, selectedAttribute, selectedTraining, showNotification]);


  const handleSelectTraining = (training) => {
    setSelectedTraining(training);
    if (training.id === 'common_training') {
      setStep('attribute_selection');
    } else {
      setSelectedAttribute(training.attribute);
      setStep('cd_input');
    }
  };

  const handleAttributeSelect = (attributeKey) => {
    setSelectedAttribute(attributeKey);
    setStep('cd_input');
  };

  const handleRoll = () => {
    if (isRolling) return;
    const attributeValue = character.attributes[selectedAttribute];
    const roll = getRandomRoll();
    const total = roll + attributeValue;
    const isSuccess = total >= cdValue;

    setRollResult({
      roll: roll,
      modifier: attributeValue,
      total: total,
      isSuccess: isSuccess,
    });
    
    setIsRolling(true);
  };

  const resetAndClose = () => {
    setStep('options');
    setSelectedTraining(null);
    setSelectedAttribute(null);
    setCdValue(10);
    setRollResult(null);
    setIsRolling(false);
    setDisplayNumber(null);
    onClose();
  };
  
  const renderContent = () => {
    if (rollResult) {
      const isSuccess = rollResult.isSuccess;
      return (
        <div className="text-center">
          <div className="flex flex-col items-center justify-center mb-4">
            <h3 className="text-2xl font-bold text-brand-text">Resultado do Treino</h3>
            <p className="text-gray-500">Teste de {ATTRIBUTE_TRANSLATIONS[selectedAttribute]}</p>
          </div>
          <div className="my-6 flex justify-center items-baseline space-x-4 text-gray-700 text-lg">
            <div className="flex flex-col items-center">
              <strong className="text-purple-700 text-5xl w-20">
                {isRolling ? displayNumber : rollResult.roll}
              </strong>
              <span className="text-xs text-gray-500">Dado</span>
            </div>
            <span className="text-3xl font-light text-gray-400">+</span>
            <div className="flex flex-col items-center">
              <strong className="text-purple-700 text-5xl">{rollResult.modifier}</strong>
              <span className="text-xs text-gray-500">Bônus</span>
            </div>
            <span className="text-3xl font-light text-gray-400">=</span>
            <div className="flex flex-col items-center">
              <strong className="text-5xl w-20 text-brand-text">
                {isRolling ? '...' : rollResult.total}
              </strong>
              <span className="text-xs text-gray-500">Total</span>
            </div>
          </div>
          {!isRolling && (
            <div className="mt-6 space-y-4">
              <div className={`p-4 rounded-lg ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className="font-bold text-xl">
                  {isSuccess ? 
                    <span className="text-green-700">Sucesso! (CD {cdValue})</span> : 
                    <span className="text-red-700">Falha! (CD {cdValue})</span>
                  }
                </p>
              </div>
              <button
                onClick={resetAndClose}
                className="w-full px-8 py-3 bg-gray-200 text-brand-text font-semibold rounded-lg hover:bg-gray-300"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      );
    }

    if (step === 'attribute_selection') {
      return (
        <div className="text-center">
          <h3 className="text-xl font-bold text-brand-text mb-4">Treinamento Comum</h3>
          <p className="text-gray-600 mb-6">Escolha o atributo que deseja treinar.</p>
          <div className="space-y-3">
            {ATTRIBUTES_KEYS.map(attrKey => (
              <button key={attrKey} onClick={() => handleAttributeSelect(attrKey)} className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left font-semibold">
                {ATTRIBUTE_TRANSLATIONS[attrKey]}
              </button>
            ))}
          </div>
           <button onClick={() => setStep('options')} className="mt-6 px-6 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-semibold">Voltar</button>
        </div>
      );
    }

    if (step === 'cd_input') {
      return (
        <div className="text-center">
          <h3 className="text-xl font-bold text-brand-text mb-2">Treino de {selectedTraining.label}</h3>
          <p className="text-gray-500 mb-4">Teste de <span className="font-bold">{ATTRIBUTE_TRANSLATIONS[selectedAttribute]}</span></p>
          <label htmlFor="cd" className="block text-sm font-semibold text-gray-600 mb-2">
            Defina a Dificuldade do Teste (CD)
          </label>
          <input
            id="cd"
            type="number"
            value={cdValue}
            onChange={(e) => setCdValue(parseInt(e.target.value, 10) || 0)}
            className="w-32 p-2 text-center text-lg border rounded-md"
          />
          <div className="flex justify-center space-x-4 mt-6">
            <button onClick={() => setStep(selectedTraining.id === 'common_training' ? 'attribute_selection' : 'options')} className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-semibold">Voltar</button>
            <button onClick={handleRoll} className="px-6 py-2 bg-brand-primary text-brand-text font-bold rounded-md hover:brightness-105">Rolar Dado</button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="text-center">
        <CubeIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-brand-text mb-6">Escolha seu Treinamento</h3>
        <div className="space-y-3">
          {trainingOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button key={option.id} onClick={() => handleSelectTraining(option)} className="w-full flex items-start p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors">
                <Icon className="h-6 w-6 text-purple-600 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-brand-text">{option.label}</span>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      {renderContent()}
    </Modal>
  );
}

export default TrainingOptionsModal;