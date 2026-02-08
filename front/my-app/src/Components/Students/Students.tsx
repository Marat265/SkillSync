import React, { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import Button from "../UI/Button";
import { useNavigate } from "react-router-dom";
import { StudentService } from "../Services/studentService";
import Chat from "../Chat/Chat";
import { sendMessage } from "@microsoft/signalr/dist/esm/Utils";
import  "../Mentors/UserCards.css";

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
  const [activeChatPartner, setActiveChatPartner] = useState<UserDto | null>(null);
  const [isPartnerOnline, setIsPartnerOnline] = useState<boolean>(false);

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

     if (connection) {
        await connection.stop();
    }
    
    setMessages([]); 
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userName = userData.userName;
    const userEmail = userData.email;
  
    if (!userName || !userEmail) {
      alert("Ошибка: не удалось получить данные пользователя");
      return;
    }
  
    const chatId =  [userEmail, student.email].sort().join("_");  // Создаем ID чата по email

      try {
        const response = await fetch(`https://localhost:7002/api/chat/${chatId}`);
        const history = await response.json();
        const formatted = history.map((m: any) => ({
          user: m.fromEmail === userEmail ? "You" : student.name,
          text: m.message
        }));
        setMessages(formatted);
      } catch (err) {
        console.error("Ошибка при загрузке истории:", err);
      }
  
    const conn = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7002/chatHub")
      .withAutomaticReconnect()
      .build();
  
    conn.on("ReceiveMessage", (user, text) => {
       const userDisplay = user === userName ? "You" : user;
      setMessages((prev) => [...prev, { user:userDisplay, text }]);
    });
  
    try {
      await conn.start();
      await conn.invoke("JoinChat", {userName, ChatRoom:chatId, FromEmail: userEmail,
                                    ToEmail: student.email}); 
      setConnection(conn);
      setIsChatOpen(true);
    } catch (error) {
      console.log("Ошибка подключения к SignalR:", error);
    }
    
      setActiveChatPartner(student); 
      const onlineStatus = await conn.invoke("IsUserOnline", student.email);
      setIsPartnerOnline(onlineStatus);

     conn.on("UserStatusChanged", (email: string, status: boolean) => {
      if (student.email === email) {
          setIsPartnerOnline(status);
      }
      });
  };
  

  const sendMessage = (message:string) => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      connection.invoke("SendMessage", message).catch((err) => console.error("Ошибка отправки сообщения:", err));
    } else {
      console.warn("Соединение с сервером отсутствует");
    }
  }

  const handleChatClose = () => {
    setActiveChatPartner(null);
    setIsChatOpen(false);
    if (connection) {
      connection.stop();
    }
  };
return (
  <div className="py-5" style={{ background: '#f8faff', minHeight: '100vh' }}>
    <div className="container">
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="user-grid">
        {students.map((student) => (
          <div className="user-card" key={student.id}>
            <div className="avatar-wrapper">
              <img 
                src={student.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                alt={student.name} 
                className="user-avatar-lg" 
              />
            </div>

            <h5 className="user-name">{student.name}</h5>
            <p className="user-email">{student.email}</p>

            <div className="user-card-actions">
              <Button 
                text='View' 
                onClick={() => handleNavigation(student.id)} 
                className="btn-view"
              />
              <Button 
                text="Chat" 
                onClick={() => handleChatOpen(student)} 
                className="btn-chat-action" 
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    {isChatOpen && activeChatPartner && (
      <div className="chat-container">
          <Chat 
            messages={messages} 
            sendMessage={sendMessage} 
            closeChat={handleChatClose} 
            chatPartnerName={activeChatPartner.name}        
            chatPartnerImage={activeChatPartner.image}     
            chatPartnerOnline={isPartnerOnline} 
          />
      </div>
    )}
  </div>
);
};

export default Students;
