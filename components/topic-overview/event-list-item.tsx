import { Timestamp } from 'firebase/firestore'
import React from 'react'

type Props = {
    event: {
        startDate: Timestamp,
        endDate: Timestamp,
        title: string,
        description: string,
    }
    index: number
}

const EventListItem = ({event, index}: Props) => {
  return (
    <div key={index} className={`flex flex-col gap-1 my-2 px-2 py-1 rounded-md ${index % 2 === 0 && 'bg-primary text-background'}`}>
        <div className="flex items-center gap-2">
        <div className="text-lg font-semibold">
        {event.startDate.toDate().getDate() === event.endDate.toDate().getDate()
            ? 
            event.startDate?.toDate().getDate() 
            : event.startDate?.toDate().getDate() + "-" + event.endDate?.toDate().getDate()
            }
        </div>
        <div className="text-sm md:text-md flex flex-col sm:flex-row sm:gap-2">
            <h3 className="font-bold">{event.title}</h3>
            {event.description != "" && (
            <span className="italic">({event.description})</span>
            )}
        </div>
        </div>
    </div>
  )
}

export default EventListItem