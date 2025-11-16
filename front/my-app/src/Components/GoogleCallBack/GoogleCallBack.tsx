import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleCallBack = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    const email = searchParams.get('email');
    const userName = searchParams.get('userName');
    const role = searchParams.get('role');

     console.log('🔍 Google callback parameters:', { 
    email, 
    userName, 
    role,
    fullUrl: window.location.href 
  });

    if (email && userName) {
      // Если роль уже есть и она не null/undefined
      if (role && role !== 'null' && role !== 'undefined') {
        // Просто сохраняем данные и перенаправляем - роль уже есть
         console.log('✅ User has existing role:', role);
        saveUserDataAndRedirect(email, userName, role);
      } else {
        // Если роли нет, показываем форму выбора роли
        console.log('🔄 User needs role selection');
        setUserData({ email, userName });
        setNeedsRoleSelection(true);
        setIsLoading(false);
      }
    } else {
      navigate('/login', { state: { error: 'Google authentication failed' } });
    }
  }, [location, navigate]);

  const saveUserDataAndRedirect = (email: string, userName: string, role: string) => {
    localStorage.setItem('user', JSON.stringify({
      email,
      userName,
      role: [role],
      isAuthenticated: true
    }));
    navigate('/');
  };

  // Функция для установки роли на сервере (только если ее нет)
  const setUserRole = async (email: string, role: string) => {
    try {
      const response = await fetch('https://localhost:7002/api/Account/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to set role');
      }
      
      return await response.text();
    } catch (error) {
      console.error('Error setting role:', error);
      throw error;
    }
  };

  const handleRoleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    try {
      // Устанавливаем роль на сервере (только для новых пользователей)
      await setUserRole(userData.email, selectedRole);
      
      // Сохраняем в localStorage и перенаправляем
      saveUserDataAndRedirect(userData.email, userData.userName, selectedRole);
    } catch (error: any) {
      console.error('Error setting role:', error);
      alert(`Error setting role: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Processing Google login...</p>
        </div>
      </div>
    );
  }

  // Если нужно выбрать роль
  if (needsRoleSelection) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="card shadow-lg p-4" style={{ maxWidth: '500px', width: '100%' }}>
          <div className="text-center mb-4">
            <h2>Complete Your Registration</h2>
            <p className="text-muted">Welcome, {userData.userName}! Please select your role to continue.</p>
          </div>

          <form onSubmit={handleRoleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-bold">Choose Your Role</label>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div 
                    className={`card role-card ${selectedRole === 'Mentor' ? 'border-primary' : ''}`}
                    style={{ cursor: 'pointer', height: '120px' }}
                    onClick={() => setSelectedRole('Mentor')}
                  >
                    <div className="card-body text-center">
                      <div className="mb-2">
                        <i className="fas fa-chalkboard-teacher fa-2x text-primary"></i>
                      </div>
                      <h6 className="card-title">Mentor</h6>
                      <small className="text-muted">I want to teach and guide</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <div 
                    className={`card role-card ${selectedRole === 'Student' ? 'border-primary' : ''}`}
                    style={{ cursor: 'pointer', height: '120px' }}
                    onClick={() => setSelectedRole('Student')}
                  >
                    <div className="card-body text-center">
                      <div className="mb-2">
                        <i className="fas fa-user-graduate fa-2x text-success"></i>
                      </div>
                      <h6 className="card-title">Student</h6>
                      <small className="text-muted">I want to learn</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    id="mentor"
                    value="Mentor"
                    checked={selectedRole === 'Mentor'}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="mentor">
                    Mentor - I want to teach and guide others
                  </label>
                </div>
                
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    id="student"
                    value="Student"
                    checked={selectedRole === 'Student'}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="student">
                    Student - I want to learn from mentors
                  </label>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={!selectedRole}
            >
              Continue to Platform
            </button>
          </form>

          <div className="text-center mt-3">
            <small className="text-muted">
              This choice will determine your experience on the platform
            </small>
          </div>
        </div>
      </div>
    );
  }

  // Если загрузка завершена, но роли не нужно выбирать (должно быть редким случаем)
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Redirecting...</p>
      </div>
    </div>
  );
};

export default GoogleCallBack;