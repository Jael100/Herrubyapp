'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import LandingPage   from '../components/LandingPage';
import AuthScreen    from '../components/AuthScreen';
import OnboardScreen from '../components/OnboardScreen';
import KYCScreen     from '../components/KYCScreen';
import AppShell      from '../components/AppShell';
import ProfileScreen from '../components/ProfileScreen';

export default function Home() {
  const { user, profile, loading, isAuthenticated, isOnboarded, kycVerified, setKycVerified, onSignOut, updateProfile } = useAuth();
  const [view,setView]=useState('landing');
  const [showProfile,setShowProfile]=useState(false);
  const [kycOpen,setKycOpen]=useState(false);
  const [activeTab,setActiveTab]=useState('body');

  useEffect(()=>{ if(!loading&&isAuthenticated) setView('app'); },[isAuthenticated,loading]);

  if(loading) return <div style={{minHeight:'100vh',background:'#7D1A1D',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:48,color:'white'}}>♦</span></div>;
  if(kycOpen) return <KYCScreen onComplete={()=>{setKycVerified(true);setKycOpen(false);}} onSkip={()=>setKycOpen(false)}/>;
  if(showProfile&&isAuthenticated) return <ProfileScreen user={user} profile={profile} onBack={()=>setShowProfile(false)} onSignOut={()=>{onSignOut();setView('landing');setShowProfile(false);}} onUpdate={updateProfile}/>;
  if(isAuthenticated&&!isOnboarded) return <OnboardScreen onComplete={async(a)=>{await updateProfile({...a,onboarding_complete:true});}}/>;
  if(view==='app'&&isAuthenticated) return <AppShell profile={profile} user={user} activeTab={activeTab} setActiveTab={setActiveTab} kycVerified={kycVerified} onStartKYC={()=>setKycOpen(true)} onOpenProfile={()=>setShowProfile(true)}/>;
  if(view==='auth') return <AuthScreen onAuthSuccess={()=>setView('app')}/>;
  return <LandingPage onGetStarted={()=>setView('auth')} onSignIn={()=>setView('auth')}/>;
}
