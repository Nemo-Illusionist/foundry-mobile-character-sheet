// Authentication Page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import './AuthPage.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/games');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          {/*<h1 className="auth-app-title">TTRPG</h1>*/}
          <h1 className="auth-app-title">D&D24</h1>
          <p className="auth-app-subtitle">Character Master</p>
        </div>

        {isLogin ? (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
}
