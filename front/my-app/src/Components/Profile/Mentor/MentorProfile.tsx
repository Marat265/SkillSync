import React, { useEffect, useState } from "react";

type MentorProfile = {
  name: string;
  email: string;
  createdAt: string;
  skills: string[];
  totalReviews: number;
};

const MentorProfile = () => {
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState<string>("");

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const response = await fetch("https://localhost:7002/api/Mentor/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch mentor profile");
        }

        const data = await response.json();
        setMentor(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchMentorProfile();
  }, []);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      setError("Skill name cannot be empty.");
      return;
    }
  
    try {
      const response = await fetch(`https://localhost:7002/api/Mentor/Skills/${newSkill}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error("Failed to add skill");
      }
  
      setSuccessMessage("Skill added successfully!");
      setError(null);
      setNewSkill("");
  
      // Обновляем список навыков, убедившись, что `mentor` не `null`
      setMentor((prevMentor) => {
        if (!prevMentor) return null;
        return {
          ...prevMentor,
          skills: [...(prevMentor.skills || []), newSkill],
        };
      });
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleDeleteSkill = async (skillName: string) => {
    try {
      const response = await fetch(`https://localhost:7002/api/Mentor/Skills/${skillName}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete skill");
      }
  
      setSuccessMessage("Skill removed successfully!");
      setError(null);
  
      // Обновляем список навыков после удаления
      setMentor((prevMentor) => {
        if (!prevMentor) return null;
        return {
          ...prevMentor,
          skills: prevMentor.skills ? prevMentor.skills.filter((skill) => skill !== skillName) : [],
        };
      });
    } catch (err: any) {
      setError(err.message);
    }
  };
  

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!mentor) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container d-flex justify-content-center mt-5">
      <div className="card shadow-lg rounded-3" style={{ maxWidth: "600px" }}>
        <div className="card-header bg-primary text-white text-center py-3">
          <h3>Mentor Profile</h3>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <p className="mb-1"><strong>Name:</strong> {mentor.name}</p>
              <button className="btn btn-outline-secondary btn-sm">
                Edit Name
              </button>
            </div>
            <div>
              <p className="mb-1"><strong>Email:</strong> {mentor.email}</p>
              <button className="btn btn-outline-secondary btn-sm">
                Edit Email
              </button>
            </div>
          </div>

          <p className="mb-2">
            <strong>Registered:</strong> {new Date(mentor.createdAt).toLocaleDateString()}
          </p>

          <p className="mb-2">
            <strong>Reviews:</strong>{" "}
            <span className="badge bg-success">{mentor.totalReviews}</span>
          </p>

          <div>
            <h4>Skills</h4>
            {mentor.skills.length > 0 ? (
              <ul className="list-group mb-3">
                {mentor.skills.map((skill, index) => (
                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {skill}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteSkill(skill)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No skills listed</p>
            )}

            <div className="d-flex">
              <input
                type="text"
                className="form-control"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add new skill"
              />
              <button className="btn btn-primary ms-2" onClick={handleAddSkill}>
                Add Skill
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="alert alert-success mt-3">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;
