import React from 'react';
import { BoltIcon, ShieldCheckIcon, HandRaisedIcon, PlusCircleIcon, CheckCircleIcon, EyeIcon, ClockIcon, NoSymbolIcon } from '@heroicons/react/24/solid';

function CombatPage({ character, combatState, onNewTurn, openRollModal, onOpenAttackModal, onOpenMinorActionModal, onActionUsed, isMyTurn, onEndTurn, combatData }) {

  // 0. VERIFICAÇÃO DE SEGURANÇA: SE NÃO TIVER DADOS
  if (!combatData) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col h-full items-center justify-center text-center">
        <NoSymbolIcon className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-500">Nenhum Combate Ativo</h3>
        <p className="text-gray-400 text-sm mt-2">Aguarde o Mestre iniciar um combate...</p>
      </div>
    );
  }

  // 1. STATUS PENDENTE (SALA DE ESPERA / INICIATIVA)
  if (combatData.status === 'pending_initiative') {
    // Verifica se EU já rolei minha iniciativa
    const myData = combatData.turn_order.find(p => p.character_id === character.id);
    const myInitiative = myData?.initiative;
    const hasRolled = myInitiative !== null && myInitiative !== undefined;

    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col h-full items-center justify-center text-center">
        <div className="animate-bounce bg-purple-100 p-6 rounded-full mb-6">
          <ClockIcon className="h-16 w-16 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-brand-text mb-2">Preparando Combate...</h2>
        
        {!hasRolled ? (
          <div className="space-y-2">
             <p className="text-gray-600 text-lg font-bold animate-pulse">Role sua Iniciativa!</p>
             <p className="text-sm text-gray-500">(O modal deve aparecer na tela)</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-green-600 font-bold text-xl">Sua Iniciativa: {myInitiative}</p>
            <p className="text-gray-500">Aguardando o Mestre iniciar a rodada.</p>
          </div>
        )}

        <div className="mt-8 w-full max-w-md bg-gray-50 rounded-lg p-4 border text-left max-h-60 overflow-y-auto">
          <h4 className="font-bold text-gray-500 text-sm mb-2 sticky top-0 bg-gray-50 pb-1">Participantes:</h4>
          <ul className="space-y-2">
            {combatData.turn_order.map((p, idx) => (
              <li key={idx} className="flex justify-between items-center border-b pb-1 last:border-0">
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                   {p.is_npc && <span className="text-xs bg-red-100 text-red-600 px-1 rounded">NPC</span>}
                   {p.name}
                </span>
                {p.initiative !== null ? (
                  <span className="text-purple-600 font-bold">{p.initiative}</span>
                ) : (
                  <span className="text-gray-400 text-sm italic">Rolando...</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // --- LÓGICA PADRÃO DE COMBATE (STATUS ACTIVE) ---

  const currentTurnIndex = combatData.current_turn_index || 0;
  const turnOrder = combatData.turn_order || [];
  const activeParticipant = turnOrder[currentTurnIndex];
  
  const activeName = activeParticipant ? activeParticipant.name : '...';

  const handleDodge = () => {
    openRollModal({
      title: 'Teste de Esquiva',
      modifier: character.attributes.agility,
      modifierLabel: 'Agilidade'
    });
  };

  const handleBlock = () => {
    openRollModal({
      title: 'Teste de Bloqueio',
      modifier: character.attributes.vigor,
      modifierLabel: 'Vigor'
    });
  };
  
  const handleMovement = () => {
    if (combatState.actionsUsed.movement) return;
    onActionUsed('movement');
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col max-h-[70vh] h-full relative">
      
      {/* FEEDBACK DE TURNO */}
      <div className="flex justify-between items-center border-b pb-2 mb-4 flex-shrink-0">
        <h3 className="text-xl font-semibold text-brand-text">Painel de Combate</h3>
        {isMyTurn ? (
          <span className="text-sm font-bold text-green-600 animate-pulse bg-green-100 px-2 py-1 rounded-full">
            SEU TURNO
          </span>
        ) : (
          <span className="text-sm font-bold text-gray-500 flex items-center bg-gray-100 px-2 py-1 rounded-full">
            <ClockIcon className="h-4 w-4 mr-1" />
            Vez de: {activeName}
          </span>
        )}
      </div>

      {/* OVERLAY DE BLOQUEIO (SE NÃO FOR O TURNO) */}
      {!isMyTurn && (
        <div className="absolute inset-0 top-16 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-b-2xl pointer-events-none">
        </div>
      )}
      
      <div className="space-y-6 overflow-y-auto pr-2 flex-grow">
        {/* STATUS DA RODADA */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-gray-700 text-sm">Ações no Turno</h4>
            {isMyTurn && (
              <button onClick={onNewTurn} className="text-xs font-semibold text-purple-600 hover:text-purple-800 underline">
                Resetar Ações
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 bg-gray-100 p-2 rounded-lg text-center font-semibold text-sm">
            <button 
              onClick={handleMovement} 
              disabled={!isMyTurn || combatState.actionsUsed.movement}
              className={`py-1 rounded-md transition-colors disabled:opacity-50 ${
                combatState.actionsUsed.movement 
                  ? 'line-through text-gray-400 bg-gray-200' 
                  : 'text-gray-800 hover:bg-white bg-white shadow-sm'
              }`}
            >
              Movimento
            </button>
            <span className={`py-1 rounded-md ${combatState.actionsUsed.major ? 'line-through text-gray-400 bg-gray-200' : 'text-gray-800 bg-white shadow-sm'}`}>
              Ação Maior
            </span>
            <span className={`py-1 rounded-md ${combatState.actionsUsed.minor ? 'line-through text-gray-400 bg-gray-200' : 'text-gray-800 bg-white shadow-sm'}`}>
              Ação Menor
            </span>
          </div>

          {combatState.isConcentrated && (
            <div className="mt-3 bg-blue-50 border border-blue-200 p-2 rounded-lg flex items-center justify-center text-blue-800 text-sm font-bold animate-pulse">
              <EyeIcon className="h-4 w-4 mr-2" />
              Concentrado (Próximo ataque com Vantagem)
            </div>
          )}
        </div>

        {/* BOTÕES DE AÇÃO PRINCIPAL */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-gray-700 block text-sm mb-2">Ação Maior</h4>
            <button 
                onClick={onOpenAttackModal}
                disabled={!isMyTurn || combatState.actionsUsed.major}
                className="w-full flex flex-col items-center justify-center space-y-1 p-4 bg-red-100 text-red-800 font-bold rounded-xl hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
            >
                <BoltIcon className="h-8 w-8" />
                <span>Atacar / Técnica</span>
            </button>
          </div>
          <div>
            <h4 className="font-bold text-gray-700 block text-sm mb-2">Ação Menor</h4>
            <button 
                onClick={onOpenMinorActionModal}
                disabled={!isMyTurn || combatState.actionsUsed.minor}
                className="w-full flex flex-col items-center justify-center space-y-1 p-4 bg-blue-100 text-blue-800 font-bold rounded-xl hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
            >
                <PlusCircleIcon className="h-8 w-8" />
                <span>Usar Ação Menor</span>
            </button>
          </div>
        </div>
        
        {/* REAÇÕES */}
        <div className="relative z-20 pt-4 border-t mt-2">
          <h4 className="font-bold text-gray-700 block text-sm mb-2">Defesa Ativa (Reação)</h4>
          <div className="grid grid-cols-2 gap-3">
             <button onClick={handleDodge} className="flex items-center justify-center space-x-2 p-3 bg-green-100 text-green-800 font-bold rounded-lg hover:bg-green-200 shadow-sm border border-green-200">
                <HandRaisedIcon className="h-5 w-5" />
                <span>Esquivar</span>
             </button>
             <button onClick={handleBlock} className="flex items-center justify-center space-x-2 p-3 bg-yellow-100 text-yellow-800 font-bold rounded-lg hover:bg-yellow-200 shadow-sm border border-yellow-200">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Bloquear</span>
            </button>
          </div>
        </div>
      </div>

      {/* FINALIZAR TURNO */}
      <div className="mt-auto pt-4 border-t">
        <button
          onClick={onEndTurn}
          disabled={!isMyTurn}
          className={`w-full flex items-center justify-center space-x-2 p-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
             isMyTurn 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:scale-[1.02]' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <CheckCircleIcon className="h-6 w-6" />
          <span>{isMyTurn ? 'Finalizar Turno' : `Aguardando ${activeName}...`}</span>
        </button>
      </div>
    </div>
  );
}

export default CombatPage;