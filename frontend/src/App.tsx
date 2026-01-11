import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { initializeSocket } from './socket/connection';
import LoginPage from './pages/LoginPage';
import CharacterSelectPage from './pages/CharacterSelectPage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import './App.css';

function App() {
  const { isAuthenticated } = useGameStore();

  useEffect(() => {
    initializeSocket();
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/characters" /> : <LoginPage />}
          />
          <Route
            path="/characters"
            element={isAuthenticated ? <CharacterSelectPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/character/:actorId"
            element={isAuthenticated ? <CharacterSheetPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/characters" : "/login"} />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
