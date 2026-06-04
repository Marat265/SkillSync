import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../UI/Button';
import { isMentor } from '../../Functions/IsMentor';
import { API_URL } from '../../config';
import './Header.css';

interface HeaderProps {
  chatUnread: number;
  onChatToggle: () => void;
  chatOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ chatUnread, onChatToggle, chatOpen }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mentor, setMentor] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) return;

    try {
      setIsAuthenticated(true);
      setMentor(isMentor());
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/Account/LogOut`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Logout failed');

      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setMentor(false);
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigation = (path: string) => navigate(path);
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="app-header">
      <div className="container app-header-inner">
        <button className="brand-button" onClick={() => handleNavigation('/')} aria-label="SkillSync home">
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 8.5 12 4l9 4.5-9 4.5L3 8.5Z" fill="currentColor" />
              <path d="M6.5 11.5v4.2c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M21 9v5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span className="brand-text">Skill<span>Sync</span></span>
        </button>

        <nav className="app-nav" aria-label="Primary navigation">
          <button className={`nav-pill ${isActive('/') ? 'active' : ''}`} onClick={() => handleNavigation('/')}>Home</button>
          <button className={`nav-pill ${isActive('/mentors') ? 'active' : ''}`} onClick={() => handleNavigation('/mentors')}>Mentors</button>
          <button className={`nav-pill ${isActive('/students') ? 'active' : ''}`} onClick={() => handleNavigation('/students')}>Students</button>
          <button className={`nav-pill ${isActive('/sessions') ? 'active' : ''}`} onClick={() => handleNavigation('/sessions')}>Sessions</button>
          <button className={`nav-pill ${isActive('/ai') ? 'active' : ''}`} onClick={() => handleNavigation('/ai')}>AI Hub</button>
        </nav>

        <div className="app-header-actions">
          {isAuthenticated && mentor && (
            <div className="mentor-actions">
              <Button text="My Sessions" onClick={() => handleNavigation('/mentorsessions')} />
              <Button text="Create Session" onClick={() => handleNavigation('/createsession')} />
            </div>
          )}

          {!isAuthenticated ? (
            <>
              <button className="header-auth-btn secondary" onClick={() => handleNavigation('/login')}>Log in</button>
              <button className="header-auth-btn primary" onClick={() => handleNavigation('/signup')}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="9.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                  <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Sign up
              </button>
            </>
          ) : (
            <>
              <Button text="Log out" onClick={handleLogout} />
              {mentor
                ? <Button text="Profile" onClick={() => handleNavigation('/mentor/profile')} />
                : <Button text="Profile" onClick={() => handleNavigation('/student/profile')} />
              }

              <button
                className={`header-chat-btn ${chatOpen ? 'active' : ''}`}
                onClick={onChatToggle}
                aria-label={chatOpen ? 'Close messages' : 'Open messages'}
                title="Messages"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" width="18" height="18"
                     strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                {chatUnread > 0 && !chatOpen && (
                  <span className="header-chat-badge">
                    {chatUnread > 99 ? '99+' : chatUnread}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
