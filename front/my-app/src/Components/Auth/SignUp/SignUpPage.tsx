import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    try {
      const response = await fetch('https://localhost:7002/api/Account/Register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
  
      if (response.ok) {
        console.log('Signed up');
        navigate('/login');
      } else {
        const errorText = await response.text();
        
        try {
          // Попытка разобрать JSON
          const errorJson = JSON.parse(errorText);
  
          if (Array.isArray(errorJson) && errorJson.length > 0 && errorJson[0].description) {
            setError(errorJson[0].description); // Берем описание первой ошибки
          } else {
            setError(errorText); // Если это не массив с `description`, выводим как есть
          }
        } catch {
          setError(errorText); // Если JSON парсинг не удался, выводим как строку
        }
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      setError(error.message);
    }
  };
  

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Sign Up</h2>
        {error && <p className="text-danger text-center">{error}</p>} {/* Показываем ошибку, если есть */}
        <form onSubmit={handleSignUp}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="role" className="form-label">
              Your Role (Mentor/Student)
            </label>
            <input
              type="text"
              id="role"
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-2">
            Sign Up
          </button>
          <div className="text-center">
            <p className="text-muted">
              Already have an account? <a href="/login">Login</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
