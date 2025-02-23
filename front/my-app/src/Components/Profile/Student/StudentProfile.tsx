import React, { useEffect, useState } from "react";

type UserDto = {
  id: string;
  name: string;
  email: string;
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
  sessions: SessionDto[];
};

const StudentProfile = () => {
  const [profile, setProfile] = useState<StudentProfileDto | null>(null);
  const [error, setError] = useState<string[]>([]); // Стейт для ошибок
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Стейт для успешного сообщения
  const [isEditing, setIsEditing] = useState<boolean>(false);
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
        setProfile(data);
      } catch (err: any) {
        setError([err.message]); // Отображаем ошибку в списке
      }
    };

    fetchProfile();
  }, []);

  // Update profile function
  const handleProfileUpdate = async () => {
    setError([]); // Очищаем ошибки перед отправкой запроса
    setSuccessMessage(null); // Очищаем предыдущее успешное сообщение
    try {
      const updateData = { name: newName, email: newEmail };
      const response = await fetch("https://localhost:7002/api/Students/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text(); // Читаем текст ошибки
        throw new Error(errorText); // Выводим сам текст ошибки
      }

      // Если обновление прошло успешно, выводим сообщение
      const successText = await response.text();
      setSuccessMessage(successText);
      setProfile((prevProfile) => ({ ...prevProfile!, name: newName, email: newEmail }));
      setIsEditing(false);
    } catch (err: any) {
      setError([err.message]); // Добавляем ошибку в список
    }
  };

  if (!profile) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container d-flex justify-content-center mt-5">
      {/* Отображение ошибок */}
      {error.length > 0 && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <ul>
            {error.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Отображение успешного сообщения */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
        </div>
      )}

      <div className="card shadow-lg rounded-3" style={{ maxWidth: "600px" }}>
        <div className="card-header bg-primary text-white text-center py-3">
          <h3>Student Profile</h3>
        </div>
        <div className="card-body">
          {/* Name and Email editing */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <p className="mb-1"><strong>Name:</strong> {isEditing ? (
                <input
                  type="text"
                  value={newName || profile.name}
                  onChange={(e) => setNewName(e.target.value)}
                  className="form-control"
                />
              ) : profile.name}</p>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsEditing(true)}>
                Edit Name
              </button>
            </div>
            <div>
              <p className="mb-1"><strong>Email:</strong> {isEditing ? (
                <input
                  type="email"
                  value={newEmail || profile.email}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="form-control"
                />
              ) : profile.email}</p>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsEditing(true)}>
                Edit Email
              </button>
            </div>
          </div>

          {isEditing && (
            <div className="d-flex justify-content-between">
              <button className="btn btn-success" onClick={handleProfileUpdate}>Save Changes</button>
              <button className="btn btn-danger" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          )}

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
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No sessions registered</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
