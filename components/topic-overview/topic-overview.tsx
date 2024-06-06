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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Objectives Completed
                </CardTitle>
                <ListChecks />
              </CardHeader>
              <CardContent>
                {props.topicData?.userProgress?.length > 0 ? (
                  <div className="text-2xl font-bold">{props.topicData.userProgress.find((u: any) => (u.userId === auth.currentUser?.uid))?.completedObjectives}</div>
                ) :
                  <div className="text-2xl font-bold">0</div>
                }
              </CardContent>
            </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Field Reports
                </CardTitle>
                <BookOpen />
              </CardHeader>
              <CardContent>
                {fieldReportStatus === "loading" && (
                  <div className="text-2xl font-bold">...</div>
                )}
                {fieldReportStatus === "error" && (
                  <div className="text-2xl font-bold">Error loading reports...</div>
                )}
                {fieldReportStatus === "success" && (
                  <div className="text-2xl font-bold">{fieldReports.length}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Questions Submitted
                </CardTitle>
                <FileQuestion />
              </CardHeader>
              <CardContent>
                {questionStatus === "loading" && (
                  <div className="text-2xl font-bold">...</div>
                )}
                {questionStatus === "error" && (
                  <div className="text-2xl font-bold">!</div>
                )}
                {questionStatus === "success" && (
                  <div className="text-2xl font-bold">{questions.length}</div>
                )}
              </CardContent>
            </Card>
            
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
                        <div key={index} className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-semibold">
                            {event.startDate.toDate().getDate() === event.endDate.toDate().getDate()
                              ? 
                              event.startDate?.toDate().getDate() 
                              : event.startDate?.toDate().getDate() + "-" + event.endDate?.toDate().getDate()
                              }
                            </div>
                            <div className="text-md text-gray-700 flex gap-2">
                              {event.title}
                              {event.description != "" && (
                                <span className="italic">({event.description})</span>
                              )}
                            </div>
                          </div>
                        </div>
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
