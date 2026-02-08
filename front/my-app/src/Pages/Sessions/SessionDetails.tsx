import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SessionService } from "../../Components/Services/sessionService";
import Button from "../../Components/UI/Button";

const statusLabels: Record<number, string> = {
    0: 'Scheduled',
    1: 'Completed',
    2: 'Cancelled'
  };

const SessionDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const fetchSessionDetails = async () => {
      try {
        const data = await SessionService.GetSessionDetails(sessionId);
        setSession(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchSessionDetails();
  }, [sessionId]);

  if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;
  if (!session) return <div className="container mt-5 text-center">Loading...</div>;

  return (
   <div className="session-page py-5" style={{ background: '#f8faff', minHeight: '100vh' }}>
      <div className="container">
        <Button text="← Back to Sessions" onClick={() => navigate(-1)} className="mb-4 btn-light" />
        
        <div className="row">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '20px' }}>
             <span className="session-badge mb-3" style={{ width: 'fit-content' }}>
                {statusLabels[session.status] || 'Unknown'}
              </span>
              <h1 style={{ fontWeight: 800 }}>{session.topic}</h1>
              <p className="text-muted lead">Join this session to improve your skills with {session.mentor.name}.</p>
              
              <hr className="my-4" />
              
              <div className="row g-4">
                <div className="col-md-6">
                  <h6><strong>Date & Time</strong></h6>
                  <p>📅 {new Date(session.startTime).toLocaleString()}</p>
                </div>
                <div className="col-md-6">
                  <h6><strong>Duration</strong></h6>
                  <p>⏱️ {session.duration} h</p>
                </div>
                <div className="col-md-6">
                  <h6><strong>Available Seats</strong></h6>
                  <p>👥 {session.maxStudents - session.currentStudents} seats left</p>
                </div>
                <div className="col-md-6">
                  <h6><strong>Total Students</strong></h6>
                  <p>📊 {session.currentStudents} registered</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px', position: 'sticky', top: '20px' }}>
              <h5 className="mb-4">About Mentor</h5>
              <div className="text-center mb-3">
                 <img 
                    src={session.mentor.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                    className="rounded-circle mb-3" 
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    alt={session.mentor.name}
                 />
                 <h4>{session.mentor.name}</h4>
                 <p className="text-muted">{session.mentor.email}</p>
              </div>
              <Button 
  text="Contact Mentor" 
  className="w-100 btn-primary" 
 onClick={() => navigate(`/mentors/${session.mentor.id}`)}
/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;