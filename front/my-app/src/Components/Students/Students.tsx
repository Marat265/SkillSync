import React, { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import Button from "../UI/Button";
import { useNavigate } from "react-router-dom";
import { StudentService } from "../Services/studentService";
import Chat from "../Chat/Chat";

type UserDto = {
  id: string;
  name: string;
  email: string;
  image: string;
};

const Students = () => {
  const [students, setStudents] = useState<UserDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await StudentService.GetAllStudents();
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

  const handleChatOpen = async (student: UserDto) => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userName = userData.userName;
    const userEmail = userData.email;
  
    if (!userName || !userEmail) {
      alert("Ошибка: не удалось получить данные пользователя");
      return;
    }
  
    const chatId =  [userEmail, student.email].sort().join("_");  // Создаем ID чата по email
  
    const conn = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7002/chatHub")
      .withAutomaticReconnect()
      .build();
  
    conn.on("ReceiveMessage", (user, text) => {
      setMessages((prev) => [...prev, { user, text }]);
    });
  
    try {
      await conn.start();
      await conn.invoke("JoinChat", {userName, ChatRoom:chatId}); // Подключаемся к группе по chatId
      setConnection(conn);
      setIsChatOpen(true);
    } catch (error) {
      console.log("Ошибка подключения к SignalR:", error);
    }
  };
  

  const handleChatClose = () => {
    setIsChatOpen(false);
    if (connection) {
      connection.stop();
    }
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
                  <p className="card-text">
                  <img src={student.image}
                          alt={student.name}
                          className="rounded-circle"
                          style={{ width: "30px", height: "30px", marginRight: "10px" }}></img>
                    Email: {student.email}
                    </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="btn-group">
                    <Button text='View' onClick={() => handleNavigation(student.id)} />
                    <Button text="Chat" onClick={() => handleChatOpen(student)} className="btn btn-outline-success" />
                    </div>
                    <small className="text-body-secondary">9 mins</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isChatOpen && (
        <div className="chat-container">
          <div className="chat-close" onClick={handleChatClose}>
            &#10006;
          </div>
          <Chat messages={messages} />
        </div>
      )}
    </div>
  );
};

export default Students;
