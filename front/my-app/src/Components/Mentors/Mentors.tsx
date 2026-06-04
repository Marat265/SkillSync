import React, { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import Button from "../UI/Button";
import { useNavigate } from "react-router-dom";
import { MentorService } from "../Services/mentorService";
import Chat from "../Chat/Chat";
import "../Mentors/UserCards.css"; 
import { API_URL } from '../../config';

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
  const [userData] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));

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

  const handleChatOpen = async (mentor: UserDto) => {
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

    const chatId = [userEmail, mentor.email].sort().join("_"); 

    try {
      const response = await fetch(`${API_URL}/api/chat/${chatId}`);
      const history = await response.json();
      const formatted = history.map((m: any) => ({
        user: m.fromEmail === userEmail ? "You" : mentor.name,
        text: m.message,
        sentAt: m.sentAt
      }));
      setMessages(formatted);
    } catch (err) {
      console.error("Ошибка при загрузке истории:", err);
    }

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/chatHub`)
      .withAutomaticReconnect()
      .build();

    conn.on("ReceiveMessage", (user, text) => {
      const userDisplay = user === userName ? "You" : user;
      setMessages((prev) => [...prev, { user: userDisplay, text, sentAt: new Date().toISOString() }]);
    });

    try {
      await conn.start();
      await conn.invoke("JoinChat", { 
        UserName: userName, ChatRoom: chatId, FromEmail: userEmail, ToEmail: mentor.email 
      });
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

  const sendMessage = (message: string) => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      connection.invoke("SendMessage", message).catch((err) => console.error("Ошибка отправки сообщения:", err));
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
    <div className="user-directory-page py-5">
      <div className="container">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="user-grid">
          {mentors.map((mentor) => (
            <div className="user-card" key={mentor.id}>
              <div className="avatar-wrapper">
                <img
                  src={mentor.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                  alt={mentor.name}
                  className="user-avatar-lg"
                   referrerPolicy="no-referrer"
                />
              </div>
              <div className="card-body-custom">
                <h5 className="user-name">{mentor.name}</h5>
                <p className="user-email">{mentor.email}</p>
                
                <div className="user-card-actions">
                  <Button text="View" onClick={() => handleNavigation(mentor.id)} className="btn-view" />
                  <Button text="Chat" onClick={() => handleChatOpen(mentor)} className="btn-chat-action" />
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
              chatPartnerOnline={isPartnerOnline}
              connection={connection}                    
              partnerEmail={activeChatPartner.email}     
              myEmail={userData?.email || ""}            
              myName={userData?.userName || ""}          
            />
          </div>
        )}
    </div>
  );
};

export default Mentors;
