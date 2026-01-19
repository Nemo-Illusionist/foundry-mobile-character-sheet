// D&D 2024 Character Manager - Main App
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { LoadingSpinner } from './components/shared';
import AuthPage from './pages/AuthPage';
import GamesPage from './pages/GamesPage';
import GameLayout from './layouts/GameLayout';
import GamePage from './pages/GamePage.tsx';
import CharacterSheetPage from './pages/CharacterSheetPage';
import GameManagePage from './pages/GameManagePage';
import GameItemsPage from './pages/GameItemsPage';
import './App.css';

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

  return (
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
  );
}

function App() {
  return (
    <BrowserRouter>
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
