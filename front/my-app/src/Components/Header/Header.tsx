import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';
import { useNavigate } from 'react-router-dom';
import { isMentor } from '../../Functions/IsMentor';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mentor, setMentor] = useState(false); // Состояние для роли "Mentor"
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем, если информация о пользователе в localStorage
    const user = localStorage.getItem('user');
    if (user) {
      try{
        setIsAuthenticated(true);
        const isUserMentor = isMentor();
        console.log('👤 User role check - isMentor:', isUserMentor);
        setMentor(isMentor()); // Проверяем, является ли пользователь ментором
      }catch (error) {
      console.error('❌ Error parsing user data:', error);
    }
    }
  }); // Добавлен пустой массив зависимостей, чтобы `useEffect` выполнялся один раз

  const handleLogout = async () => {
    try {
      const response = await fetch('https://localhost:7002/api/Account/LogOut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Не удалось выйти из системы');
      }

      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setMentor(false); // Сбрасываем состояние ментора при выходе
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <header data-bs-theme="dark">
      <div className="navbar navbar-dark bg-dark shadow-sm w-100 py-4">
        <div className="container d-flex justify-content-between">
          <div className="d-flex">
            <Button text="Home" onClick={() => handleNavigation('/')} />
            <Button text="Mentors" onClick={() => handleNavigation('/mentors')} />
            <Button text="Students" onClick={() => handleNavigation('/students')} />
            <Button text="Sessions" onClick={() => handleNavigation('/sessions')} />
            
            {isAuthenticated && mentor && (
              <>
                <Button text="My Sessions" onClick={() => handleNavigation('/mentorsessions')} />
                <Button text="Create Session" onClick={() => handleNavigation('/createsession')} />
              </>
            )}
          </div>

          <div className="d-flex">
            {!isAuthenticated ? (
              <>
                <Button text="Login" onClick={() => handleNavigation('/login')} />
                <Button text="Sign up" onClick={() => handleNavigation('/signup')} />
              </>
            ) : (
              <>
                <Button text="Log out" onClick={handleLogout} />
                  {mentor ? (
                    <Button text="Profile" onClick={() => handleNavigation('/mentor/profile')} />
                  ) : 
                  <Button text="Profile" onClick={() => handleNavigation('/student/profile')} />
                  }
                </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
