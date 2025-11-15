import React, { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import Button from "../UI/Button";
import { useNavigate } from "react-router-dom";
import { MentorService } from "../Services/mentorService";
import Chat from "../Chat/Chat";

type UserDto = {
  id: string;
  name: string;
  email: string;
  image: string;
};

const Mentors = () => {
  const [mentors, setMentors] = useState<UserDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [activeChatPartner, setActiveChatPartner] = useState<UserDto | null>(null);
  const [isPartnerOnline, setIsPartnerOnline] = useState<boolean>(false);

  const navigate = useNavigate();

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

  const handleChatOpen = async (mentor:UserDto) => {
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

    const chatId =  [userEmail, mentor.email].sort().join("_"); 

    try {
      const response = await fetch(`https://localhost:7002/api/chat/${chatId}`);
      const history = await response.json();
      const formatted = history.map((m: any) => ({
        user: m.fromEmail === userEmail ? "You" : mentor.name,
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
      await conn.invoke("JoinChat",{ UserName: userName,
                                    ChatRoom: chatId,
                                    FromEmail: userEmail,
                                    ToEmail: mentor.email});
      setConnection(conn);
      setIsChatOpen(true);
    } catch (error) {
      console.log("Ошибка подключения к SignalR:", error);
    }

       setActiveChatPartner(mentor); 
      const onlineStatus = await conn.invoke("IsUserOnline", mentor.email);
      setIsPartnerOnline(onlineStatus);

    conn.on("UserStatusChanged", (email: string, status: boolean) => {
    if (mentor.email === email) {
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
    <div className="album py-5 bg-body-tertiary">
      <div className="container">
        {error && <div className="alert alert-danger">{error}</div>}

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
                  <text x="50%" y="50%" fill="#eceeef" dy=".3em">
                    Thumbnail
                  </text>
                </svg>
                <div className="card-body">
                  <h5 className="card-title">{mentor.name}</h5>
                  <p className="card-text">
                    <img
                      src={mentor.image}
                      alt={mentor.name}
                      className="rounded-circle"
                      style={{
                        width: "30px",
                        height: "30px",
                        marginRight: "10px",
                      }}
                    />
                    Email: {mentor.email}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="btn-group">
                      <Button text="View" onClick={() => handleNavigation(mentor.id)} />
                      <Button
                        text="Chat"
                        onClick={() => handleChatOpen(mentor)}
                        className="btn btn-outline-success"
                      />
                    </div>
                    <small className="text-body-secondary">9 mins</small>
                  </div>
                </div>
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
              chatPartnerOnline={isPartnerOnline}     />
        </div>
      )}
    </div>
  );
};

export default Mentors;
