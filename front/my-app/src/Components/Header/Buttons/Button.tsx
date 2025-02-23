import React from 'react'
import './Button.css'

type Props = {
    text: string
    onClick: ()=>void; 
}

const Button = (props: Props) => {

  const buttonClass = props.text === 'Log out' || props.text === 'Delete' ? 'btn btn-danger' : 'btn btn-primary';

  return (
    <button className={`${buttonClass} m-2`} onClick={props.onClick}>
       {props.text}
       </button>
  )
}

export default Button