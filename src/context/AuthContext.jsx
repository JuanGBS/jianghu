import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função auxiliar para buscar o perfil
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Erro ao buscar perfil:", error);
      }
      return data;
    } catch (err) {
      console.error("Exceção ao buscar perfil:", err);
      return null;
    }
  };

  useEffect(() => {
    // 1. Verificação Inicial
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Erro na inicialização da Auth:", error.message);
        // Se der erro na sessão (ex: inválida), forçamos logout local
        await supabase.auth.signOut(); 
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // 2. Escutar mudanças em tempo real (Login, Logout, Token Refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth Event:", event);
        
        if (session?.user) {
          setUser(session.user);
          // Só busca o perfil se o usuário mudou ou se ainda não temos perfil
          if (!profile || profile.id !== session.user.id) {
             const profileData = await fetchProfile(session.user.id);
             setProfile(profileData);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 3. Wrapper seguro para Logout
  const handleSignOut = async () => {
    try {
      // Tenta avisar o servidor
      const { error } = await supabase.auth.signOut();
      if (error) console.warn("Aviso no logout (servidor):", error.message);
    } catch (err) {
      console.error("Erro crítico no logout:", err);
    } finally {
      // IMPORTANTE: Limpa o estado local SEMPRE, independente do servidor
      setUser(null);
      setProfile(null);
      localStorage.clear(); // Opcional: Garante limpeza total se estiver muito bugado
      window.location.href = '/'; // Redireciona forçado para garantir
    }
  };

  const authValue = {
    user,
    profile,
    isLoading,
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: handleSignOut, // Usa a nossa função segura
  };

  return (
    <AuthContext.Provider value={authValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};