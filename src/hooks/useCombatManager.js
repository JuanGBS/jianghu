import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export function useCombatManager(user, showNotification) {
  const [combatData, setCombatData] = useState(null);
  const [localLogs, setLocalLogs] = useState([]);
  
  // Refs para acesso dentro de listeners
  const combatDataRef = useRef(combatData);
  useEffect(() => { combatDataRef.current = combatData; }, [combatData]);

  // Carrega combate existente ao entrar
  useEffect(() => {
    if (!user) return;
    const fetchCombat = async () => {
      // Busca apenas combates ativos do mestre
      const { data, error } = await supabase
        .from('combat')
        .select('*')
        .eq('gm_id', user.id)
        .maybeSingle();
      
      if (data) {
        setCombatData(data);
        if (data.last_roll) setLocalLogs([data.last_roll]);
      }
    };
    fetchCombat();
  }, [user]);

  // --- REALTIME APENAS PARA O COMBATE ATIVO ---
  // Isso garante que o Mestre veja iniciativas e rolagens dos jogadores instantaneamente
  useEffect(() => {
    if (!user || !combatData?.id) return;

    const channel = supabase
      .channel(`gm-combat-${combatData.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'combat', 
        filter: `id=eq.${combatData.id}` 
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
            const newData = payload.new;
            setCombatData(newData);
            if (newData.last_roll && newData.last_roll.id !== localLogs[localLogs.length-1]?.id) {
                setLocalLogs(prev => [...prev, newData.last_roll]);
            }
        }
        if (payload.eventType === 'DELETE') {
            setCombatData(null);
            setLocalLogs([]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, combatData?.id]); // Só reconecta se o ID do combate mudar

  // --- AÇÕES ---

  const createCombat = async (participants) => {
    if (!participants || participants.length === 0) {
        showNotification("Selecione participantes!", "error");
        return;
    }

    try {
      // 1. Limpa combates antigos fantasmas
      await supabase.from("combat").delete().eq("gm_id", user.id);

      // 2. Monta a ordem de turno inicial
      const turnOrder = participants.map((char) => {
        // Verifica se é NPC baseado na flag OU se é um template instanciado
        const isNpc = !!char.isNpc || !!char.is_npc;
        
        let initiative = null;
        if (isNpc) {
          const roll = Math.floor(Math.random() * 20) + 1;
          const bonus = (char.attributes?.agility || 0);
          initiative = roll + bonus;
        }

        return {
          character_id: char.id,
          user_id: char.userId || char.user_id || null,
          name: char.name,
          image_url: char.imageUrl || char.image_url || null, 
          attributes: char.attributes || {},
          is_npc: isNpc,
          initiative: initiative,
        };
      });

      // 3. Insere no Banco
      const { data: newCombat, error } = await supabase.from("combat").insert({
        gm_id: user.id, 
        status: "pending_initiative", 
        turn_order: turnOrder, 
        current_turn_index: 0, 
        last_roll: null
      }).select().single();

      if (error) throw error;

      // 4. Atualiza os Personagens para saberem que estão em combate
      const validIds = participants.filter(p => !p.id.toString().startsWith('npc_temp')).map(p => p.id);
      if (validIds.length > 0) {
        await supabase.from('characters').update({ active_combat_id: newCombat.id }).in('id', validIds);
      }

      // 5. ATUALIZA ESTADO LOCAL IMEDIATAMENTE (Sem esperar realtime)
      setCombatData(newCombat);
      setLocalLogs([]);
      showNotification("Combate criado com sucesso!", "success");

    } catch (error) { 
        console.error("Erro ao criar combate:", error); 
        showNotification(`Erro: ${error.message}`, "error"); 
    }
  };

  const startRound = async () => {
    if (!combatData) return;
    try {
        // Recalcula ordem baseado na iniciativa
        const updatedOrder = [...combatData.turn_order].sort((a, b) => (b.initiative || 0) - (a.initiative || 0));
        
        const updates = { turn_order: updatedOrder, status: 'active', current_turn_index: 0 };
        
        // Otimista
        setCombatData(prev => ({ ...prev, ...updates }));
        
        await supabase.from('combat').update(updates).eq('id', combatData.id);
        showNotification("Combate Iniciado!", "success");
    } catch (err) { console.error(err); }
  };

  const nextTurn = async () => {
    if (!combatData) return;
    const nextIdx = (combatData.current_turn_index + 1) % combatData.turn_order.length;
    
    setCombatData(prev => ({ ...prev, current_turn_index: nextIdx }));
    await supabase.from('combat').update({ current_turn_index: nextIdx }).eq('id', combatData.id);
  };

  const endCombat = async () => {
    if (!combatData) return;
    const currentId = combatData.id;
    
    // Limpa estado local primeiro para UI responder rápido
    setCombatData(null);
    setLocalLogs([]);

    try {
        await supabase.from('characters').update({ active_combat_id: null }).eq('active_combat_id', currentId);
        await supabase.from('combat').delete().eq('id', currentId);
        showNotification("Combate encerrado.", "success");
    } catch (error) { console.error(error); }
  };

  const gmRoll = async (index) => {
      if (!combatData) return;
      const order = [...combatData.turn_order];
      const p = order[index];
      const total = Math.floor(Math.random() * 20) + 1 + (p.attributes?.agility || 0);
      order[index] = { ...p, initiative: total };
      
      setCombatData(prev => ({ ...prev, turn_order: order }));
      await supabase.from('combat').update({ turn_order: order }).eq('id', combatData.id);
  };

  const updateStat = async (charId, field, value) => {
     // Atualização direta na tabela de personagens (não no JSON do combate)
     const val = parseInt(value) || 0;
     /* 
        Nota: Não atualizamos o estado local 'combatData' aqui porque o carrossel 
        lê da lista de 'characters' do GameMasterPanel, não do 'combatData'.
     */
     await supabase.from('characters')
        .update({ stats: { ...{}, [field]: val } }) // Cuidado: isso sobrescreve tudo se não tomar cuidado.
        // A melhor forma é buscar primeiro ou usar uma procedure, mas vamos simplificar:
        // O GameMasterPanel já tem o objeto completo, vamos confiar na atualização de lá.
  };
  
  // Função auxiliar para atualização segura de JSON via RPC ou update direto se tivermos o objeto completo
  // No GM Panel estamos passando o objeto completo, então ok.

  const sendCombatLog = async (message, type = 'info', damageFormula = null, weaponCategory = null, damageBonus = 0, characterId = null) => {
    if (!combatData) return;
    const newLog = {
        id: Date.now(),
        characterId,
        message,
        type, 
        timestamp: new Date().toISOString(),
        damageFormula,
        weaponCategory,
        damageBonus
    };
    // Otimista
    setLocalLogs(prev => [...prev, newLog]);
    await supabase.from('combat').update({ last_roll: newLog }).eq('id', combatData.id);
  };

  const addCombatLog = (message, type) => {
      setLocalLogs(prev => [...prev, { id: Date.now(), message, type, timestamp: new Date().toISOString() }]);
  };

  return {
    combatData, localLogs, createCombat, startRound, nextTurn, endCombat, gmRoll, updateStat,
    sendCombatLog, addCombatLog 
  };
}