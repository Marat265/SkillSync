import React, { useState, useEffect } from 'react';
import Button from '../Header/Buttons/Button';
import { useNavigate } from 'react-router-dom';

type UserDto = {
  id: string;
  name: string;
  email: string;
  // добавь другие поля, если они есть
};

const Students = () => {
  const [students, setStudents] = useState<UserDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // Используем useEffect для загрузки данных при монтировании компонента
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('https://localhost:7002/api/Anonymous/Students', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
          credentials: 'include', // Важно! Это заставляет браузер отправлять куки
      })
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const data = await response.json();
        setStudents(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchStudents();
  }, []);

  
  const handleNavigation = (studentId: string) => {
    navigate(`/Student/${studentId}`); 
  };


  return (
    <div className="album py-5 bg-body-tertiary">
      <div className="container">
        {error && <div className="alert alert-danger">{error}</div>} {/* Показываем ошибку, если есть */}
        
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
          {students.map((student) => (
            <div className="col" key={student.id}>
              <div className="card shadow-sm">
                <svg
                  className="bd-placeholder-img card-img-top"
                  width="100%"
                  height="225"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Placeholder: Thumbnail"
                  preserveAspectRatio="xMidYMid slice"
                  focusable="false"
                >
                  <title>Placeholder</title>
                  <rect width="100%" height="100%" fill="#55595c" />
                  <text x="50%" y="50%" fill="#eceeef" dy=".3em">Thumbnail</text>
                </svg>
                <div className="card-body">
                  <h5 className="card-title">{student.name}</h5>
                  <p className="card-text">Email: {student.email}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="btn-group">
                    <Button text='View' onClick={() => handleNavigation(student.id)} />
                    </div>
                    <small className="text-body-secondary">9 mins</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Students;
