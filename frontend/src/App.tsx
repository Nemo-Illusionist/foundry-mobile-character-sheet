// D&D 2024 Character Manager - Main App
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { LoadingSpinner } from './components/shared';
import './App.scss';

// Lazy load pages for code-splitting
const AuthPage = lazy(() => import('./pages/AuthPage'));
const GamesPage = lazy(() => import('./pages/GamesPage'));
const GameLayout = lazy(() => import('./layouts/GameLayout'));
const GamePage = lazy(() => import('./pages/GamePage'));
const CharacterSheetPage = lazy(() => import('./pages/CharacterSheetPage'));
const GameManagePage = lazy(() => import('./pages/GameManagePage'));
const GameItemsPage = lazy(() => import('./pages/GameItemsPage'));

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const fallback = (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <LoadingSpinner size="large" />
    </div>
  );

  return (
    <Suspense fallback={fallback}>
      <Routes>
        {isAuthenticated ? (
          // Authenticated routes
          <>
            <Route path="/games" element={<GamesPage />} />
            {/* All game-related routes wrapped in GameLayout */}
            <Route path="/games/:gameId" element={<GameLayout />}>
              <Route index element={<Navigate to="characters" replace />} />
              <Route path="characters" element={<GamePage />} />
              <Route path="characters/:characterId" element={<CharacterSheetPage />} />
              <Route path="manage" element={<GameManagePage />} />
              <Route path="items" element={<GameItemsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/games" />} />
          </>
        ) : (
          // Unauthenticated routes
          <>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </>
        )}
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <GameProvider>
          <div className="app">
            <AppRoutes />
          </div>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
