import { CalendarContainer } from "@/components/schedules/calendar-container";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";

const CalendarPage = () => {
  return (
    <Suspense>
      <CalendarContainer />
      <Toaster />
    </Suspense>
  );
};
export default CalendarPage;