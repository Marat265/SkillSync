import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleError } from '../../Helpers/errorHandler';
import Button from '../../Components/UI/Button';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [image, setImage] = useState<File | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    if (image) {
      formData.append("image", image); // Добавляем файл
    }
  
    try {
      const response = await fetch('https://localhost:7002/api/Account/Register', {
        method: 'POST',
        body: formData, // Убираем headers, потому что браузер сам установит Content-Type
      });
  
      if (response.ok) {
        console.log('Signed up');
        navigate('/login');
      } else {
        const errorText = await handleError(response);
        setError(errorText);
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
          <div className="mb-3">
            <label htmlFor="image" className="form-label">Profile Image</label>
            <input
              type="file"
              id="image"
              className="form-control"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              accept="image/*"
            />
          </div>

          {/* <button type="submit" className="btn btn-primary w-100 mb-2">
            Sign Up
          </button> */}
          <Button text='Sign Up' className='btn btn-primary w-100 mb-2'/>
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
