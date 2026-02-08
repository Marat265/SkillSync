import React, { useState } from "react";
import Button from "../../UI/Button";

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
    <div className="input-group custom-skill-input">
      <input
        type="text"
        className="form-control profile-input m-0"
        value={newSkill}
        onChange={(e) => setNewSkill(e.target.value)}
        placeholder="E.g. React, Python, UI Design..."
      />
      <button 
        className="btn-save-mini px-4" 
        onClick={() => { if(newSkill) onAddSkill(newSkill); setNewSkill(""); }}
      >
        <i className="fas fa-plus me-2"></i>Add
      </button>
    </div>
  );
};

export default AddSkillForm;
