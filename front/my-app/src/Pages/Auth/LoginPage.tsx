import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../Components/UI/Button';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
  
    try {
      const response = await fetch('https://localhost:7002/api/Account/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${errorText || 'Нет данных'}`);
      }
      const data = await response.json(); 
      localStorage.setItem('user', JSON.stringify({
         email, 
         isAuthenticated: true,
          role: data.role,  
          userName: data.userName
        }));
      navigate('/');
    } catch (error: any) {
      console.error('Ошибка при входе:', error.message);
      setError(error.message);
    }
  }
  
  const handleGoogleLogin = () => {
    window.location.href = 'https://localhost:7002/api/Account/google-login?returnUrl=https://localhost:3000/google-callback';
  };

  return (
    <div className="login-page-container">
      <div className="card login-card p-4 p-md-5" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="text-center mb-4">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {error && (
          <div className="alert-custom text-center">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-floating-custom">
            <input
              type="email"
              id="email"
              className="form-control form-control-custom"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email" className="form-label-custom">Email Address</label>
          </div>

          <div className="form-floating-custom">
            <input
              type="password"
              id="password"
              className="form-control form-control-custom"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <label htmlFor="password" className="form-label-custom">Password</label>
          </div>

          <Button 
            text='Sign In' 
            className='btn-login-custom w-100 mb-3'
          />
          
          <div className="divider">
            <span className="divider-text">Or continue with</span>
          </div>

          {/* Аккуратная круглая кнопка Google */}
          <div className="text-center mb-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="btn btn-google-circle"
              title="Sign in with Google"
            >
              <img
                src="https://avatars.mds.yandex.net/i?id=a5fbca57620ac6be7e39a97ad3d11eea37040359-3513278-images-thumbs&n=13"
                alt="Google"
                className="google-icon-circle"
              />
            </button>
            <div className="google-text">Continue with Google</div>
          </div>

          <div className="text-center">
            <p className="text-muted mb-0">
              Don't have an account?{' '}
              <a href="/signup" className="signup-link">Sign up</a>
            </p>
          </div>
        </form>
      </div>

      {/* Add Font Awesome for icons */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
      />
    </div>
  );
};

export default LoginPage;