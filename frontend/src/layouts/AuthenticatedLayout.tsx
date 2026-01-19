// AuthenticatedLayout - Wrapper for authenticated pages with side navigation
import { ReactNode } from 'react';
import { SideNav, MobileTabBar } from '../components/shared';
import './AuthenticatedLayout.css';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  variant: 'games' | 'game';
  onCreateGame?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  isGM?: boolean;
}

export function AuthenticatedLayout({
  children,
  variant,
  onCreateGame,
  onOpenSettings,
  onLogout,
  isGM
}: AuthenticatedLayoutProps) {
  return (
    <div className="authenticated-layout">
      <SideNav
        variant={variant}
        onCreateGame={onCreateGame}
        onOpenSettings={onOpenSettings}
        onLogout={onLogout}
        isGM={isGM}
      />
      <main className="authenticated-content">
        {children}
      </main>
      {variant === 'game' && <MobileTabBar variant="game" />}
    </div>
  );
}
