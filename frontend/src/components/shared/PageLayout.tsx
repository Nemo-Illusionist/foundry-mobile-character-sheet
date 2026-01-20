// PageLayout Component - Consistent page layout for list pages
import { ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { Button } from './Button';
import './PageLayout.scss';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`page-layout ${className}`}>
      <div className="page-container">{children}</div>
    </div>
  );
}

// Page Header
interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  backButton?: {
    label: string;
    onClick: () => void;
  };
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, backButton, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        {backButton && (
          <Button variant="secondary" onClick={backButton.onClick} className="page-back-btn">
            ← {backButton.label}
          </Button>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <div className="page-subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

// Loading State
interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="page-loading">
      <LoadingSpinner size="large" />
      <p>{message}</p>
    </div>
  );
}

// Empty State
interface PageEmptyProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function PageEmpty({ icon = '📭', title, description, action }: PageEmptyProps) {
  return (
    <div className="page-empty">
      <div className="page-empty-icon">{icon}</div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}

// Section with title and count
interface PageSectionProps {
  title: string;
  count?: number;
  children: ReactNode;
}

export function PageSection({ title, count, children }: PageSectionProps) {
  return (
    <div className="page-section">
      <h2 className="page-section-title">
        {title}
        {count !== undefined && <span className="page-section-count">{count}</span>}
      </h2>
      {children}
    </div>
  );
}

// Grid for cards
interface PageGridProps {
  children: ReactNode;
  minWidth?: string;
}

export function PageGrid({ children, minWidth = '300px' }: PageGridProps) {
  return (
    <div className="page-grid" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))` }}>
      {children}
    </div>
  );
}
