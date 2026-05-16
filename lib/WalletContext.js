import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [balance, setBalance]       = useState(0);
  const [fundingSource, setFunding] = useState(null);
  const [transactions, setTx]       = useState([]);
  const [loading, setLoading]       = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await api.wallet.get();
      if (data) {
        setBalance(data.balance ?? 0);
        setFunding(data.funding_source ?? null);
        setTx(data.transactions ?? []);
      }
    } catch (_) { /* silent — user may not have wallet yet */ }
    finally { setLoading(false); }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => { refresh(); }, [refresh]);

  // Realtime subscription — whenever the wallets row changes in DB, update UI instantly.
  // This eliminates all race conditions: webhook, API writes, and Stripe redirects all
  // push the new balance here automatically without any polling.
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const channel = supabase
      .channel(`wallet-${user.id}`)
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'wallets',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.new?.balance !== undefined) setBalance(payload.new.balance);
        if (payload.new?.funding_source)        setFunding(payload.new.funding_source);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, user?.id]);

  // Re-fetch when user returns to the browser tab (e.g. after Stripe redirect).
  // This is a safety net in case the realtime event was missed.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [refresh]);

  function deductCredits(amount) {
    setBalance(b => Math.max(0, b - amount));
  }

  function addCredits(amount, txEntry) {
    setBalance(b => b + amount);
    if (txEntry) setTx(prev => [txEntry, ...prev]);
  }

  return (
    <WalletContext.Provider value={{ balance, setBalance, fundingSource, setFunding, transactions, setTx, loading, refresh, deductCredits, addCredits }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
