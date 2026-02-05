import React, { useEffect, useState } from "react";
import { SessionService } from "../../Services/sessionService";
import Button from "../../UI/Button";
import { StudentService } from "../../Services/studentService";
import './StudentProfile.css'; 

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
  {/* Поле Имени */}
  <div className="info-card">
    <div className="info-icon">
      <i className="fas fa-id-card"></i> 
    </div>
    <div className="info-content">
      <label>Full Name</label>
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
          <button className="btn-edit-styled" onClick={() => setIsEditingName(true)}>
            <i className="fas fa-pen"></i>
            <span>Edit</span>
          </button>
        </div>
      )}
    </div>
  </div>

  {/* Поле Email */}
  <div className="info-card">
    <div className="info-icon">
      <i className="fas fa-at"></i>
    </div>
    <div className="info-content">
      <label>Email Address</label>
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
          <button className="btn-edit-styled" onClick={() => setIsEditingEmail(true)}>
            <i className="fas fa-pen"></i>
            <span>Edit</span>
          </button>
        </div>
      )}
    </div>
  </div>
</div>
          {/* Sessions Section */}
          <div className="sessions-section">
            <h4 className="section-title">My Sessions</h4>
            
            {profile.sessions.length > 0 ? (
              <div className="sessions-grid">
                {profile.sessions.map((session) => (
                  <div key={session.sessionId} className="session-card">
                    <div className="session-header">
                        <span className={`status-badge ${session.status === 0 ? 'upcoming' : 'completed'}`}>
                            {session.status === 0 ? 'Upcoming' : 'Completed'}
                        </span>
                        <div className="session-date">
                            <i className="far fa-calendar-alt"></i> {new Date(session.startTime).toLocaleDateString()}
                        </div>
                    </div>
                    
                    <h5 className="session-topic">{session.topic}</h5>
                    
                    <div className="session-details">
                        <div className="detail-item">
                            <i className="far fa-clock"></i> {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({session.duration}h)
                        </div>
                        <div className="detail-item">
                            <i className="fas fa-users"></i> {session.currentStudents} / {session.maxStudents}
                        </div>
                    </div>

                    {session.mentor && (
                      <div className="mentor-info">
                        <img
                          src={session.mentor.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                          alt="Mentor"
                          className="mentor-avatar"
                        />
                        <div className="mentor-text">
                            <small>Mentor</small>
                            <span>{session.mentor.name}</span>
                        </div>
                      </div>
                    )}

                    <Button 
                        text="Log Out" 
                        onClick={() => handleLogOutOfSession(session.sessionId)} 
                        className="btn-logout-session"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-calendar-times"></i>
                <p>No active sessions found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;