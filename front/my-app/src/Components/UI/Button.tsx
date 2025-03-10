import React from 'react'
import './Button.css'

type Props = {
    text: string;
    onClick?: () => void;
    className?: string; // Добавляем className (необязательный)
}

const Button = ({ text, onClick, className }: Props) => {
  const buttonClass = text === 'Log out' || text === 'Delete' 
    ? 'btn btn-danger' 
    : className || 'btn btn-primary'; // Если text не Log out/Delete, используем className (если есть)

  return (
    <button className={`${buttonClass} m-2`} onClick={onClick}>
      {text}
    </button>
  )
}

export default Button
