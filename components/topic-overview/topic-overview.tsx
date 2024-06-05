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
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, query, where } from "firebase/firestore";
import ScheduleCalendar from "../ui/schedule-calendar";

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

  const getMonth = (int: number) => {
    switch (int) {
      case 0:
        return "July";
      case 1:
        return "August";
      case 2:
        return "September";
      case 3:
        return "October";
      case 4:
        return "November";
      case 5:
        return "December";
      case 6:
        return "January";
      case 7:
        return "February";
      case 8:
        return "March";
      case 9:
        return "April";
      case 10:
        return "May";
      case 11:
        return "June";
      default:
        return "Unknown";
    }
  }

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Objectives Completed
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                {props.topicData?.userProgress?.length > 0 ? (
                  <div className="text-2xl font-bold">{props.topicData.userProgress.find((u: any) => (u.userId === auth.currentUser?.uid)).completedObjectives}</div>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                {/* <CardTitle>{getMonth(props.topicData?.topicNumber)} Schedule</CardTitle> */}
                <ScheduleCalendar 
                  topicNumber={props.topicData?.topicNumber}
                />
              </CardHeader>
              <CardContent className="pl-2">{/* <Overview /> */}</CardContent>
            </Card>
          </div>
        </div>
    </>
  );
};
