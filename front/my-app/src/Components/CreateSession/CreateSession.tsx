import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../UI/Button';
import { SessionService } from '../Services/sessionService';
import './CreateSession.css'; // Импортируем наши новые стили

const CreateSession = () => {
  const [topic, setTopic] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [maxStudents, setMaxStudents] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(startTime) < new Date()) {
        setError("Wait, you can't start a session in the past!");
        return;
    }

    const sessionData = {
      Topic: topic,
      StartTime: startTime,
      Duration: duration,
      MaxStudents: maxStudents,
    };

    try {
      setIsSubmitting(true);
      setError(null);
      await SessionService.CreateSession(sessionData);
      setSuccessMessage("Session created successfully! Redirecting...");
      setTimeout(() => navigate('/sessions'), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create session. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-session-wrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="glass-card">
              
              <div className="text-center mb-4">
                <div className="icon-badge mb-3" style={{ fontSize: '2.5rem' }}>🚀</div>
                <h2 className="form-title h3 mb-2">New Mentoring Session</h2>
                <p className="text-muted small">Share your knowledge with the community</p>
              </div>

              {error && (
                <div className="alert alert-danger animate__animated animate__shakeX">
                  <i className="fas fa-circle-exclamation"></i> {error}
                </div>
              )}
              
              {successMessage && (
                <div className="alert alert-success animate__animated animate__fadeIn">
                  <i className="fas fa-check-circle"></i> {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-uppercase text-muted px-1">Topic</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control custom-input"
                      placeholder="What will you talk about?"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-uppercase text-muted px-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-control custom-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted px-1">Duration (hrs)</label>
                    <input
                      type="number"
                      className="form-control custom-input"
                      placeholder="1.5"
                      step="0.5"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted px-1">Seats</label>
                    <input
                      type="number"
                      className="form-control custom-input"
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(Number(e.target.value))}
                      required
                      min={1}
                    />
                  </div>
                </div>

             <div className="mt-4">
              <Button 
                text={isSubmitting ? "Processing..." : "Create Session"} 
                className={`btn-create-session w-100 py-3 rounded-3 shadow fw-bold ${isSubmitting ? 'opacity-50' : ''}`}
              />
            </div>

                <div className="text-center mt-3">
                  <button 
                    type="button" 
                    className="btn btn-link text-muted text-decoration-none small"
                    onClick={() => navigate('/sessions')}
                  >
                    ← Back to Dashboard
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSession;