'use client';
import { FC, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  LinkCard,
} from "@/components/ui/card";
import { useAuth, useFirestore, useFirestoreCollectionData, useFirestoreDocData } from "reactfire";
import { collection, doc, query, where } from "firebase/firestore";
import { BookOpen, FileQuestion, ListChecks } from "lucide-react";
import { getMonth } from "@/lib/CONSTANTS";
import ProgressCard from "./progress-card";
import EventListItem from "./event-list-item";

interface TopicOverviewProps {
  topicId: string;
  topicData: any;
}

export const TopicOverview: FC<TopicOverviewProps> = (props) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const questionsCollection = collection(firestore, "questions");
  const questionsQuery = query(questionsCollection, 
    where('topicId', '==', props.topicId),
    where('authorId', '==', auth.currentUser?.uid));
  const { status: questionStatus, data: questions } = useFirestoreCollectionData(questionsQuery, {
    idField: 'id',
  });
  const fieldReportsCollection = collection(firestore, "fieldReports");
  const fieldReportsQuery = query(fieldReportsCollection, 
    where('topicId', '==', props.topicId),
    where('authorId', '==', auth.currentUser?.uid));
  const { status: fieldReportStatus, data: fieldReports } = useFirestoreCollectionData(fieldReportsQuery, {
      idField: 'id',
  });

  const scheduleDoc = doc(firestore, "schedules", props.topicId);
  const { status: schedulesStatus, data: schedule } = useFirestoreDocData(scheduleDoc, {
    idField: 'id',
  });

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 grid-cols-3">
          <ProgressCard 
            topicData={props.topicData} 
            auth={auth} 
            titleText="Objectives Completed"
          />
          <ProgressCard 
            topicData={props.topicData} 
            auth={auth} 
            titleText="Field Reports"
            fieldReportStatus={fieldReportStatus}
            fieldReports={fieldReports}
          />
          <ProgressCard 
            topicData={props.topicData} 
            auth={auth} 
            titleText="Questions Submitted" 
            questionStatus={questionStatus}
            questions={questions}
          />
           
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Card className="lg:col-span-6 md:col-span-2 col-span-1">
              <CardHeader>
                <CardTitle>{getMonth(props.topicData.topicNumber)} Events</CardTitle>
                {schedulesStatus === "loading" && (
                  <CardContent>Loading...</CardContent>
                )}
                {schedulesStatus === "error" && (
                  <CardContent>Error loading events...</CardContent>
                )}
                {schedulesStatus === "success" && (
                  <CardContent>
                    {schedule?.events?.length > 0 ? schedule.events.map((event: any, index: number) => {
                      return (
                        <EventListItem
                          event={event}
                          index={index}
                          key={index}
                        />
                      );
                    }) : (
                      <div className="text-sm text-gray-500">No events scheduled</div>
                  )}
                  </CardContent>
                )}
              </CardHeader>
              <CardContent className="pl-2">{/* <Overview /> */}</CardContent>
            </Card>
          </div>
        </div>
    </>
  );
};
