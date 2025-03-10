import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../Components/UI/Button';


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
        // Попытка прочитать текст ошибки, если есть
        const errorText = await response.text();
        throw new Error(`${errorText || 'Нет данных'}`);
      }
      const data = await response.json(); // Читаем JSON-ответ
      localStorage.setItem('user', JSON.stringify({ email, isAuthenticated: true, role: data.role}));
      navigate('/');
    } catch (error: any) {
      console.error('Ошибка при входе:', error.message);
      setError(error.message);
    }
  }
  

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Login</h2>
        {error && <p className="text-danger text-center">{error}</p>} 
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="text"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {/* <button type="submit" className="btn btn-primary w-100 mb-2">Login</button> */}
          <Button text='Login'  className='btn btn-primary w-100 mb-2'/>
          <div className="text-center">
            <p className="text-muted">
              Don't have an account? <a href="/signup">Sign up</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
