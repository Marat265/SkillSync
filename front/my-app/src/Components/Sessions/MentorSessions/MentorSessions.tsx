import React, { useState, useEffect } from 'react';
import { SessionDto } from '../Sessions';
import Button from '../../Header/Buttons/Button';
import { useNavigate } from 'react-router-dom';

const MentorSessions = () => {
    const [sessions, setSessions] = useState<SessionDto[]>([]);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    // Используем useEffect для загрузки данных при монтировании компонента
    useEffect(() => {
      const fetchSessions = async () => {
        try {
          const response = await fetch('https://localhost:7002/api/Mentor/Session', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Важно! Это заставляет браузер отправлять куки
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch sessions');
          }
          
          const data = await response.json();
          setSessions(data);
        } catch (err: any) {
          setError(err.message);
        }
      };
  
      fetchSessions();
    }, []);
  
    const handleNavigation = (sessionId: number) => {
      navigate(`/session/${sessionId}`); // Переход на страницу с деталями сессии
    };

    const deleteSession = async (sessionId: number) => {
      try {
        const response = await fetch(
          `https://localhost:7002/api/Mentor/Delete/${sessionId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
  
        if (!response.ok) {
          throw new Error("Failed to delete session");
        }
  
        // После удаления, заново загружаем список сессий
        const updatedSessions = sessions.filter(session => session.sessionId !== sessionId);
        setSessions(updatedSessions); // Обновляем состояние сессий
  
      } catch (err: any) {
        setError(err.message);
      }
    };

    return (
      <div className="album py-5 bg-body-tertiary">
        <div className="container">
          {error && <div className="alert alert-danger">{error}</div>} {/* Показываем ошибку, если есть */}
  
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
            {sessions.map((session) => (
              <div className="col" key={session.topic}>
                <div className="card shadow-sm">
                  <svg
                    className="bd-placeholder-img card-img-top"
                    width="100%"
                    height="225"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="Placeholder: Thumbnail"
                    preserveAspectRatio="xMidYMid slice"
                    focusable="false"
                  >
                    <title>Placeholder</title>
                    <rect width="100%" height="100%" fill="#55595c" />
                    <text x="50%" y="50%" fill="#eceeef" dy=".3em">Session</text>
                  </svg>
                  <div className="card-body">
                    <h5 className="card-title">{session.topic}</h5>
                    <p className="card-text">Mentor: {session.mentor.name}</p>
                    <p className="card-text">Start Time: {new Date(session.startTime).toLocaleString()}</p>
                    <p className="card-text">Duration: {session.duration}</p>
                    <p className="card-text">Max Students: {session.maxStudents}</p>
                    <p className="card-text">Current Students: {session.currentStudents}</p>
                    <p className="card-text">Status: {session.status}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="btn-group">
                      <Button text='View' onClick={() => handleNavigation(session.sessionId)} />
                      <Button text='Delete' onClick={() => deleteSession(session.sessionId)} />
                      </div>
                      <small className="text-body-secondary">9 mins</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
};

export default MentorSessions;
