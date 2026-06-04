import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../Components/UI/Detailspage.css";
import { API_URL } from '../../config';

type MentorDto = {
  id: string;
  name: string;
  email: string;
  image?: string;
  skills?: string[];
  totalReviews?: number;
  createdAt?: string;
};

const MentorDetails = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<MentorDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mentorId) return;
    const fetchMentorDetails = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/Anonymous/Mentors/${mentorId}`,
          { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
        );
        if (!response.ok) throw new Error("Failed to fetch mentor details");
        const data = await response.json();
        setMentor(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchMentorDetails();
  }, [mentorId]);

  if (error) return (
    <div className="details-page-container">
      <div className="details-error-box">
        <i className="fas fa-exclamation-circle me-2"></i>{error}
      </div>
    </div>
  );

  if (!mentor) return (
    <div className="profile-loading">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="details-page-container">
      <button className="details-back-btn" onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left me-2"></i>Back
      </button>

      <div className="details-card">
        <div className="details-header mentor-header">
          <div className="details-header-bg" />
          <div className="details-avatar-wrapper">
            <img
              src={mentor.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
              alt={mentor.name}
              className="details-avatar"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; }}
            />
            <div className="details-status-dot online" />
          </div>
          <div className="details-header-info">
            <h2 className="details-name">{mentor.name}</h2>
            <span className="details-role-badge mentor-badge">
              <i className="fas fa-chalkboard-teacher me-1"></i> Mentor
            </span>
            {mentor.createdAt && (
              <span className="details-since">
                <i className="far fa-calendar-alt me-1"></i>
                Member since {new Date(mentor.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="details-body">
          <div className="details-info-grid">
            <div className="details-info-card">
              <div className="details-info-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div>
                <label>EMAIL</label>
                <p>{mentor.email}</p>
              </div>
            </div>

            {mentor.totalReviews !== undefined && (
              <div className="details-info-card">
                <div className="details-info-icon">
                  <i className="fas fa-star"></i>
                </div>
                <div>
                  <label>REVIEWS</label>
                  <p>{mentor.totalReviews} reviews</p>
                </div>
              </div>
            )}
          </div>

          {mentor.skills && mentor.skills.length > 0 && (
            <div className="details-section">
              <h4 className="details-section-title">
                <i className="fas fa-graduation-cap me-2"></i>Skills & Expertise
              </h4>
              <div className="details-skills-wrap">
                {mentor.skills.map((skill, i) => (
                  <span key={i} className="details-skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDetails;