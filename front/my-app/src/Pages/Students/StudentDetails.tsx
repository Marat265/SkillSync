import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Импортируем useParams

// Тип данных для студента
type StudentDto = {
  id: string;
  name: string;
  email: string;
};

const StudentDetails = () => {
  const { studentId } = useParams(); // Получаем studentId из URL
  const [student, setStudent] = useState<StudentDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    const fetchStudentDetails = async () => {
      try {
        const response = await fetch(
          `https://localhost:7002/api/Anonymous/Student/${studentId}`, // Обновляем URL для студентов
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Если нужно для авторизации
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch student details");
        }

        const data = await response.json();
        setStudent(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchStudentDetails();
  }, [studentId]); // Перезапуск запроса, если studentId меняется

  if (error) return <div className="alert alert-danger">{error}</div>;

  if (!student) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1>Student Details</h1>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{student.name}</h5>
          <p className="card-text">
            <strong>Email:</strong> {student.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
