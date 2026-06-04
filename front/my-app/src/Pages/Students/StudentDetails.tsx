import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StudentService } from "../../Components/Services/studentService";
import "../../Components/UI/Detailspage.css";

type StudentDto = {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt?: string;
};

const StudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    const fetchStudentDetails = async () => {
      try {
        const data = await StudentService.GetStudentDetails(studentId);
        setStudent(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchStudentDetails();
  }, [studentId]);

  if (error) return (
    <div className="details-page-container">
      <div className="details-error-box">
        <i className="fas fa-exclamation-circle me-2"></i>{error}
      </div>
    </div>
  );

  if (!student) return (
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
        <div className="details-header student-header">
          <div className="details-header-bg" />
          <div className="details-avatar-wrapper">
            <img
              src={student.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
              alt={student.name}
              className="details-avatar"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; }}
            />
            <div className="details-status-dot online" />
          </div>
          <div className="details-header-info">
            <h2 className="details-name">{student.name}</h2>
            <span className="details-role-badge student-badge">
              <i className="fas fa-user-graduate me-1"></i> Student
            </span>
            {student.createdAt && (
              <span className="details-since">
                <i className="far fa-calendar-alt me-1"></i>
                Member since {new Date(student.createdAt).toLocaleDateString()}
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
                <p>{student.email}</p>
              </div>
            </div>

            <div className="details-info-card">
              <div className="details-info-icon">
                <i className="fas fa-id-badge"></i>
              </div>
              <div>
                <label>ROLE</label>
                <p>Student</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;