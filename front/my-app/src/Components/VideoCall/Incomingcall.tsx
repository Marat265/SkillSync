import {useRef ,useEffect} from "react";
import "./VideoCall.css";

type IncomingCallProps = {
  callerName: string;
  callerEmail: string;
  onAccept: () => void;
  onReject: () => void;
};

const IncomingCall: React.FC<IncomingCallProps> = ({
  callerName,
  callerEmail,
  onAccept,
  onReject,
}) => {

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
      const audio = new Audio("/sounds/ringtone.mp3");
      audio.loop = true;
      audio.volume = 0.5;
      audioRef.current = audio;

      audio.play().catch((e) => console.warn("Autoplay blocked:", e));

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }, []);

    const handleAccept = () => {
      audioRef.current?.pause();
      onAccept();
    };

    const handleReject = () => {
      audioRef.current?.pause();
      onReject();
    };
  return (
    <div className="incoming-overlay">
      <div className="incoming-card">
        <div className="incoming-pulse">
          <div className="incoming-avatar-ring">
            <div className="incoming-avatar-placeholder">
              {callerName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        <h3 className="incoming-name">{callerName}</h3>
        <p className="incoming-subtitle">Incoming video call...</p>

        <div className="incoming-actions">
          <button className="incoming-btn reject" onClick={handleReject} title="Reject">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
            </svg>
          </button>

          <button className="incoming-btn accept" onClick={handleAccept} title="Accept">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
            </svg>
          </button>
        </div>

        <div className="incoming-labels">
          <span>Decline</span>
          <span>Accept</span>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;
