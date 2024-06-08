import { Check } from 'lucide-react'
import React from 'react'

type Props = {
    toggleOn: boolean;
    onClick: () => void;
}

const CheckmarkButton = (props: Props) => {
  return (
    <button onClick={props.onClick} className={`rounded-md flex items-center justify-center px-2 py-1 ${props.toggleOn ? "bg-primary text-background" : "text-gray-500 bg-gray-400"}`}>
        <Check />
    </button>
  )
}

export default CheckmarkButton