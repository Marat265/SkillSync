import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Импортируем useParams
import { SessionService } from "../../Components/Services/sessionService";

const SessionDetails = () => {
  const { sessionId } = useParams(); // Получаем sessionId из URL
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionDetails = async () => {
      try {
        const data = await SessionService.GetSessionDetails(sessionId);
        setSession(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchSessionDetails();
  }, [sessionId]); // Перезапуск запроса, если sessionId меняется

  if (error) return <div className="alert alert-danger">{error}</div>;

  if (!session) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1>Session Details</h1>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{session.topic}</h5>
          <p className="card-text">
            <strong>Mentor:</strong> {session.mentor.name}
          </p>
          <p className="card-text">
            <strong>Email:</strong> {session.mentor.email}
          </p>
          <p className="card-text">
            <strong>Start Time:</strong> {new Date(session.startTime).toLocaleString()}
          </p>
          <p className="card-text">
            <strong>Duration:</strong> {session.duration}
          </p>
          <p className="card-text">
            <strong>Max Students:</strong> {session.maxStudents}
          </p>
          <p className="card-text">
            <strong>Current Students:</strong> {session.currentStudents}
          </p>
          <p className="card-text">
            <strong>Status:</strong> {session.status}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;
