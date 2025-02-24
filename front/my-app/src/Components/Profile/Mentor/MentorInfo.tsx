import React, { useState } from "react";

type MentorInfoProps = {
  name: string;
  email: string;
  createdAt: string;
  totalReviews: number;
  onUpdateProfile: (name: string, email: string) => Promise<void>; // Функция для обновления профиля
};

const MentorInfo: React.FC<MentorInfoProps> = ({ name, email, createdAt, totalReviews, onUpdateProfile }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newName, setNewName] = useState(name);
  const [newEmail, setNewEmail] = useState(email);

  const handleNameChange = () => {
    onUpdateProfile(newName, email); // Обновляем только имя
    setIsEditingName(false);
  };

  const handleEmailChange = () => {
    onUpdateProfile(name, newEmail); // Обновляем только email
    setIsEditingEmail(false);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
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
              <p className="mb-1"><strong>Name:</strong> {name}</p>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsEditingName(true)}>
                Edit Name
              </button>
            </div>
          )}
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
              <p className="mb-1"><strong>Email:</strong> {email}</p>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsEditingEmail(true)}>
                Edit Email
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="mb-2"><strong>Registered:</strong> {new Date(createdAt).toLocaleDateString()}</p>
      <p className="mb-2"><strong>Reviews:</strong> <span className="badge bg-success">{totalReviews}</span></p>
    </div>
  );
};

export default MentorInfo;
