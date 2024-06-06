import React, {useState} from 'react'
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction" // needed for dayClick
import { useAuth, useFirestore } from 'reactfire';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Timestamp } from 'firebase/firestore';

type Props = {
    topicNumber: number
    events: any[]
    handleChangeMonth: (newDate: Date) => void
    handleEventDelete: (id: string, startDate: Date) => void
}

export default function ScheduleCalendar(props: Props) {
    const auth = useAuth();
    const firestore = useFirestore();
    const [showEventDialog, setShowEventDialog] = useState<boolean>(false);
    const [currentEvent, setCurrentEvent] = useState<any>(null);

    const handleEventClick = (event: any) => {
        const eventDetails = {
            title: event.title,
            start: event.start.toLocaleDateString(),
            startDate: event.start,
            end: event.end ? event.end.toLocaleDateString() : 'N/A',
            id: event.id
        }
        console.log(eventDetails)

        //show modal with event details and delete button
        setCurrentEvent(eventDetails)
        setShowEventDialog(true)
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
    <>
    <FullCalendar 
        initialDate={new Date()}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={props.events}
        eventClick={(arg) => {handleEventClick(arg.event)}}
        eventContent={renderEventContent}
        eventClassNames={'bg-primary'}
        headerToolbar={{
            left: 'title',
            center: '',
            right: 'today prev,next'
        }}
        datesSet={(dateInfo) => {props.handleChangeMonth(dateInfo.view.currentStart)}}
        eventBorderColor='#000000'
    />
    <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>{currentEvent?.title}</DialogTitle>
            </DialogHeader>

            <DialogDescription>
                    Starts: {currentEvent?.start}
            </DialogDescription>
            <DialogDescription>
                    Ends: {currentEvent?.end}
            </DialogDescription>

            <DialogFooter>
                <Button variant="destructive" onClick={() => {
                    props.handleEventDelete(currentEvent.id, currentEvent.startDate)
                    setShowEventDialog(false)
                }}>Delete</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    </>
  )
}

function renderEventContent(eventInfo: any) {
    return (
        <p className='text-xs bg-primary !border-none'>{eventInfo.event.title}</p>
    )
}