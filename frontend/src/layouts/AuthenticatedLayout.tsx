// AuthenticatedLayout - Wrapper for authenticated pages with side navigation
import { ReactNode } from 'react';
import { SideNav } from '../components/shared/SideNav';
import { MobileTabBar } from '../components/shared/MobileTabBar';
import './AuthenticatedLayout.css';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  variant: 'games' | 'game';
  onCreateGame?: () => void;
  onOpenSettings?: () => void;
  isGM?: boolean;
}

export function AuthenticatedLayout({
  children,
  variant,
  onCreateGame,
  onOpenSettings,
  isGM
}: AuthenticatedLayoutProps) {
  return (
    <div className="authenticated-layout">
      <SideNav
        variant={variant}
        onCreateGame={onCreateGame}
        onOpenSettings={onOpenSettings}
        isGM={isGM}
      />
      <main className="authenticated-content">
        {children}
      </main>
      {variant === 'game' && <MobileTabBar variant="game" />}
    </div>
  );
}
