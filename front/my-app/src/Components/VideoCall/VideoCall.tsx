import React, { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import "./VideoCall.css";

type VideoCallProps = {
  connection: signalR.HubConnection;
  partnerEmail: string;
  partnerName: string;
  partnerImage: string;
  myEmail: string;
  myName: string;
  onClose: () => void;
  isCallee?: boolean;
  existingPC?: RTCPeerConnection | null;
  existingStream?: MediaStream | null;
  bufferedIceCandidates?: string[];
  preloadedRemoteStream?: MediaStream | null;
};

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const VideoCall: React.FC<VideoCallProps> = ({
  connection,
  partnerEmail,
  partnerName,
  partnerImage,
  myEmail,
  onClose,
  isCallee = false,
  existingPC = null,
  existingStream = null,
  bufferedIceCandidates = [],
  preloadedRemoteStream = null,
}) => {
  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef          = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [isMuted,      setIsMuted]      = useState(false);
  const [isVideoOff,   setIsVideoOff]   = useState(false);
  const [callStatus,   setCallStatus]   = useState<"calling" | "connected" | "ended">("calling");
  const [callDuration, setCallDuration] = useState(0);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const callDurationRef = useRef(0);
  const isCalleeRef     = useRef(isCallee);
  const myEmailRef      = useRef(myEmail);
  const partnerEmailRef = useRef(partnerEmail);

  const playSound = (src: string) => {
  const audio = new Audio(src);
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

  const stopEverything = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const formatDuration = (s: number) => {
    const m   = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const attachPCEvents = useCallback((pc: RTCPeerConnection) => {
    pc.ontrack = (e) => {
      console.log("ontrack fired", e.streams);
      if (remoteVideoRef.current && e.streams[0])
        remoteVideoRef.current.srcObject = e.streams[0];
    };
    pc.onconnectionstatechange = () => {
      console.log("PC state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setCallStatus("connected");
        timerRef.current = setInterval(() => {
          setCallDuration(d => {
            callDurationRef.current = d + 1;
            return d + 1;
          });
        }, 1000);
      }
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        stopEverything();
        setCallStatus("ended");
        setTimeout(onClose, 1500);
      }
    };
    pc.onicegatheringstatechange = () => console.log("ICE gathering:", pc.iceGatheringState);
    pc.onsignalingstatechange   = () => console.log("Signaling state:", pc.signalingState);
  }, [stopEverything, onClose]);

  const handleEndCall = useCallback(async () => {
    playSound("/sounds/call-end.mp3");
    stopEverything();
    setCallStatus("ended");

    const dur = callDurationRef.current;
    const durationText = dur > 0 ? formatDuration(dur) : "Missed call";

    const callerEmail = isCalleeRef.current ? partnerEmailRef.current : myEmailRef.current;
    const callMessage = `📞 CALL_END:caller=${callerEmail}:duration=${durationText}`;

    try {
      await connection.invoke("EndCall", partnerEmailRef.current);
      await connection.invoke("SendMessage", callMessage);
    } catch (_) {}

    setTimeout(onClose, 1500);
  }, [connection, stopEverything, onClose]);

  useEffect(() => {
    console.log(`[VC useEffect] mount isCallee=${isCallee}`);

    const iceQueue: RTCIceCandidateInit[] = [];

    const addIceSafely = async (pc: RTCPeerConnection, c: RTCIceCandidateInit) => {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); }
      catch (e) { console.error("[VC] addIceCandidate error:", e); }
    };

    const flushIceQueue = async (pc: RTCPeerConnection) => {
      console.log(`[VC] Flushing ${iceQueue.length} queued ICE`);
      for (const c of iceQueue) await addIceSafely(pc, c);
      iceQueue.length = 0;
    };

    const handleIce = async (candidateStr: string) => {
      const pc = pcRef.current;
      if (!pc) { console.warn("[VC] handleIce: pcRef is null!"); return; }
      const candidate: RTCIceCandidateInit = JSON.parse(candidateStr);
      if (pc.remoteDescription) {
        await addIceSafely(pc, candidate);
      } else {
        iceQueue.push(candidate);
      }
    };

    // Получатель CallEnded просто закрывает — НЕ отправляет сообщение
    const handleCallEnded = () => {
      console.log("[VC] handleCallEnded");
      stopEverything();
      setCallStatus("ended");
      setTimeout(onClose, 1500);
    };

    if (isCallee && existingPC && existingStream) {
      if (!pcRef.current) {
        pcRef.current = existingPC;
        localStreamRef.current = existingStream;
        if (localVideoRef.current) localVideoRef.current.srcObject = existingStream;
        if (preloadedRemoteStream && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = preloadedRemoteStream;
        }
        attachPCEvents(existingPC);
        existingPC.onicecandidate = (e) => {
          if (e.candidate)
            connection.invoke("SendIceCandidate", partnerEmail, JSON.stringify(e.candidate));
        };
        (async () => {
          for (const c of bufferedIceCandidates) await addIceSafely(existingPC, JSON.parse(c));
        })();
      }

      connection.on("ReceiveIceCandidate", handleIce);
      connection.on("CallEnded",           handleCallEnded);

      return () => {
        connection.off("ReceiveIceCandidate", handleIce);
        connection.off("CallEnded",           handleCallEnded);
      };

    } else {
      if (!pcRef.current) {
        const pc = new RTCPeerConnection(ICE_CONFIG);
        pcRef.current = pc;

        const startCall = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            attachPCEvents(pc);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.onicecandidate = (e) => {
              if (e.candidate)
                connection.invoke("SendIceCandidate", partnerEmail, JSON.stringify(e.candidate));
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await connection.invoke("SendOffer", partnerEmail, JSON.stringify(offer));
          } catch (err) {
            console.error("[VC] startCall error:", err);
            pcRef.current = null;
            onClose();
          }
        };
        startCall();
      }

      const handleAnswer = async (answerStr: string) => {
        const pc = pcRef.current;
        if (!pc) return;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(answerStr)));
          await flushIceQueue(pc);
        } catch (e) {
          console.error("[VC] setRemoteDescription error:", e);
        }
      };

      connection.on("ReceiveAnswer",       handleAnswer);
      connection.on("ReceiveIceCandidate", handleIce);
      connection.on("CallEnded",           handleCallEnded);

      return () => {
        connection.off("ReceiveAnswer",       handleAnswer);
        connection.off("ReceiveIceCandidate", handleIce);
        connection.off("CallEnded",           handleCallEnded);
      };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    playSound(isMuted ? "/sounds/mic-on.mp3" : "/sounds/mic-off.mp3");
    setIsMuted(m => !m);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    playSound(isVideoOff ? "/sounds/cam-on.mp3" : "/sounds/cam-off.mp3");
    setIsVideoOff(v => !v);
  };

  return (
    <div className="vc-overlay">
      <div className="vc-window">
        <video ref={remoteVideoRef} className="vc-remote" autoPlay playsInline />

        {callStatus === "calling" && (
          <div className="vc-status-overlay">
            <img
              src={partnerImage || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
              alt={partnerName}
              className="vc-partner-avatar"
              referrerPolicy="no-referrer"
            />
            <h3 className="vc-partner-name">{partnerName}</h3>
            <p className="vc-calling-text">{isCallee ? "Соединяемся..." : "Звоним..."}</p>
            <div className="vc-calling-dots"><span /><span /><span /></div>
          </div>
        )}

        {callStatus === "ended" && (
          <div className="vc-status-overlay">
            <p className="vc-ended-text">Звонок завершён</p>
          </div>
        )}

        <video
          ref={localVideoRef}
          className={`vc-local ${isVideoOff ? "vc-hidden" : ""}`}
          autoPlay playsInline muted
        />

        <div className="vc-topbar">
          <span className="vc-topbar-name">{partnerName}</span>
          {callStatus === "connected" && (
            <span className="vc-duration">{formatDuration(callDuration)}</span>
          )}
        </div>

        <div className="vc-controls">
          <button className={`vc-btn ${isMuted ? "vc-btn-off" : ""}`} onClick={toggleMute}>
            {isMuted ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="1" x2="23" y2="23"/>
                <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/>
                <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"/>
                <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </button>

          <button className="vc-btn vc-btn-end" onClick={handleEndCall}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
            </svg>
          </button>

          <button className={`vc-btn ${isVideoOff ? "vc-btn-off" : ""}`} onClick={toggleVideo}>
            {isVideoOff ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34l1 1L23 7v10"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;