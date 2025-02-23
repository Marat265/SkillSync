import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Components/Header/Header';
import LoginPage from './Components/Auth/Login/LoginPage';
import SignUpPage from './Components/Auth/SignUp/SignUpPage';
import Main from './Components/main/Main';
import Mentors from './Components/Mentors/Mentors';
import Students from './Components/Students/Students';
import Sessions from './Components/Sessions/Sessions';
import Profile from './Components/Profile/Mentor/MentorProfile';
import MentorSessions from './Components/Sessions/MentorSessions/MentorSessions';
import SessionDetails from './Components/Sessions/SessionDetails';
import CreateSession from './Components/CreateSession/CreateSession';
import MentorDetails from './Components/Mentors/MentorDetails';
import StudentDetails from './Components/Students/StudentDetails';
import MentorProfile from './Components/Profile/Mentor/MentorProfile';
import StudentProfile from './Components/Profile/Student/StudentProfile';

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/students" element={<Students />} />
          <Route path="/mentorsessions" element={<MentorSessions />} />

          <Route path="/session/:sessionId" element={<SessionDetails />} />
          <Route path="/mentors/:mentorId" element={<MentorDetails />} />
          <Route path="/student/:studentId" element={<StudentDetails />} />

          <Route path="/createsession" element={<CreateSession />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/mentor/profile" element={<MentorProfile />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
