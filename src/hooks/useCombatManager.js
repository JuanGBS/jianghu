import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

export function useCombatManager(user, showNotification) {
  const [combatData, setCombatData] = useState(null);
  const combatIdRef = useRef(null);

  // Função centralizada para FORÇAR a atualização dos dados
  const refreshCombat = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('combat')
        .select('*')
        .eq('gm_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar combate:", error);
        return;
      }

      // Atualiza o estado se houver dados, ou limpa se não houver
      if (data) {
        setCombatData(data);
        combatIdRef.current = data.id;
      } else {
        setCombatData(null);
        combatIdRef.current = null;
      }
    } catch (err) {
      console.error("Erro fatal no refresh:", err);
    }
  }, [user]);

  // Setup Inicial e Realtime (como backup)
  useEffect(() => {
    refreshCombat();

    const channel = supabase
      .channel(`gm_combat_sync_${user?.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'combat', filter: `gm_id=eq.${user?.id}` },
        (payload) => {
          // Se recebermos um evento do realtime, atualizamos.
          // Mas não dependemos SÓ disso.
          if (payload.eventType === 'DELETE') {
            setCombatData(null);
          } else {
            setCombatData(payload.new);
            combatIdRef.current = payload.new.id;
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, refreshCombat]);

  // --- AÇÕES ---

  // 1. CRIAR COMBATE
  const createCombat = async (participants) => {
    try {
      const turnOrder = participants.map((char) => {
        const isNpc = !!char.isNpc || !!char.is_npc || (typeof char.id === 'string' && char.id.startsWith('npc_'));
        let initiative = null;
        
        if (isNpc) {
          const roll = Math.floor(Math.random() * 20) + 1;
          const bonus = (char.attributes?.agility || 0);
          initiative = roll + bonus;
        }

        const finalImage = char.imageUrl || char.image_url || null;
        const finalUserId = char.userId || char.user_id || null;
        
        return {
          character_id: char.id,
          user_id: finalUserId,
          name: char.name,
          image_url: finalImage, 
          attributes: char.attributes || {},
          is_npc: isNpc,
          initiative: initiative,
        };
      });

      // Limpeza
      await supabase.from("combat").delete().gt("id", "00000000-0000-0000-0000-000000000000");

      // Insert
      const { data: newCombat, error } = await supabase.from("combat").insert({
        gm_id: user.id,
        status: "pending_initiative",
        turn_order: turnOrder,
        current_turn_index: 0,
      }).select().single();

      if (error) throw error;

      // Vinculo
      const validIds = participants
        .filter(p => p.id && !p.id.toString().startsWith('npc_temp'))
        .map(p => p.id);

      if (validIds.length > 0) {
        await supabase.from('characters').update({ active_combat_id: newCombat.id }).in('id', validIds);
      }

      // Atualiza estado local via refresh garantido
      await refreshCombat();
      showNotification("Combate criado!", "success");

    } catch (error) {
      console.error(error);
      showNotification("Erro ao criar combate.", "error");
    }
  };

  // 2. INICIAR RODADA
  const startRound = async () => {
    if (!combatData) return;
    
    try {
        // Busca dados frescos primeiro
        const { data: freshCombat } = await supabase
            .from('combat')
            .select('*')
            .eq('id', combatData.id)
            .single();

        if (!freshCombat) return;

        const updatedOrder = freshCombat.turn_order.map(p => {
            if (p.initiative === null || p.initiative === undefined) {
                return { ...p, initiative: Math.floor(Math.random() * 20) + 1 + (p.attributes?.agility || 0) };
            }
            return p;
        }).sort((a, b) => (b.initiative || 0) - (a.initiative || 0));

        await supabase.from('combat').update({
            turn_order: updatedOrder,
            status: 'active',
            current_turn_index: 0
        }).eq('id', combatData.id);

        // FORÇA ATUALIZAÇÃO DA TELA
        await refreshCombat();
        showNotification("Rodada Iniciada!", "success");

    } catch (err) {
        console.error(err);
        showNotification("Erro ao iniciar rodada.", "error");
    }
  };

  // 3. PRÓXIMO TURNO (Estratégia de Fetch Manual)
  const nextTurn = async () => {
    // Usa ref ou state atual
    const currentId = combatIdRef.current || combatData?.id;
    if (!currentId) return;

    try {
        // 1. Pega do banco para garantir índice correto
        const { data: fresh, error } = await supabase
            .from('combat')
            .select('current_turn_index, turn_order')
            .eq('id', currentId)
            .single();

        if (error || !fresh) throw new Error("Erro sync");

        const len = fresh.turn_order?.length || 1;
        const current = fresh.current_turn_index || 0;
        const nextIndex = (current + 1) % len;

        // 2. Atualiza no Banco
        const { error: updateError } = await supabase
            .from('combat')
            .update({ current_turn_index: nextIndex })
            .eq('id', currentId);

        if (updateError) throw updateError;

        // 3. FORÇA O REFRESH IMEDIATO (Ignora cookie/socket errors)
        await refreshCombat();

    } catch (err) {
        console.error("Erro nextTurn:", err);
        showNotification("Erro ao passar turno.", "error");
    }
  };

  // 4. ENCERRAR
  const endCombat = async () => {
    const currentId = combatData?.id;
    
    // Limpa UI imediatamente para feedback rápido
    setCombatData(null);
    combatIdRef.current = null;

    try {
        if (currentId) {
             await supabase.from('characters').update({ active_combat_id: null }).eq('active_combat_id', currentId);
        }
        await supabase.from('combat').delete().eq('gm_id', user.id);
        
        // Garante que limpou
        await refreshCombat();
        showNotification("Combate encerrado.", "success");
    } catch (error) {
        console.error(error);
    }
  };

  // 5. ROLAGEM GM
  const gmRoll = async (index) => {
      if (!combatData) return;
      const order = [...combatData.turn_order];
      const p = order[index];
      const total = Math.floor(Math.random() * 20) + 1 + (p.attributes?.agility || 0);
      order[index] = { ...p, initiative: total };
      
      await supabase.from('combat').update({ turn_order: order }).eq('id', combatData.id);
      
      // Força update
      await refreshCombat();
      showNotification(`Rolado ${total} para ${p.name}`, "success");
  };

  const updateStat = async (charId, field, value) => {
     const val = parseInt(value) || 0;
     const { data } = await supabase.from('characters').select('stats').eq('id', charId).single();
     if (data) {
         const newStats = { ...data.stats, [field]: val };
         await supabase.from('characters').update({ stats: newStats }).eq('id', charId);
         // Stats não precisa de refreshCombat pois é gerido localmente no GameMasterPanel para performance
     }
  };

  return {
    combatData,
    createCombat,
    startRound,
    nextTurn,
    endCombat,
    gmRoll,
    updateStat
  };
}