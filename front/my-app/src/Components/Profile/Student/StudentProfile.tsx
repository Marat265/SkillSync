import React, { useEffect, useState } from "react";
import { SessionService } from "../../Services/sessionService";
import Button from "../../UI/Button";
import { StudentService } from "../../Services/studentService";
import './StudentProfile.css'; 
import '../../../Pages/Sessions/Sessions.css';

type UserDto = {
  id: string;
  name: string;
  email: string;
  image: string;
};

type SessionDto = {
  sessionId: number;
  mentor: UserDto;
  topic: string;
  startTime: string;
  duration: string;
  maxStudents: number;
  currentStudents: number;
  status: number;
};

type StudentProfileDto = {
  name: string;
  email: string;
  image: string;
  sessions: SessionDto[];
};

const StudentProfile = () => {
  const [profile, setProfile] = useState<StudentProfileDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await StudentService.GetProfile();
        setProfile(data);
        setNewName(data.name);
        setNewEmail(data.email);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (name: string, email: string) => {
    try {
      await StudentService.UpdateStudentProfile(name, email);
      setProfile((prevProfile) => ({ ...prevProfile!, name, email }));
      setSuccessMessage("Profile updated successfully!");
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleNameChange = async () => {
    await handleUpdateProfile(newName, profile!.email);
    setIsEditingName(false);
  };

  const handleEmailChange = async () => {
    await handleUpdateProfile(profile!.name, newEmail);
    setIsEditingEmail(false);
  };

  const handleLogOutOfSession = async (sessionId: number) => {
    try {
      await SessionService.LogOutOfSession(sessionId);
      setProfile((prevProfile) => ({
        ...prevProfile!,
        sessions: prevProfile!.sessions.filter((session) => session.sessionId !== sessionId),
      }));
      setSuccessMessage("Successfully logged out of the session!");
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  if (!profile) return (
    <div className="profile-loading">
        <div className="spinner"></div>
    </div>
  );

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-avatar-container">
            <img
              src={profile.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
              alt="Profile"
              className="profile-avatar"
            />
            <div className="profile-title">
                <h3>My Profile</h3>
                <span className="profile-role">Student</span>
            </div>
          </div>
        </div>

        <div className="profile-body">
          {/* Messages */}
          {error && <div className="alert-box error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
          {successMessage && <div className="alert-box success"><i className="fas fa-check-circle"></i> {successMessage}</div>}

          {/* Personal Info Grid */}
         <div className="info-grid">
  
        <div className="profile-grid"> {/* Контейнер для выравнивания карточек в ряд */}
  
  {/* Поле Имени */}
  <div className="info-card">
    <div className="info-content">
      <div className="label-row">
        <label>FULL NAME</label>
        {!isEditingName && (
          <button className="btn-edit-styled" onClick={() => setIsEditingName(true)}>Edit</button>
        )}
      </div>
      
      {isEditingName ? (
        <div className="edit-mode">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="profile-input"
          />
          <div className="action-buttons">
            <Button text="Save" onClick={handleNameChange} className="btn-save-mini" />
            <Button text="Cancel" onClick={() => setIsEditingName(false)} className="btn-cancel-mini" />
          </div>
        </div>
      ) : (
        <div className="display-mode">
          <span className="user-data-text">{profile.name}</span>
        </div>
      )}
    </div>
  </div>

  {/* Поле Email */}
  <div className="info-card">
    <div className="info-content">
      <div className="label-row">
        <label>EMAIL ADDRESS</label>
        {!isEditingEmail && (
          <button className="btn-edit-styled" onClick={() => setIsEditingEmail(true)}>Edit</button>
        )}
      </div>

      {isEditingEmail ? (
        <div className="edit-mode">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="profile-input"
          />
          <div className="action-buttons">
            <Button text="Save" onClick={handleEmailChange} className="btn-save-mini" />
            <Button text="Cancel" onClick={() => setIsEditingEmail(false)} className="btn-cancel-mini" />
          </div>
        </div>
      ) : (
        <div className="display-mode">
          <span className="user-data-text">{profile.email}</span>
        </div>
      )}
    </div>
  </div>
</div>
</div>
          {/* Sessions Section */}
<div className="sessions-section session-page">
  <h4 className="section-title mb-4" style={{ fontWeight: 700, color: '#2d3748' }}>My Sessions</h4>
  
  {profile.sessions.length > 0 ? (
    <div className="sessions-grid">
      {profile.sessions.map((session) => (
        <div key={session.sessionId} className="session-card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          {/* Линию session-header удалили отсюда */}
          
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className={`session-badge ${
                session.status === 0 ? 'bg-light-blue' : 
                session.status === 1 ? 'bg-light-green' : 'bg-light-red'
              }`} style={{ 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '0.75rem', 
                fontWeight: 600,
                backgroundColor: session.status === 0 ? '#ebf8ff' : '#f0fff4',
                color: session.status === 0 ? '#3182ce' : '#38a169'
              }}>
                {session.status === 0 ? 'Scheduled' : 
                 session.status === 1 ? 'Completed' : 'Cancelled'}
              </span>
              <div className="text-muted small">
                <i className="far fa-calendar-alt me-1"></i> 
                {new Date(session.startTime).toLocaleDateString()}
              </div>
            </div>
            
            <h5 className="fw-bold mb-3" style={{ color: '#2d3748' }}>{session.topic}</h5>
            
            <div className="mb-3">
              <div className="text-muted small mb-1">
                <i className="far fa-clock me-1"></i> 
           {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({session.duration}h)
              </div>
              <div className="text-muted small">
                <i className="fas fa-users me-1"></i> 
                {session.currentStudents} / {session.maxStudents} Students
              </div>
            </div>

            {session.mentor && (
              <div className="d-flex align-items-center p-2 rounded-3 bg-light mb-3">
                <img
                  src={session.mentor.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                  alt="Mentor"
                  className="rounded-circle me-2"
                  style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                />
                <div style={{ lineHeight: '1.2' }}>
                  <div className="text-muted" style={{ fontSize: '0.65rem text-transform: uppercase' }}>Mentor</div>
                  <div className="fw-bold small">{session.mentor.name}</div>
                </div>
              </div>
            )}

            <Button 
                text="Leave Session" 
                onClick={() => handleLogOutOfSession(session.sessionId)} 
                className="btn-logout-session w-100"
            />
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="empty-state text-center py-5 bg-white rounded-4 shadow-sm">
      <i className="fas fa-calendar-times fa-3x text-light mb-3"></i>
      <p className="text-muted">No active sessions found.</p>
    </div>
  )}
</div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;