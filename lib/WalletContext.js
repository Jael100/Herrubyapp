// src/context/WalletContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const { isAuthenticated } = useAuth();
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

  useEffect(() => { refresh(); }, [refresh]);

  function deductCredits(amount) {
    setBalance(b => Math.max(0, b - amount));
  }

  function addCredits(amount, txEntry) {
    setBalance(b => b + amount);
    if (txEntry) setTx(prev => [txEntry, ...prev]);
  }

  return (
    <WalletContext.Provider value={{ balance, setBalance, fundingSource, setFunding, transactions, setTx: setTx, loading, refresh, deductCredits, addCredits }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
