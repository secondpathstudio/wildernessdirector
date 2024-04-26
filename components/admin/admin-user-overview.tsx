'use client';
import { FC, useState } from "react";
import { MainNav } from "@/components/dashboard/main-nav";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  LinkCard,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, orderBy, query, where } from "firebase/firestore";
import Link from "next/link";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import ObjectiveTable from "./objective-table";

interface AdminUserOverviewProps {
    userId: string;
}

export const AdminUserOverview: FC<AdminUserOverviewProps> = (props) => {
  const auth = useAuth();
  const [currentTopic, setCurrentTopic] = useState<any>(null);
  const firestore = useFirestore();
  const [isAscending, setIsAscending] = useState(true);
  const topicsCollection = collection(firestore, "topics");
  const topicsQuery = query(topicsCollection, 
    orderBy('topicNumber', isAscending ? 'asc' : 'desc'));
  const { status, data: topics } = useFirestoreCollectionData(topicsQuery, {
    idField: 'id',
  });





  const getMonth = (month: number) => {
    const months = ['July', 'August', 'September', 'October', 'November', 'December','January', 'February', 'March', 'April', 'May', 'June', ];
    return months[month];
  }

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7">
              <CardHeader>
                <div className="flex items-center">
                <CardTitle>Month: </CardTitle>
                {status === "loading" && <p>Loading data...</p>}
                {status === "error" && <p>Error loading data!</p>}
                {status === "success" && topics.length > 0 && 
                  <Select 
                  onValueChange={(v) => setCurrentTopic(v)}
                  value={currentTopic}
                  >
                  <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Months" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectGroup>
                        {topics.map((topic: any) => (
                          <SelectItem key={topic.id} value={topic.id}>{getMonth(topic.topicNumber)}</SelectItem>
                        ))}
                      </SelectGroup>
                  </SelectContent>
                  </Select>
                }
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                {currentTopic && (
                  <ObjectiveTable currentTopicId={currentTopic} currentUserId={props.userId}/>
                )}
              </CardContent>
            </Card>
            
          </div>
        </div>
    </>
  );
};
