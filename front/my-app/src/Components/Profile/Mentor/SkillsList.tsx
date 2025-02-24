import React from "react";

type SkillsListProps = {
  skills: string[];
  onDeleteSkill: (skillName: string) => void;
};

const SkillsList: React.FC<SkillsListProps> = ({ skills, onDeleteSkill }) => {
  return (
    <div>
      <h4>Skills</h4>
      {skills.length > 0 ? (
        <ul className="list-group mb-3">
          {skills.map((skill, index) => (
            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
              {skill}
              <button className="btn btn-danger btn-sm" onClick={() => onDeleteSkill(skill)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">No skills listed</p>
      )}
    </div>
  );
};

export default SkillsList;
