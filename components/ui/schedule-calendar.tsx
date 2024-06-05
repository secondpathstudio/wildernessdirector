import React, {useState} from 'react'
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction" // needed for dayClick
import { func } from 'prop-types';
import { get } from 'request';

type Props = {
    topicNumber: number
    events: any[]
}

export default function ScheduleCalendar(props: Props) {
    // const [events, setEvents] = useState([
    //     { title: 'Fellow Didactics', date: '2024-07-04' },
    //     { title: 'Fellow Didactics', date: '2024-07-11' },
    //     { title: 'Fellow Didactics', date: '2024-07-18' },
    //     { title: 'Fellow Didactics', date: '2024-07-25' },
    // ])

    const handleDateClick = (arg: any) => {
        alert(arg.dateStr)
    }

    const getInitialDate = () => {
        if (props.topicNumber === undefined || props.topicNumber === null) {
            return new Date()
        }
        
        let date = new Date()
        let year = date.getFullYear()
        let month = props.topicNumber + 6 % 12
        if (month <= 6) {
            year += 1
        }
        date.setMonth(month)
        return date;
    }

    if (props.topicNumber === undefined || props.topicNumber === null) {
        return (
            <div className='flex justify-center items-center w-full'>
                <p className='text-center'>Loading calendar...</p>
            </div>
        )
    }

  return (
    <FullCalendar 
        initialDate={getInitialDate()}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={props.events}
        dateClick={handleDateClick}
        eventContent={renderEventContent}
        headerToolbar={{
            left: 'title',
            center: '',
            right: ''
        }}
    />
  )
}

function renderEventContent(eventInfo: any) {
    return (
        <>
            <p className='text-xs'>{eventInfo.event.title}</p>
        </>
    )
}