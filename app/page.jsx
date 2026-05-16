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
  const { setBalance } = useWallet();
  const [view,setView]=useState('landing');
  const [showProfile,setShowProfile]=useState(false);
  const [kycOpen,setKycOpen]=useState(false);
  const [activeTab,setActiveTab]=useState('body');
  const [onboardingDone,setOnboardingDone]=useState(false);
  const [topupProcessing,setTopupProcessing]=useState(false);
  const [topupResult,setTopupResult]=useState(null); // { credits, newBalance }
  const [bookingSuccess,setBookingSuccess]=useState(false);

  useEffect(()=>{ if(!loading&&isAuthenticated) setView('app'); },[isAuthenticated,loading]);
  useEffect(()=>{ if(isAuthenticated&&isOnboarded) setView('app'); },[isAuthenticated,isOnboarded]);

  // Confirm Stripe top-up after Checkout redirect (?topup=success&session_id=...&pkg=...)
  useEffect(() => {
    if (!isAuthenticated) return;
    const params = new URLSearchParams(window.location.search);
    const topup = params.get('topup');
    const sessionId = params.get('session_id');
    const pkg = params.get('pkg');
    if (topup === 'success' && sessionId && pkg) {
      // Clean URL immediately so refresh doesn't re-trigger
      const url = new URL(window.location.href);
      url.searchParams.delete('topup');
      url.searchParams.delete('session_id');
      url.searchParams.delete('pkg');
      window.history.replaceState({}, '', url.toString());
      setTopupProcessing(true);
      api.wallet.confirmTopup(sessionId, pkg)
        .then((result) => {
          if (result?.newBalance !== undefined) setBalance(result.newBalance);
          setTopupResult({ credits: result?.credits ?? 0, newBalance: result?.newBalance ?? 0 });
        })
        .catch((e) => {
          console.error('Top-up confirm failed:', e);
          setView('app');
          setActiveTab('wallet');
        })
        .finally(() => setTopupProcessing(false));
    } else if (topup === 'cancel') {
      const url = new URL(window.location.href);
      url.searchParams.delete('topup');
      window.history.replaceState({}, '', url.toString());
    }
  }, [isAuthenticated]);

  // Handle Stripe booking redirect (?booking=success&session_id=...)
  useEffect(() => {
    if (!isAuthenticated) return;
    const params = new URLSearchParams(window.location.search);
    const booking = params.get('booking');
    if (booking === 'success') {
      const url = new URL(window.location.href);
      url.searchParams.delete('booking');
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', url.toString());
      setBookingSuccess(true);
    } else if (booking === 'cancel') {
      const url = new URL(window.location.href);
      url.searchParams.delete('booking');
      url.searchParams.delete('booking_id');
      window.history.replaceState({}, '', url.toString());
    }
  }, [isAuthenticated]);

  if(loading) return <div style={{minHeight:'100vh',background:'#7D1A1D',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:48,color:'white'}}>♦</span></div>;

  // Booking success screen
  if(bookingSuccess) return (
    <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#7D1A1D,#B8292F)',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 24px'}}>
      <style>{`@keyframes popIn{0%{transform:scale(0.7);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}@keyframes fadeSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{background:'#FDF9F6',borderRadius:28,padding:'44px 32px',width:'100%',maxWidth:400,textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,0.25)',animation:'fadeSlide 0.5s ease'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'#E8F5E9',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',animation:'popIn 0.5s ease'}}>
          <span style={{fontSize:40}}>✓</span>
        </div>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2rem',color:'#2A2A35',fontWeight:700,margin:'0 0 10px'}}>Booking Confirmed!</p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:'1rem',color:'#6B6B7B',margin:'0 0 28px',lineHeight:1.6}}>
          Your session is booked. Credits have been deducted from your Wellness Wallet.
        </p>
        <button
          onClick={()=>{setBookingSuccess(false);setView('app');setActiveTab('program');}}
          style={{width:'100%',padding:'16px 0',background:'linear-gradient(135deg,#B8292F,#7D1A1D)',color:'white',border:'none',borderRadius:14,fontFamily:"'DM Sans',sans-serif",fontSize:'1rem',fontWeight:600,cursor:'pointer',letterSpacing:'0.02em'}}>
          View My Programs ✦
        </button>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:'0.8rem',color:'#9B9BAB',marginTop:16}}>Payment confirmed · Her Ruby</p>
      </div>
    </div>
  );

  // Stripe redirect: payment processing screen
  if(topupProcessing) return (
    <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#7D1A1D,#B8292F)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:24}}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{fontSize:52,color:'white',animation:'spin 1.8s linear infinite',display:'inline-block'}}>✦</div>
      <div style={{textAlign:'center',animation:'fadeIn 0.4s ease'}}>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.7rem',color:'white',fontWeight:600,margin:'0 0 8px'}}>Confirming payment…</p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:'0.95rem',color:'rgba(255,255,255,0.75)',margin:0}}>This takes just a moment</p>
      </div>
    </div>
  );

  // Stripe redirect: payment success screen
  if(topupResult) return (
    <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#7D1A1D,#B8292F)',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 24px'}}>
      <style>{`@keyframes popIn{0%{transform:scale(0.7);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}@keyframes fadeSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{background:'#FDF9F6',borderRadius:28,padding:'44px 32px',width:'100%',maxWidth:400,textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,0.25)',animation:'fadeSlide 0.5s ease'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'#E8F5E9',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',animation:'popIn 0.5s ease'}}>
          <span style={{fontSize:40}}>✓</span>
        </div>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2rem',color:'#2A2A35',fontWeight:700,margin:'0 0 10px'}}>Payment Successful!</p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:'1rem',color:'#6B6B7B',margin:'0 0 24px',lineHeight:1.6}}>
          <strong style={{color:'#5E8C61',fontSize:'1.3rem'}}>+{topupResult.credits} credits</strong> have been added to your wallet.
        </p>
        <div style={{background:'linear-gradient(135deg,#B8292F18,#B8292F08)',borderRadius:16,padding:'16px 20px',marginBottom:28,border:'1px solid #B8292F22'}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:'0.85rem',color:'#7A6E6E',margin:'0 0 4px'}}>NEW BALANCE</p>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2.4rem',fontWeight:700,color:'#B8292F',margin:0}}>{topupResult.newBalance} <span style={{fontSize:'1rem',color:'#7A6E6E',fontWeight:400}}>credits</span></p>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:'0.85rem',color:'#7A6E6E',margin:'4px 0 0'}}>= ${(topupResult.newBalance*20).toLocaleString()} of value</p>
        </div>
        <button
          onClick={()=>{setTopupResult(null);setView('app');setActiveTab('wallet');}}
          style={{width:'100%',padding:'16px 0',background:'linear-gradient(135deg,#B8292F,#7D1A1D)',color:'white',border:'none',borderRadius:14,fontFamily:"'DM Sans',sans-serif",fontSize:'1rem',fontWeight:600,cursor:'pointer',letterSpacing:'0.02em'}}>
          View My Wallet ✦
        </button>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:'0.8rem',color:'#9B9BAB',marginTop:16}}>Transaction confirmed · Her Ruby</p>
      </div>
    </div>
  );
  if(kycOpen) return <KYCScreen onComplete={()=>{setKycVerified(true);setKycOpen(false);}} onSkip={()=>setKycOpen(false)}/>;
  if(showProfile&&isAuthenticated) return <ProfileScreen user={user} profile={profile} onBack={()=>setShowProfile(false)} onSignOut={()=>{onSignOut();setView('landing');setShowProfile(false);}} onUpdate={updateProfile}/>;
  if(isAuthenticated&&!isOnboarded&&!onboardingDone) return <OnboardScreen onComplete={async(a)=>{setOnboardingDone(true);try{await updateProfile({...a,onboarding_complete:true});}catch(e){console.error('Profile save failed:',e);}}}/>;
  if(view==='app'&&isAuthenticated) return <AppShell profile={profile} user={user} activeTab={activeTab} setActiveTab={setActiveTab} kycVerified={kycVerified} onStartKYC={()=>setKycOpen(true)} onOpenProfile={()=>setShowProfile(true)}/>;
  if(view==='auth') return <AuthScreen onAuthSuccess={()=>setView('app')}/>;
  return <LandingPage onGetStarted={()=>setView('auth')} onSignIn={()=>setView('auth')}/>;
}
