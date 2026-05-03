'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useWallet } from '../lib/WalletContext';
import { api } from '../lib/api';
import LandingPage   from '../components/LandingPage';
import AuthScreen    from '../components/AuthScreen';
import OnboardScreen from '../components/OnboardScreen';
import KYCScreen     from '../components/KYCScreen';
import AppShell      from '../components/AppShell';
import ProfileScreen from '../components/ProfileScreen';

export default function Home() {
  const { user, profile, loading, isAuthenticated, isOnboarded, kycVerified, setKycVerified, onSignOut, updateProfile } = useAuth();
  const { refresh: refreshWallet } = useWallet();
  const [view,setView]=useState('landing');
  const [showProfile,setShowProfile]=useState(false);
  const [kycOpen,setKycOpen]=useState(false);
  const [activeTab,setActiveTab]=useState('body');

  useEffect(()=>{ if(!loading&&isAuthenticated) setView('app'); },[isAuthenticated,loading]);

  // Confirm Stripe top-up after Checkout redirect (?topup=success&session_id=...&pkg=...)
  useEffect(() => {
    if (!isAuthenticated) return;
    const params = new URLSearchParams(window.location.search);
    const topup = params.get('topup');
    const sessionId = params.get('session_id');
    const pkg = params.get('pkg');
    if (topup === 'success' && sessionId && pkg) {
      api.wallet.confirmTopup(sessionId, pkg)
        .then(() => refreshWallet())
        .catch((e) => console.error('Top-up confirm failed:', e))
        .finally(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('topup');
          url.searchParams.delete('session_id');
          url.searchParams.delete('pkg');
          window.history.replaceState({}, '', url.toString());
          setActiveTab('wallet');
        });
    } else if (topup === 'cancel') {
      const url = new URL(window.location.href);
      url.searchParams.delete('topup');
      window.history.replaceState({}, '', url.toString());
    }
  }, [isAuthenticated, refreshWallet]);

  if(loading) return <div style={{minHeight:'100vh',background:'#7D1A1D',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:48,color:'white'}}>♦</span></div>;
  if(kycOpen) return <KYCScreen onComplete={()=>{setKycVerified(true);setKycOpen(false);}} onSkip={()=>setKycOpen(false)}/>;
  if(showProfile&&isAuthenticated) return <ProfileScreen user={user} profile={profile} onBack={()=>setShowProfile(false)} onSignOut={()=>{onSignOut();setView('landing');setShowProfile(false);}} onUpdate={updateProfile}/>;
  if(isAuthenticated&&!isOnboarded) return <OnboardScreen onComplete={async(a)=>{await updateProfile({...a,onboarding_complete:true});}}/>;
  if(view==='app'&&isAuthenticated) return <AppShell profile={profile} user={user} activeTab={activeTab} setActiveTab={setActiveTab} kycVerified={kycVerified} onStartKYC={()=>setKycOpen(true)} onOpenProfile={()=>setShowProfile(true)}/>;
  if(view==='auth') return <AuthScreen onAuthSuccess={()=>setView('app')}/>;
  return <LandingPage onGetStarted={()=>setView('auth')} onSignIn={()=>setView('auth')}/>;
}
