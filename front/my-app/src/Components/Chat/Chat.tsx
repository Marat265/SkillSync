import React from "react";
import "./Chat.css";

type ChatProps = {
  messages: { user: string; text: string }[];
};

const Chat: React.FC<ChatProps> = ({ messages }) => {
  return (
    <div className="chat-window">
      <h2>Чат</h2>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.user === "Вы" ? "own" : ""}`}>
            <b>{msg.user}:</b> {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
