import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Импортируем useParams

type MentorDto = {
  id: string;
  name: string;
  email: string;
};

const MentorDetails = () => {
  const { mentorId } = useParams(); // Получаем mentorId из URL
  const [mentor, setMentor] = useState<MentorDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mentorId) return;

    const fetchMentorDetails = async () => {
      try {
        const response = await fetch(
          `https://localhost:7002/api/Anonymous/Mentors/${mentorId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Если нужно для авторизации
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch mentor details");
        }

        const data = await response.json();
        setMentor(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchMentorDetails();
  }, [mentorId]); // Перезапуск запроса, если mentorId меняется

  if (error) return <div className="alert alert-danger">{error}</div>;

  if (!mentor) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1>Mentor Details</h1>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{mentor.name}</h5>
          <p className="card-text">
            <strong>Email:</strong> {mentor.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MentorDetails;
