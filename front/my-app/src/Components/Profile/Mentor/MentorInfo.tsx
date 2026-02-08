import React, { useState } from "react";
import Button from "../../UI/Button";

type MentorInfoProps = {
  name: string;
  email: string;
  createdAt: string;
  totalReviews: number;
  onUpdateProfile: (name: string, email: string) => Promise<void>;
};

const MentorInfo: React.FC<MentorInfoProps> = ({ name, email, createdAt, totalReviews, onUpdateProfile }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newName, setNewName] = useState(name);
  const [newEmail, setNewEmail] = useState(email);

  return (
    <div className="info-section">
      <div className="profile-grid">
        {/* Карточка Имени */}
        <div className="info-card">
          <div className="info-content">
            <div className="label-row">
              <label>Full Name</label>
              {!isEditingName && <button className="btn-edit-styled" onClick={() => setIsEditingName(true)}>Edit</button>}
            </div>
            {isEditingName ? (
              <div className="edit-mode">
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="profile-input" />
                <div className="action-buttons">
                  <Button text="Save" onClick={() => { onUpdateProfile(newName, email); setIsEditingName(false); }} className="btn-save-mini" />
                  <Button text="Cancel" onClick={() => setIsEditingName(false)} className="btn-cancel-mini" />
                </div>
              </div>
            ) : (
              <span className="user-data-text">{name}</span>
            )}
          </div>
        </div>

        {/* Карточка Email */}
        <div className="info-card">
          <div className="info-content">
            <div className="label-row">
              <label>Email Address</label>
              {!isEditingEmail && <button className="btn-edit-styled" onClick={() => setIsEditingEmail(true)}>Edit</button>}
            </div>
            {isEditingEmail ? (
              <div className="edit-mode">
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="profile-input" />
                <div className="action-buttons">
                  <Button text="Save" onClick={() => { onUpdateProfile(name, newEmail); setIsEditingEmail(false); }} className="btn-save-mini" />
                  <Button text="Cancel" onClick={() => setIsEditingEmail(false)} className="btn-cancel-mini" />
                </div>
              </div>
            ) : (
              <span className="user-data-text">{email}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorInfo;