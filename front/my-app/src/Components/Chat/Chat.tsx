import React, { useEffect, useState, useRef } from "react";
import "./Chat.css";
import Button from "../UI/Button";

type ChatProps = {
  messages: { user: string; text: string }[];
  sendMessage: (message: string) => void;
  closeChat: () => void; 
};

const Chat: React.FC<ChatProps> = ({ messages, sendMessage, closeChat }) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLSpanElement>(null);

  useEffect( () =>{
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [messages]);

  const onSendMessage = () => {
    sendMessage(message);
    setMessage("");
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        Чат
        <div className="chat-close" onClick={closeChat}>
          ✖
        </div>
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.user === "Вы" ? "own" : "other"}`}>
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
          placeholder="Введите сообщение..."
        />
        <Button text="➤" onClick={onSendMessage} className="send-button" />
      </div>
    </div>
  );
};

export default Chat;
