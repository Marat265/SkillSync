import React, { useEffect, useState } from "react";
import { handleError } from "../../../Helpers/errorHandler";
import { SessionService } from "../../Services/sessionService";

type UserDto = {
  id: string;
  name: string;
  email: string;
  image: string; // Добавляем аватар
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
  image: string; // Добавляем аватар
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

  // Fetching profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("https://localhost:7002/api/Students/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch student profile");
        }

        const data = await response.json();
        console.log(data);
        setProfile(data);
        setNewName(data.name); // Устанавливаем начальное значение для имени
        setNewEmail(data.email); // Устанавливаем начальное значение для email
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchProfile();
  }, []);

  // Update profile function
  const handleUpdateProfile = async (name: string, email: string) => {
    try {
      const response = await fetch("https://localhost:7002/api/Students/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await handleError(response);
        throw new Error(errorText);
      }

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
      // Удаляем сессию из списка
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
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  if (!profile) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container d-flex justify-content-center mt-5">
      <div className="card shadow-lg rounded-3" style={{ maxWidth: "600px" }}>
        <div className="card-header bg-primary text-white text-center py-3">
          <h3>Student Profile</h3>
        </div>
        <div className="card-body">
          {/* Name and Avatar section */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <img
                src={profile.image || "/default-avatar.png"} // Если аватар не задан, показываем дефолтный
                alt="Student Avatar"
                className="rounded-circle"
                style={{ width: "50px", height: "50px", marginRight: "15px" }}
              />
              <div>
                {isEditingName ? (
                  <div>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="form-control mb-2"
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleNameChange}>
                      Save Name
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingName(false)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="mb-1"><strong>Name:</strong> {profile.name}</p>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsEditingName(true)}>
                      Edit Name
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              {isEditingEmail ? (
                <div>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="form-control mb-2"
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleEmailChange}>
                    Save Email
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingEmail(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <p className="mb-1"><strong>Email:</strong> {profile.email}</p>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsEditingEmail(true)}>
                    Edit Email
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sessions section */}
          <div>
            <h4>Sessions</h4>
            {profile.sessions.length > 0 ? (
              <ul className="list-group mb-3">
                {profile.sessions.map((session) => (
                  <li key={session.sessionId} className="list-group-item">
                    <h5>{session.topic}</h5>
                    <p><strong>Start Time:</strong> {new Date(session.startTime).toLocaleString()}</p>
                    <p><strong>Duration:</strong> {session.duration} hours</p>
                    <p><strong>Max Students:</strong> {session.maxStudents}</p>
                    <p><strong>Current Students:</strong> {session.currentStudents}</p>
                    <p><strong>Status:</strong> {session.status === 0 ? 'Upcoming' : 'Completed'}</p>
                    {session.mentor && (
                      <div>
                        <p><strong>Mentor:</strong> {session.mentor.name}</p>
                        <p><strong>Email:</strong> {session.mentor.email}</p>
                        <img
                          src={session.mentor.image || "/default-avatar.png"} // Аватар ментора
                          alt="Mentor Avatar"
                          className="rounded-circle"
                          style={{ width: "30px", height: "30px", marginRight: "10px" }}
                        />
                      </div>
                    )}
                    <button
                      className="btn btn-danger btn-sm mt-2"
                      onClick={() => handleLogOutOfSession(session.sessionId)}
                    >
                      Log Out of Session
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No sessions registered</p>
            )}
          </div>

          {/* Error and success messages */}
          {error && <div className="alert alert-danger">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
