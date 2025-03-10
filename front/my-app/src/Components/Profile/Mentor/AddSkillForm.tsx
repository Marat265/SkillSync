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
    <div className="d-flex">
      <input
        type="text"
        className="form-control"
        value={newSkill}
        onChange={(e) => setNewSkill(e.target.value)}
        placeholder="Add new skill"
      />

      <Button text="Add Skill" onClick={handleSubmit} />
    </div>
  );
};

export default AddSkillForm;
