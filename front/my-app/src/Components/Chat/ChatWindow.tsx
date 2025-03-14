import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import './ChatWindow.css';

type ChatWindowProps = {
  onClose: () => void;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [message, setMessage] = useState('');
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7002/chatHub") // Укажи свой URL сервера
      .withAutomaticReconnect()
      .build();

    newConnection.start()
      .then(() => console.log("Connected to SignalR"))
      .catch(err => console.error("Connection error: ", err));

    newConnection.on("ReceiveMessage", (user, text) => {
      setMessages(prev => [...prev, { user, text }]);
    });

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, []);

  const sendMessage = async () => {
    if (connection && message.trim() !== '') {
      await connection.send("SendMessage", "User", message);
      setMessage('');
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <span>Чат</span>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      <div className="chat-body">
        {messages.map((msg, index) => (
          <div key={index}><b>{msg.user}:</b> {msg.text}</div>
        ))}
      </div>
      <div className="chat-footer">
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Введите сообщение..." 
        />
        <button onClick={sendMessage}>Отправить</button>
      </div>
    </div>
  );
};

export default ChatWindow;
