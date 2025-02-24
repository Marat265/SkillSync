import React from "react";

type MentorInfoProps = {
  name: string;
  email: string;
  createdAt: string;
  totalReviews: number;
};

const MentorInfo: React.FC<MentorInfoProps> = ({ name, email, createdAt, totalReviews }) => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <p className="mb-1"><strong>Name:</strong> {name}</p>
          <button className="btn btn-outline-secondary btn-sm">Edit Name</button>
        </div>
        <div>
          <p className="mb-1"><strong>Email:</strong> {email}</p>
          <button className="btn btn-outline-secondary btn-sm">Edit Email</button>
        </div>
      </div>
      <p className="mb-2"><strong>Registered:</strong> {new Date(createdAt).toLocaleDateString()}</p>
      <p className="mb-2"><strong>Reviews:</strong> <span className="badge bg-success">{totalReviews}</span></p>
    </div>
  );
};

export default MentorInfo;
