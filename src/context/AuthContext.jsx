import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearLocalData = () => {
    localStorage.removeItem('jianghu_auth_token_v1'); 
    localStorage.removeItem('sb-jgsucvfebonkaunlbbow-auth-token');
    
    setUser(null);
    setProfile(null);
  };

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
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: { user: validUser }, error: userError } = await supabase.auth.getUser();

          if (userError || !validUser) {
            throw new Error("Sessão inválida no servidor");
          }

          if (mounted) {
            setUser(validUser);
            const profileData = await fetchProfile(validUser.id);
            setProfile(profileData);
          }
        } else {
          if (mounted) clearLocalData();
        }
      } catch (error) {
        console.warn("Sessão inválida detectada, fazendo logout forçado...", error.message);
        if (mounted) {
          clearLocalData();
          await supabase.auth.signOut().catch(() => {});
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          clearLocalData();
          return;
        }

        if (session?.user) {
          setUser(session.user);
          if (!profile || profile.id !== session.user.id) {
             const profileData = await fetchProfile(session.user.id);
             setProfile(profileData);
          }
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erro ao comunicar logout ao servidor:", error);
    } finally {
      clearLocalData();
      setIsLoading(false);
      window.location.reload();
    }
  };

  const authValue = {
    user,
    profile,
    isLoading,
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: handleSignOut,
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