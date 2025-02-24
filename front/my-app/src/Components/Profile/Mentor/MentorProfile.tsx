import React, { useEffect, useState } from "react";
import MentorInfo from "./MentorInfo";
import SkillsList from "./SkillsList";
import AddSkillForm from "./AddSkillForm";
import AlertMessage from "./AlertMessage";

type MentorProfileData = {
  name: string;
  email: string;
  createdAt: string;
  skills: string[];
  totalReviews: number;
};

const MentorProfile = () => {
  const [mentor, setMentor] = useState<MentorProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const response = await fetch("https://localhost:7002/api/Mentor/profile", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch mentor profile");

        const data = await response.json();
        setMentor(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchMentorProfile();
  }, []);

  const handleAddSkill = async (skill: string) => {
    try {
      const response = await fetch(`https://localhost:7002/api/Mentor/Skills/${skill}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to add skill");

      setSuccessMessage("Skill added successfully!");
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
      const response = await fetch(`https://localhost:7002/api/Mentor/Skills/${skillName}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete skill");

      setSuccessMessage("Skill removed successfully!");
      setError(null);
      setMentor((prevMentor) =>
        prevMentor ? { ...prevMentor, skills: prevMentor.skills.filter((s) => s !== skillName) } : null
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) return <AlertMessage message={error} type="danger" />;
  if (!mentor) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container d-flex justify-content-center mt-5">
      <div className="card shadow-lg rounded-3" style={{ maxWidth: "600px" }}>
        <div className="card-header bg-primary text-white text-center py-3">
          <h3>Mentor Profile</h3>
        </div>
        <div className="card-body">
          <MentorInfo
            name={mentor.name}
            email={mentor.email}
            createdAt={mentor.createdAt}
            totalReviews={mentor.totalReviews}
          />

          <SkillsList skills={mentor.skills} onDeleteSkill={handleDeleteSkill} />
          <AddSkillForm onAddSkill={handleAddSkill} />

          <AlertMessage message={successMessage} type="success" />
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;
