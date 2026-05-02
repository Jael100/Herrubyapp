// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, getProfile, updateProfile } from './supabase';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [profile, setProfile]         = useState(null);
  const [session, setSession]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [kycVerified, setKycVerified] = useState(false);

  // Load profile from Supabase
  const loadProfile = useCallback(async (userId) => {
    const { data } = await getProfile(userId);
    if (data) {
      setProfile(data);
      setKycVerified(data.kyc_status === 'verified');
    }
  }, []);

  // Initialise from stored session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
          // Sync with backend (creates profile row if first OAuth login)
          try {
            await api.auth.syncProfile({
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
              email: session.user.email,
            });
            await loadProfile(session.user.id);
          } catch (_) { /* non-blocking */ }
        } else {
          setProfile(null);
          setKycVerified(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  async function handleUpdateProfile(updates) {
    if (!user) return;
    const { data } = await updateProfile(user.id, updates);
    if (data) setProfile(data);
    return data;
  }

  function handleSignOut() {
    setUser(null);
    setProfile(null);
    setSession(null);
    setKycVerified(false);
  }

  const value = {
    user,
    profile,
    session,
    loading,
    kycVerified,
    setKycVerified,
    updateProfile: handleUpdateProfile,
    onSignOut: handleSignOut,
    isAuthenticated: !!user,
    isOnboarded: profile?.onboarding_complete ?? false,
    walletBalance: 0, // managed separately in WalletContext
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
