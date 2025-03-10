import React, { useEffect, useState } from "react";
import MentorInfo from "./MentorInfo";
import SkillsList from "./SkillsList";
import AddSkillForm from "./AddSkillForm";
import AlertMessage from "../../UI/AlertMessage";
import { MentorService } from "../../Services/mentorService";

type MentorProfileData = {
  name: string;
  email: string;
  createdAt: string;
  skills: string[];
  totalReviews: number;
  image: string | null; // Добавлено поле для URL изображения аватара
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
        setLoading(false); // Устанавливаем состояние загрузки в false
      }
    };

    fetchMentorProfile();
  }, []);

  const handleAddSkill = async (skill: string) => {
    try {
      var text = await MentorService.AddSkill(skill);
      setSuccessMessage(text);
      setError(null);
      setMentor((prevMentor) =>
        prevMentor ? { ...prevMentor, skills: [...prevMentor.skills, skill] } : null
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteSkill = async (skillName: string) => {
    try {
      var text = await MentorService.DeleteSkill(skillName);

      setSuccessMessage(text);
      setError(null);
      setMentor((prevMentor) =>
        prevMentor ? { ...prevMentor, skills: prevMentor.skills.filter((s) => s !== skillName) } : null
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateProfile = async (newName: string, newEmail: string) => {
    if (!mentor) return; // Проверяем, что mentor не равен null

    try {
      await MentorService.UpdateProfile(newName,newEmail);

      const updatedMentor = { ...mentor, name: newName, email: newEmail }; // Обновляем состояние
      setMentor(updatedMentor);
      setSuccessMessage("Profile updated successfully!");
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

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!mentor) return <div className="text-center mt-5">No mentor data available</div>;

  return (
    <div className="container d-flex justify-content-center mt-5">
      <div className="card shadow-lg rounded-3" style={{ maxWidth: "600px" }}>
        <div className="card-header bg-primary text-white text-center py-3">
          <h3>Mentor Profile</h3>
        </div>
        <div className="card-body text-center">
          {/* Аватар ментора */}
          {mentor.image ? (
            <img
              src={mentor.image}
              alt="Mentor Avatar"
              className="rounded-circle"
              style={{ width: "150px", height: "150px", objectFit: "cover", marginBottom: "20px" }}
            />
          ) : (
            <div
              style={{
                width: "150px",
                height: "150px",
                backgroundColor: "#ddd",
                borderRadius: "50%",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  display: "block",
                  textAlign: "center",
                  lineHeight: "150px",
                  fontSize: "2rem",
                  color: "#fff",
                }}
              >
                {mentor.name[0]} {/* Отображаем первую букву имени */}
              </span>
            </div>
          )}

          {/* Остальная информация */}
          <MentorInfo
            name={mentor.name}
            email={mentor.email}
            createdAt={mentor.createdAt}
            totalReviews={mentor.totalReviews}
            onUpdateProfile={handleUpdateProfile}
          />
          <SkillsList skills={mentor.skills} onDeleteSkill={handleDeleteSkill} />
          <AddSkillForm onAddSkill={handleAddSkill} />

          {error ? <AlertMessage message={error} type="danger" /> : null}
          {successMessage ? <AlertMessage message={successMessage} type="success" /> : null}
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;
