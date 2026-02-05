import React from 'react'
import StudentLists from '../../Pages/Students/StudentLists'
import MentorLists from '../../Pages/Mentors/MentorLists'
import { isMentor } from '../../Functions/IsMentor'
import './Main.css';

const Main = () => {
  return (
    <div className="main-layout">
      {/* Мягкий фон, который НЕ перекрывает кнопки */}
      <div className="soft-bg"></div>
      
      <section className="hero-section">
        <div className="container">
          <div className="hero-card">
            <span className="hero-badge">Educational Ecosystem</span>
            <h1 className="hero-title">Skill<span>Sync</span></h1>
            <p className="hero-text">
              Build your future by connecting with experts or sharing your knowledge. 
              The most efficient way to grow professionally in 2026.
            </p>
            <div className="hero-btns">
              <button className="btn-primary-custom">Explore Platform</button>
              <button className="btn-secondary-custom">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <div className="section-title-box">
             <h2>{isMentor() ? "Active Students" : "Available Mentors"}</h2>
             <div className="title-underline"></div>
          </div>
          <div className="list-card">
            {isMentor() ? <StudentLists /> : <MentorLists />}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Main