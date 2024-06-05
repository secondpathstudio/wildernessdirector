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
import { BookOpen, FileQuestion, ListChecks } from "lucide-react";

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
                <ListChecks />
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
