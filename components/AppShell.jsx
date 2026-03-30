'use client';
// src/screens/AppShell.jsx
// Main container after login — hosts all five tabs
import React from 'react';
import { StatusBar, TabBar } from './UI';
import { C } from '../lib/constants';
import MyBodyScreen   from './MyBodyScreen';
import ProgramsScreen from './ProgramsScreen';
import CircleScreen   from './CircleScreen';
import WalletScreen   from './WalletScreen';
import HubScreen      from './HubScreen';

export default function AppShell({ profile, user, activeTab, setActiveTab, kycVerified, onStartKYC, onOpenProfile }) {
  const name    = profile?.name || user?.user_metadata?.full_name || user?.email || 'M';
  const initial = name[0].toUpperCase();

  const screens = {
    body:    <MyBodyScreen   profile={profile} />,
    program: <ProgramsScreen kycVerified={kycVerified} onStartKYC={onStartKYC} />,
    circle:  <CircleScreen   kycVerified={kycVerified} onStartKYC={onStartKYC} />,
    wallet:  <WalletScreen />,
    hub:     <HubScreen />,
  };

  return (
    <div style={{ minHeight:'100vh', background:C.cream, display:'flex', justifyContent:'center' }}>
      <div style={{ width:'100%', maxWidth:430, minHeight:'100vh', background:C.cream, position:'relative' }}>
        <StatusBar onProfileClick={onOpenProfile} userInitial={initial} />
        <div style={{ paddingTop:52, paddingBottom:72, minHeight:'100vh', overflowY:'auto' }}>
          {screens[activeTab]}
        </div>
        <TabBar active={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  );
}
