import React from 'react'
import StudentLists from './StudentLists/StudentLists'
import MentorLists from './MentorLists/MentorLists'
import { isMentor } from '../../Functions/IsMentor'

type Props = {}

const Main = (props: Props) => {
  return (
    <main>
    <section className="py-5 text-center container">
      <div className="row py-lg-5">
        <div className="col-lg-6 col-md-8 mx-auto">
          <h1 className="fw-light">SkillSync</h1>
          <p className="lead text-body-secondary">
            SkillSync is your platform to connect with others, enhance your skills, and grow professionally. Join today and start your learning journey!
            </p>
          <p>
            <a href="#" className="btn btn-primary my-2">Main call to action</a>
            <a href="#" className="btn btn-secondary my-2">Secondary action</a>
          </p>
        </div>
      </div>
    </section> 
    {isMentor() ?  <StudentLists />  : <MentorLists />}
  </main>
  )
}

export default Main