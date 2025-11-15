import React, { useEffect, useState, useRef } from "react";
import "./Chat.css";
import Button from "../UI/Button";

type ChatProps = {
  messages: { user: string; text: string }[];
  sendMessage: (message: string) => void;
  closeChat: () => void; 
  chatPartnerName: string;
  chatPartnerImage: string;
  chatPartnerOnline: boolean;
};

const Chat: React.FC<ChatProps> = ({ messages, sendMessage, closeChat,  chatPartnerName, chatPartnerImage,
  chatPartnerOnline }) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLSpanElement>(null);

  useEffect( () =>{
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [messages]);

  const onSendMessage = () => {
     if (message.trim() === "") return;
    sendMessage(message);
    setMessage("");
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-partner-info">
          <img src={chatPartnerImage} alt={chatPartnerName} className="chat-partner-img" />
          <div className="chat-partner-text">
            <span className="chat-partner-name">{chatPartnerName}</span>
            <span className={`chat-partner-status ${chatPartnerOnline ? "online" : "offline"}`}>
              {chatPartnerOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        <div className="chat-close" onClick={closeChat}>
          ✖
        </div>
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.user === "You" ? "other" : "own"}`}>
            <span className="user-name">{msg.user}:</span> {msg.text}
          </div>
        ))}
        <span ref={messagesEndRef}></span>
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
          if (e.key === "Enter" && message.trim() !== "") {
            onSendMessage();
          }}}
        />
        <Button text="➤" onClick={onSendMessage}  className={`send-button ${message.trim() === "" ? "disabled" : ""}`}/>
      </div>
    </div>
  );
};

export default Chat;
