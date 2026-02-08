import React, { useEffect, useState } from "react";
import MentorInfo from "./MentorInfo";
import SkillsList from "./SkillsList";
import AddSkillForm from "./AddSkillForm";
import { MentorService } from "../../Services/mentorService";
import './MentorProfile.css';

type MentorProfileData = {
  name: string;
  email: string;
  createdAt: string;
  skills: string[];
  totalReviews: number;
  image: string | null;
};

const MentorProfile = () => {
  const [mentor, setMentor] = useState<MentorProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const data = await MentorService.GetMentorProfile();
        setMentor(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMentorProfile();
  }, []);

  const handleUpdateProfile = async (newName: string, newEmail: string) => {
    if (!mentor) return;
    try {
      await MentorService.UpdateProfile(newName, newEmail);
      setMentor({ ...mentor, name: newName, email: newEmail });
      setSuccessMessage("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddSkill = async (skill: string) => {
    try {
      const text = await MentorService.AddSkill(skill);
      setSuccessMessage(text);
      setMentor(prev => prev ? { ...prev, skills: [...prev.skills, skill] } : null);
    } catch (err: any) { setError(err.message); }
  };

  const handleDeleteSkill = async (skillName: string) => {
    try {
      const text = await MentorService.DeleteSkill(skillName);
      setSuccessMessage(text);
      setMentor(prev => prev ? { ...prev, skills: prev.skills.filter(s => s !== skillName) } : null);
    } catch (err: any) { setError(err.message); }
  };

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => { setSuccessMessage(null); setError(null); }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  if (loading) return <div className="profile-loading"><div className="spinner"></div></div>;
  if (!mentor) return <div className="profile-page-container">No data found</div>;

  return (
    <div className="profile-page-container">
      <div className="profile-card">
<div className="profile-header">
  <div className="profile-avatar-container">
    <div className="position-relative">
      {mentor.image ? (
        <img src={mentor.image} alt="Avatar" className="profile-avatar" />
      ) : (
        <div className="profile-avatar-placeholder">{mentor.name[0]}</div>
      )}
      <div className="status-dot online"></div>
    </div>
    <div className="profile-title">
      <h3>{mentor.name}</h3>
      <div className="d-flex align-items-center gap-3">
        <span className="profile-role">Mentor</span>
        <span className="header-reg-date">
          <i className="far fa-calendar-alt me-1"></i> 
          Since {new Date(mentor.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  </div>
</div>

        <div className="profile-body">
          {error && <div className="alert-box error">{error}</div>}
          {successMessage && <div className="alert-box success">{successMessage}</div>}

          <MentorInfo
            name={mentor.name}
            email={mentor.email}
            createdAt={mentor.createdAt}
            totalReviews={mentor.totalReviews}
            onUpdateProfile={handleUpdateProfile}
          />

          <div className="skills-section-container">
            <div className="skills-header">
              <i className="fas fa-graduation-cap"></i>
              <h4>Expertise & Skills</h4>
            </div>
            <SkillsList skills={mentor.skills} onDeleteSkill={handleDeleteSkill} />
            <AddSkillForm onAddSkill={handleAddSkill} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;