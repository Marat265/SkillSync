import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Components/Header/Header';
import LoginPage from './Pages/Auth/LoginPage';
import SignUpPage from './Pages/Auth/SignUpPage';
import Main from './Components/main/Main';
import Mentors from './Components/Mentors/Mentors';
import Students from './Components/Students/Students';
import Sessions from './Pages/Sessions/Sessions';
import MentorSessions from './Pages/Sessions/MentorSessions';
import SessionDetails from './Pages/Sessions/SessionDetails';
import CreateSession from './Components/CreateSession/CreateSession';
import MentorDetails from './Pages/Mentors/MentorDetails';
import StudentDetails from './Pages/Students/StudentDetails';
import MentorProfile from './Components/Profile/Mentor/MentorProfile';
import StudentProfile from './Components/Profile/Student/StudentProfile';
import GoogleCallBack from './Components/GoogleCallBack/GoogleCallBack';
import ChatInbox from './Pages/Chat/ChatInbox';
import AiHub from './Pages/Ai/AiHub';

function App() {
  const [chatOpen,   setChatOpen]   = useState(false);
  const [chatUnread, setChatUnread] = useState(0);

  return (
    <Router>
      <div>
        <Header
          chatOpen={chatOpen}
          chatUnread={chatUnread}
          onChatToggle={() => setChatOpen(o => !o)}
        />

        <ChatInbox
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          onUnreadChange={setChatUnread}
        />

        <Routes>
          <Route path="/"                   element={<Main />} />
          <Route path="/mentors"            element={<Mentors />} />
          <Route path="/students"           element={<Students />} />
          <Route path="/mentorsessions"     element={<MentorSessions />} />
          <Route path="/session/:sessionId" element={<SessionDetails />} />
          <Route path="/mentors/:mentorId"  element={<MentorDetails />} />
          <Route path="/student/:studentId" element={<StudentDetails />} />
          <Route path="/createsession"      element={<CreateSession />} />
          <Route path="/sessions"           element={<Sessions />} />
          <Route path="/mentor/profile"     element={<MentorProfile />} />
          <Route path="/student/profile"    element={<StudentProfile />} />
          <Route path="/login"              element={<LoginPage />} />
          <Route path="/signup"             element={<SignUpPage />} />
          <Route path="/google-callback"    element={<GoogleCallBack />} />
          <Route path="/ai"                 element={<AiHub />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
