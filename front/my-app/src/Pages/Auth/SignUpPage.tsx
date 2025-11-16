import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleError } from '../../Helpers/errorHandler';
import Button from '../../Components/UI/Button';
import './SignUpPage.css';

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
      formData.append("image", image);
    }
  
    try {
      const response = await fetch('https://localhost:7002/api/Account/Register', {
        method: 'POST',
        body: formData,
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
    <div className="signup-page-container">
      <div className="card signup-card p-4 p-md-5" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="text-center mb-4">
          <h2 className="signup-title">Create Account</h2>
          <p className="signup-subtitle">Join our community today</p>
        </div>

        {error && (
          <div className="alert-custom text-center">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          <div className="form-floating-custom">
            <input
              type="text"
              id="username"
              className="form-control form-control-custom"
              placeholder=" "
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label htmlFor="username" className="form-label-custom">Username</label>
          </div>

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
            />
            <label htmlFor="password" className="form-label-custom">Password</label>
          </div>

          <div className="form-floating-custom">
            <select
              id="role"
              className="form-control role-select-custom"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select your role</option>
              <option value="Mentor">Mentor</option>
              <option value="Student">Student</option>
            </select>
            <label htmlFor="role" className="form-label-custom">Your Role</label>
          </div>

          <div className="mb-4">
            <label htmlFor="image" className="form-label fw-semibold small mb-2">Profile Image</label>
            <input
              type="file"
              id="image"
              className="form-control file-input-custom"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              accept="image/*"
            />
          </div>

          <Button 
            text='Create Account' 
            className='btn-signup-custom w-100 mb-3'
          />

          <div className="text-center">
            <p className="text-muted mb-0">
              Already have an account?{' '}
              <a href="/login" className="signup-link">Login here</a>
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

export default SignUpPage;