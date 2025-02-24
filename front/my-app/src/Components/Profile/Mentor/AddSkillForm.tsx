import React, { useState } from "react";

type AddSkillFormProps = {
  onAddSkill: (skill: string) => void;
};

const AddSkillForm: React.FC<AddSkillFormProps> = ({ onAddSkill }) => {
  const [newSkill, setNewSkill] = useState("");

  const handleSubmit = () => {
    if (newSkill.trim()) {
      onAddSkill(newSkill);
      setNewSkill("");
    }
  };

  return (
    <div className="d-flex">
      <input
        type="text"
        className="form-control"
        value={newSkill}
        onChange={(e) => setNewSkill(e.target.value)}
        placeholder="Add new skill"
      />
      <button className="btn btn-primary ms-2" onClick={handleSubmit}>
        Add Skill
      </button>
    </div>
  );
};

export default AddSkillForm;
