import React from "react";

type SkillsListProps = {
  skills: string[];
  onDeleteSkill: (skillName: string) => void;
};

const SkillsList: React.FC<SkillsListProps> = ({ skills, onDeleteSkill }) => {
  return (
    <div className="skills-wrapper-custom">
      {skills.length > 0 ? (
        skills.map((skill, index) => (
          <div key={index} className="skill-chip-interactive">
            <span className="skill-text">{skill}</span>
            <button 
              type="button"
              onClick={() => onDeleteSkill(skill)} 
              className="skill-delete-btn"
            >
              &times;
            </button>
          </div>
        ))
      ) : (
        <p className="no-skills-text">No skills added yet.</p>
      )}
    </div>
  );
};

export default SkillsList;