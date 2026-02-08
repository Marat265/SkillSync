import React, { useState, useEffect } from 'react';
import Button from '../../Components/UI/Button';
import { useNavigate } from 'react-router-dom';
import { isMentor } from '../../Functions/IsMentor';
import { SessionService } from '../../Components/Services/sessionService';
import './Sessions.css'; // Используем те же стили

type MentorDto = {
  id: string;
  name: string;
  email: string;
};

export type SessionDto = {
  sessionId: number;
  mentor: MentorDto;
  topic: string;
  startTime: string; 
  duration: string;
  maxStudents: number;
  currentStudents: number;
  status: string; 
};

const statusLabels: Record<number, string> = {
  0: 'Scheduled',
  1: 'Completed',
  2: 'Cancelled'
};

const MentorSessions = () => {
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await SessionService.GetMentorSessions();
        setSessions(data);
        setError(null);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setSessions([]);
          setError(null);
        } else {
          setError(err.message);
        }
      }
    };
    fetchSessions();
  }, []);

  const handleNavigation = (sessionId: number) => {
    navigate(`/session/${sessionId}`);
  };

  const deleteSession = async (sessionId: number) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await SessionService.DeleteSession(sessionId);
      setSessions(sessions.filter(s => s.sessionId !== sessionId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusClass = (status: any) => {
    const s = Number(status);
    switch (s) {
      case 0: return 'upcoming';
      case 1: return 'completed';
      case 2: return 'cancelled';
      default: return 'upcoming';
    }
  };

  return (
    <div className="session-page container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">My Mentor Sessions</h2>
        {error && <div className="alert alert-danger py-2 px-4">{error}</div>}
      </div>

      <div className="session-grid">
        {sessions.map((session) => (
          <div className="session-card" key={session.sessionId}>
            <div className="session-header"></div>
            <div className="session-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h5 className="session-topic">{session.topic}</h5>
                <span className={`status-badge ${getStatusClass(session.status)}`}>
                  {statusLabels[Number(session.status)] || 'Unknown'}
                </span>
              </div>

              <div className="session-info-row">
                <i className="far fa-calendar-alt me-2"></i>
                📅 {new Date(session.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </div>

              <div className="session-info-row">
                <i className="far fa-clock me-2"></i>
                ⏱️ {session.duration} h
              </div>
            
              <div className="session-info-row">
                <i className="fas fa-user-tie me-2"></i>
                👤 {session.mentor.name}
              </div>

               <div className="mt-3">
                    <div className="d-flex justify-content-between small text-muted mb-1">
                      <span>Capacity</span>
                      <span>{session.currentStudents} / {session.maxStudents}</span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className={`progress-bar ${session.currentStudents >= session.maxStudents ? 'bg-danger' : 'bg-success'}`} 
                        style={{ width: `${(session.currentStudents / session.maxStudents) * 100}%` }}
                      ></div>
                    </div>
                  </div>
            </div>

            <div className="session-footer">
              <Button 
                text='View Details' 
                className="btn-primary btn-sm"
                onClick={() => handleNavigation(session.sessionId)} 
              />
              <Button 
                text='Delete' 
                className="btn-logout-session btn-sm mt-0"
                onClick={() => deleteSession(session.sessionId)} 
              />
            </div>
          </div>
        ))}
      </div>
      
      {sessions.length === 0 && !error && (
        <div className="text-center py-5 shadow-sm bg-white rounded-4">
          <p className="text-muted m-0">No sessions found.</p>
        </div>
      )}
    </div>
  );
};

export default MentorSessions;