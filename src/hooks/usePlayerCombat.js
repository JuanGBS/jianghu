import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export function usePlayerCombat(character, showNotification) {
  const [combatData, setCombatData] = useState(null);
  const [showInitiativeRoll, setShowInitiativeRoll] = useState(false);
  
  // Refs para acesso dentro dos callbacks do subscription sem recriar o listener
  const characterIdRef = useRef(character?.id);
  
  useEffect(() => {
    characterIdRef.current = character?.id;
  }, [character]);

  // Função de busca manual (usada no carregamento inicial e no Re-focus)
  const fetchCombat = useCallback(async () => {
    const combatId = character?.activeCombatId;
    
    if (!combatId) {
      setCombatData(null);
      setShowInitiativeRoll(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('combat').select('*').eq('id', combatId).maybeSingle();
      
      if (error) throw error;

      if (data) {
        setCombatData(data);
        
        // Verifica se precisa rolar iniciativa
        if (data.status === 'pending_initiative') {
            const me = data.turn_order.find(p => p.character_id === characterIdRef.current);
            // Se eu existo no combate E minha iniciativa é nula
            if (me && (me.initiative === null || me.initiative === undefined)) {
                setShowInitiativeRoll(true);
            } else {
                setShowInitiativeRoll(false);
            }
        } else {
            setShowInitiativeRoll(false);
        }
      } else {
        // Se tem ID no personagem mas não achou combate, o combate foi deletado
        setCombatData(null);
        setShowInitiativeRoll(false);
      }
    } catch (err) {
      console.error("Erro ao buscar combate:", err);
    }
  }, [character?.activeCombatId]);

  // --- REALTIME SUBSCRIPTION (O CORAÇÃO DA MUDANÇA) ---
  useEffect(() => {
    const combatId = character?.activeCombatId;
    if (!combatId) return;

    // Busca inicial
    fetchCombat();

    // Inscreve no canal específico deste combate
    const channel = supabase
      .channel(`player-combat-${combatId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'combat', 
        filter: `id=eq.${combatId}` 
      }, (payload) => {
        
        if (payload.eventType === 'DELETE') {
            setCombatData(null);
            setShowInitiativeRoll(false);
            showNotification("O combate terminou.", "info");
        } 
        else if (payload.eventType === 'UPDATE') {
            const newData = payload.new;
            setCombatData(newData);

            // Checa iniciativa novamente em tempo real
            if (newData.status === 'pending_initiative') {
                const me = newData.turn_order.find(p => p.character_id === characterIdRef.current);
                if (me && me.initiative === null) setShowInitiativeRoll(true);
                else setShowInitiativeRoll(false);
            } else {
                setShowInitiativeRoll(false);
            }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [character?.activeCombatId, fetchCombat, showNotification]);

  // --- AÇÕES DO JOGADOR ---

  const sendInitiative = async (value) => {
    if (!combatData) return;
    
    // Busca versão fresca para evitar conflito de concorrência
    const { data: fresh } = await supabase.from('combat').select('*').eq('id', combatData.id).single();
    if (!fresh) return;

    const myIndex = fresh.turn_order.findIndex(p => p.character_id === character.id);
    if (myIndex === -1) return;

    const newOrder = [...fresh.turn_order];
    newOrder[myIndex] = { ...newOrder[myIndex], initiative: value };

    // Otimista: Atualiza local antes
    setCombatData(prev => ({ ...prev, turn_order: newOrder }));
    setShowInitiativeRoll(false);

    await supabase.from('combat').update({ turn_order: newOrder }).eq('id', combatData.id);
    showNotification(`Iniciativa ${value} enviada!`, "success");
  };

  const endTurn = async () => {
    if (!combatData) return;
    // O próximo turno é calculado no front apenas para UX, o backend/mestre é a fonte real
    const nextIdx = (combatData.current_turn_index + 1) % combatData.turn_order.length;
    
    // Update apenas do index
    await supabase.from('combat').update({ current_turn_index: nextIdx }).eq('id', combatData.id);
  };

  const sendPlayerLog = async (actionName, rollResult, damageFormula = null, weaponCategory = null, damageBonus = 0) => {
    if (!combatData) return;

    const total = rollResult.total;
    const roll = rollResult.roll;
    const bonus = rollResult.modifier;
    const isCrit = roll === 20;
    const isFail = roll === 1;

    let logMsg = `${character.name} usou **${actionName}**: Rolou **${total}** (${roll}${bonus >= 0 ? '+' : ''}${bonus}).`;
    if (isCrit) logMsg += " **CRÍTICO!**";
    if (isFail) logMsg += " **FALHA CRÍTICA!**";

    const newLog = {
        id: Date.now(),
        characterId: character.id,
        message: logMsg,
        type: isCrit ? 'crit' : (isFail ? 'fail' : 'info'),
        timestamp: new Date().toISOString(),
        damageFormula,
        damageBonus
    };

    await supabase.from('combat').update({ last_roll: newLog }).eq('id', combatData.id);
  };

  return {
    combatData, 
    showInitiativeRoll, 
    setShowInitiativeRoll, 
    sendInitiative, 
    endTurn, 
    forceRefresh: fetchCombat, // Expõe para o botão de refresh manual
    sendPlayerLog
  };
}