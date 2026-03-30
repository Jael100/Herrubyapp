'use client';
import { AuthProvider } from './AuthContext';
import { WalletProvider } from './WalletContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <WalletProvider>
        {children}
      </WalletProvider>
    </AuthProvider>
  );
}
