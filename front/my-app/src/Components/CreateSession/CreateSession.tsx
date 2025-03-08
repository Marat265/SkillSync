import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../UI/Button';

const CreateSession = () => {
  const [topic, setTopic] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [maxStudents, setMaxStudents] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Функция для отправки данных на сервер
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sessionData = {
      Topic: topic,
      StartTime: startTime,
      Duration: duration,
      MaxStudents: maxStudents,
    };

    try {
      const response = await fetch('https://localhost:7002/api/Mentor/Create/Session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
        credentials: 'include', // Чтобы отправить куки (если они есть)
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      // Здесь не парсим JSON, просто показываем успешное сообщение
      setSuccessMessage("Session created successfully");
      setError(null); // Сбрасываем ошибку
      setTimeout(() => {
        navigate('/sessions'); // Переходим на страницу сессий после создания
      }, 2000); // Ждем 2 секунды для отображения сообщения
    } catch (err: any) {
      setError(err.message); // Выводим ошибку, если что-то пошло не так
    }
  };

  return (
    <div className="container">
      <h2>Create Session</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="topic" className="form-label">Topic</label>
          <input
            type="text"
            className="form-control"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="startTime" className="form-label">Start Time</label>
          <input
            type="datetime-local"
            className="form-control"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="duration" className="form-label">Duration (in hours)</label>
          <input
            type="number"
            className="form-control"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="maxStudents" className="form-label">Max Students</label>
          <input
            type="number"
            className="form-control"
            id="maxStudents"
            value={maxStudents}
            onChange={(e) => setMaxStudents(Number(e.target.value))}
            required
            min={1}
          />
        </div>

        <Button text="Create Session" onClick={() => handleSubmit} />
      </form>
    </div>
  );
};

export default CreateSession;
