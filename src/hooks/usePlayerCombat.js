import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export function usePlayerCombat(character, showNotification) {
  const [combatData, setCombatData] = useState(null);
  const [showInitiativeRoll, setShowInitiativeRoll] = useState(false);
  
  const characterIdRef = useRef(character?.id);
  const activeCombatIdRef = useRef(character?.activeCombatId);
  const combatDataRef = useRef(null);

  useEffect(() => {
    characterIdRef.current = character?.id;
    activeCombatIdRef.current = character?.activeCombatId;
  }, [character]);

  const fetchCombat = useCallback(async () => {
    const combatId = activeCombatIdRef.current;
    if (!combatId) {
      if (combatDataRef.current) {
          setCombatData(null);
          combatDataRef.current = null;
          setShowInitiativeRoll(false);
      }
      return;
    }

    const { data, error } = await supabase
      .from('combat')
      .select('*')
      .eq('id', combatId)
      .maybeSingle();

    if (data) {
      if (JSON.stringify(data) !== JSON.stringify(combatDataRef.current)) {
        setCombatData(data);
        combatDataRef.current = data;
        
        // LÓGICA DE ESTADO DE INICIATIVA
        if (data.status === 'pending_initiative') {
            const me = data.turn_order.find(p => p.character_id === characterIdRef.current);
            // Só mostra se eu ainda não tiver rolado
            if (me && me.initiative === null) {
                setShowInitiativeRoll(true);
            } else {
                setShowInitiativeRoll(false);
            }
        } else if (data.status === 'active') {
            // CORREÇÃO: Garante que fecha o modal se o combate já estiver ativo
            setShowInitiativeRoll(false);
        }
      }
    } else {
      if (combatDataRef.current) {
          setCombatData(null);
          combatDataRef.current = null;
          setShowInitiativeRoll(false);
          showNotification("O Combate terminou ou é inválido.", "info");
      }
    }
  }, []);
  
  const sendInitiative = async (value) => {
    if (!combatData) return;
    
    const { data: fresh } = await supabase.from('combat').select('*').eq('id', combatData.id).single();
    if (!fresh) return;

    const myIndex = fresh.turn_order.findIndex(p => p.character_id === character.id);
    if (myIndex === -1) return;

    const newOrder = [...fresh.turn_order];
    newOrder[myIndex] = { ...newOrder[myIndex], initiative: value };

    setCombatData(prev => ({ ...prev, turn_order: newOrder }));
    setShowInitiativeRoll(false);

    await supabase.from('combat').update({ turn_order: newOrder }).eq('id', combatData.id);
    showNotification(`Iniciativa ${value} enviada!`, "success");
  };

  const endTurn = async () => {
    if (!combatData) return;
    const nextIdx = (combatData.current_turn_index + 1) % combatData.turn_order.length;
    
    setCombatData(prev => ({ ...prev, current_turn_index: nextIdx }));
    
    await supabase.from('combat').update({ current_turn_index: nextIdx }).eq('id', combatData.id);
  };

  useEffect(() => {
    fetchCombat();

    const combatId = activeCombatIdRef.current;
    if (!combatId) return;
    const channel = supabase
      .channel(`player-combat-${combatId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'combat', filter: `id=eq.${combatId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
             setCombatData(null);
             combatDataRef.current = null;
             setShowInitiativeRoll(false);
             showNotification("O Combate terminou.", "info");
          } else {
             const newData = payload.new;
             setCombatData(newData);
             combatDataRef.current = newData;
             
             if (newData.status === 'active') {
                 setShowInitiativeRoll(false);
             }
          }
        }
      )
      .subscribe();

    const interval = setInterval(fetchCombat, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [character?.activeCombatId, fetchCombat]);

  return {
    combatData,
    showInitiativeRoll,
    setShowInitiativeRoll,
    sendInitiative,
    endTurn,
    forceRefresh: fetchCombat
  };
}