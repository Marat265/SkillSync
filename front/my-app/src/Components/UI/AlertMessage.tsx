import React from "react";

type AlertMessageProps = {
  message: string | null;
  type: "success" | "danger";
};

const AlertMessage: React.FC<AlertMessageProps> = ({ message, type }) => {
  if (!message) return null;
  return <div className={`alert alert-${type} mt-3`}>{message}</div>;
};

export default AlertMessage;
