import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';
import { useNavigate } from 'react-router-dom';
import { MentorService } from '../Services/mentorService';
import { joinChat } from '../../Functions/JoinChat';

type UserDto = {
  id: string;
  name: string;
  email: string;
  image: string;
};

const Mentors = () => {
  const [mentors, setMentors] = useState<UserDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Используем useEffect для загрузки данных при монтировании компонента
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const data = await MentorService.GetAllMentors();
        setMentors(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchMentors();
  }, []);


  const handleNavigation = (mentorId: string) => {
    navigate(`/mentors/${mentorId}`);
  };

  return (
    <div className="album py-5 bg-body-tertiary">
      <div className="container">
        {error && <div className="alert alert-danger">{error}</div>} {/* Показываем ошибку, если есть */}
        
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
          {mentors.map((mentor) => (
            <div className="col" key={mentor.id}>
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
                  <h5 className="card-title">{mentor.name}</h5>
                  <p className="card-text">
                    <img src={mentor.image}
                          alt={mentor.name}
                          className="rounded-circle"
                          style={{ width: "30px", height: "30px", marginRight: "10px" }}></img>
                    Email: {mentor.email}
                    </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="btn-group">
                    <Button text='View' onClick={() => handleNavigation(mentor.id)} />
                    <Button text='Chat' onClick={() => joinChat(mentor.id)} className='btn btn-outline-success'/>
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
}

export default Mentors;
