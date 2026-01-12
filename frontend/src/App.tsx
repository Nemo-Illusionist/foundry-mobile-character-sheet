// D&D 2024 Character Manager - Main App
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import AuthPage from './pages/AuthPage';
import GamesPage from './pages/GamesPage';
import CharactersPage from './pages/CharactersPage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import GameManagePage from './pages/GameManagePage';
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
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/games" /> : <AuthPage />}
      />
      <Route
        path="/games"
        element={isAuthenticated ? <GamesPage /> : <Navigate to="/auth" />}
      />
      <Route
        path="/games/:gameId/characters"
        element={isAuthenticated ? <CharactersPage /> : <Navigate to="/auth" />}
      />
      <Route
        path="/games/:gameId/characters/:characterId"
        element={isAuthenticated ? <CharacterSheetPage /> : <Navigate to="/auth" />}
      />
      <Route
        path="/games/:gameId/manage"
        element={isAuthenticated ? <GameManagePage /> : <Navigate to="/auth" />}
      />
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/games" : "/auth"} />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
