import React, { useEffect, useState, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import "./Chat.css";
import VideoCall from "../VideoCall/VideoCall";
import IncomingCall from "../VideoCall/Incomingcall";

type ChatProps = {
  messages: { user: string; text: string; sentAt?: string }[];
  sendMessage: (message: string) => void;
  closeChat: () => void;
  chatPartnerName: string;
  chatPartnerImage: string;
  chatPartnerOnline: boolean;
  connection: signalR.HubConnection | null;
  partnerEmail: string;
  myEmail: string;
  myName: string;
};

const getDateLabel = (dateStr?: string) => {
  if (!dateStr) return null;
  const utcStr = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
  const date = new Date(utcStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
};

const formatTime = (dateStr?: string) => {
  if (!dateStr) return "";
  const utcStr = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
  return new Date(utcStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const Chat: React.FC<ChatProps> = ({
  messages,
  sendMessage,
  closeChat,
  chatPartnerName,
  chatPartnerImage,
  chatPartnerOnline,
  connection,
  partnerEmail,
  myEmail,
  myName,
}) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isCallActive,   setIsCallActive]   = useState(false);
  const [incomingCaller, setIncomingCaller] = useState<{ name: string; email: string } | null>(null);

  const [calleePC,     setCalleePC]     = useState<RTCPeerConnection | null>(null);
  const [calleeStream, setCalleeStream] = useState<MediaStream | null>(null);
  const [callerEmail,  setCallerEmail]  = useState<string>("");
  const [bufferedIce,  setBufferedIce]  = useState<string[]>([]);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const pendingOfferRef = useRef<string | null>(null);
  const iceBufferRef    = useRef<string[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Функция рендера сообщения о звонке
  const renderCallMessage = (text: string, myEmail: string) => {
    if (text === "📞 CALL_MISSED") {
      // missed call отправляет caller — значит он его и видит у себя
      // определяем по msg.user === "You" выше, но здесь используем другой способ:
      // это сообщение видят оба, но смысл разный
      return (
        <span style={{ color: "#e53e3e", fontStyle: "italic" }}>
          📞 Missed call
        </span>
      );
    }

    if (text.startsWith("📞 CALL_END:")) {
      // Формат: 📞 CALL_END:caller=email@example.com:duration=01:23
      const withoutPrefix = text.replace("📞 CALL_END:", "");
      const callerMatch = withoutPrefix.match(/^caller=(.+?):duration=(.+)$/);
      if (!callerMatch) return <span>{text}</span>;

      const callerEmailInMsg = callerMatch[1];
      const duration = callerMatch[2];
      const iWasCaller = callerEmailInMsg === myEmail;

      return (
        <span>
          📞 {iWasCaller ? "Outgoing call" : "Incoming call"} • {duration}
        </span>
      );
    }

    return null;
  };

  useEffect(() => {
    if (!connection) return;

    const handleReceiveCall = (callerName: string, callerEmail: string) => {
      setIncomingCaller({ name: callerName, email: callerEmail });
    };

    const handleReceiveOffer = (offerStr: string) => {
      pendingOfferRef.current = offerStr;
    };

    const handleCallAnswered = (accepted: boolean) => {
      if (!accepted) {
        try { connection.invoke("SendMessage", "📞 CALL_MISSED"); } catch (_) {}
        setIsCallActive(false);
      }
    };

     const handleCallEnded = () => {
    setIncomingCaller(null);
    pendingOfferRef.current = null;
  };


    connection.on("ReceiveCall",   handleReceiveCall);
    connection.on("ReceiveOffer",  handleReceiveOffer);
    connection.on("CallAnswered",  handleCallAnswered);
    connection.on("CallEnded",    handleCallEnded);

    return () => {
      connection.off("ReceiveCall",   handleReceiveCall);
      connection.off("ReceiveOffer",  handleReceiveOffer);
      connection.off("CallAnswered",  handleCallAnswered);
       connection.off("CallEnded",    handleCallEnded);
    };
  }, [connection]);

  const handleAcceptCall = useCallback(async () => {
    if (!connection || !incomingCaller) return;

    const savedCallerEmail = incomingCaller.email;
    setCallerEmail(savedCallerEmail);
    setIncomingCaller(null);

    iceBufferRef.current = [];
    const iceBufferHandler = (candidateStr: string) => {
      iceBufferRef.current.push(candidateStr);
    };
    connection.on("ReceiveIceCandidate", iceBufferHandler);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      const pc = new RTCPeerConnection(ICE_CONFIG);
      pc.ontrack = (e) => {
        if (e.streams && e.streams[0]) setRemoteStream(e.streams[0]);
      };
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      pc.onicecandidate = (e) => {
        if (e.candidate)
          connection.invoke("SendIceCandidate", savedCallerEmail, JSON.stringify(e.candidate));
      };

      const applyOffer = async (offerStr: string) => {
        await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(offerStr)));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await connection.invoke("SendAnswer", savedCallerEmail, JSON.stringify(answer));
      };

      if (pendingOfferRef.current) {
        await applyOffer(pendingOfferRef.current);
        pendingOfferRef.current = null;
      } else {
        await new Promise<void>((resolve) => {
          const waitForOffer = (offerStr: string) => {
            connection.off("ReceiveOffer", waitForOffer);
            applyOffer(offerStr).then(resolve);
          };
          connection.on("ReceiveOffer", waitForOffer);
        });
      }

      connection.off("ReceiveIceCandidate", iceBufferHandler);
      setBufferedIce([...iceBufferRef.current]);
      iceBufferRef.current = [];

      setCalleePC(pc);
      setCalleeStream(stream);
      setIsCallActive(true);

    } catch (err) {
      console.error("Ошибка при принятии звонка:", err);
      connection.off("ReceiveIceCandidate", iceBufferHandler);
    }
  }, [connection, incomingCaller]);

  const handleRejectCall = useCallback(async () => {
    if (!connection || !incomingCaller) return;
    await connection.invoke("AnswerCall", incomingCaller.email, false);
    setIncomingCaller(null);
  }, [connection, incomingCaller]);

  const handleStartCall = useCallback(async () => {
    if (!connection) return;
    await connection.invoke("CallUser", partnerEmail, myName, myEmail);
    setIsCallActive(true);
  }, [connection, partnerEmail, myName, myEmail]);

  const handleCallClose = () => {
    setIsCallActive(false);
    setCalleePC(null);
    setCalleeStream(null);
    setCallerEmail("");
    setBufferedIce([]);
    setRemoteStream(null);
  };

  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || "?";

  const onSendMessage = () => {
    if (message.trim() === "") return;
    sendMessage(message);
    setMessage("");
  };

  return (
    <>
      <div className="chat-window">
        <div className="chat-header">
          <div className="chat-partner-info">
            <div className="chat-avatar-wrapper">
              {chatPartnerImage ? (
                <img
                  src={chatPartnerImage}
                  alt={chatPartnerName}
                  className="chat-partner-img"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <div className="chat-avatar-fallback">{getInitial(chatPartnerName)}</div>
              )}
              <span className={`chat-online-dot ${chatPartnerOnline ? "online" : "offline"}`} />
            </div>
            <div className="chat-partner-text">
              <span className="chat-partner-name">{chatPartnerName}</span>
              <span className={`chat-partner-status ${chatPartnerOnline ? "online" : "offline"}`}>
                {chatPartnerOnline ? "● Online" : "○ Offline"}
              </span>
            </div>
          </div>

          <div className="chat-header-actions">
            {connection && (
              <button className="chat-call-btn" onClick={handleStartCall} title="Видеозвонок">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              </button>
            )}
            <button className="chat-close-btn" onClick={closeChat} aria-label="Закрыть">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
              
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <p>Start the conversation!</p>
            </div>
          )}
          {messages.map((msg, index) => {
            const isOwn        = msg.user === "You";
            const isCallMsg    = msg.text.startsWith("📞 CALL_");
            const currentLabel = getDateLabel(msg.sentAt);
            const prevLabel    = getDateLabel(messages[index - 1]?.sentAt);
            const showDate     = currentLabel && currentLabel !== prevLabel;

            return (
              <React.Fragment key={index}>
                {showDate && (
                  <div className="chat-date-separator"><span>{currentLabel}</span></div>
                )}

                {isCallMsg ? (
                  // Сообщения о звонке — по центру, без пузырька
                  <div className="call-message-row">
                    <div className="call-message-bubble">
                      {renderCallMessage(msg.text, myEmail)}
                      {msg.sentAt && (
                        <span className="call-message-time">{formatTime(msg.sentAt)}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  // Обычные сообщения
                  <div className={`chat-bubble-row ${isOwn ? "own-row" : "other-row"}`}>
                    {!isOwn && <div className="chat-bubble-avatar">{getInitial(msg.user)}</div>}
                    <div className={`chat-bubble ${isOwn ? "bubble-own" : "bubble-other"}`}>
                      {!isOwn && <span className="bubble-sender">{msg.user}</span>}
                      <span className="bubble-text">{msg.text}</span>
                      {msg.sentAt && <span className="bubble-time">{formatTime(msg.sentAt)}</span>}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Напишите сообщение..."
            className="chat-input"
            onKeyDown={(e) => { if (e.key === "Enter" && message.trim()) onSendMessage(); }}
          />
          <button
            className={`chat-send-btn ${message.trim() === "" ? "disabled" : ""}`}
            onClick={onSendMessage}
            disabled={message.trim() === ""}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {incomingCaller && (
        <IncomingCall
          callerName={incomingCaller.name}
          callerEmail={incomingCaller.email}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {isCallActive && connection && (
        <VideoCall
          connection={connection}
          partnerEmail={calleePC ? callerEmail : partnerEmail}
          partnerName={chatPartnerName}
          partnerImage={chatPartnerImage}
          myEmail={myEmail}
          myName={myName}
          onClose={handleCallClose}
          isCallee={!!calleePC}
          existingPC={calleePC}
          existingStream={calleeStream}
          bufferedIceCandidates={bufferedIce}
          preloadedRemoteStream={remoteStream}
        />
      )}
    </>
  );
};

export default Chat;