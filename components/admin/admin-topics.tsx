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

export const AdminTopics: FC = () => {
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
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Topics</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {status === "loading" && <p>Loading questions...</p>}
                {status === "error" && <p>Error loading questions!</p>}
                {status === "success" && (
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="">Month</TableHead>
                      <TableHead>Topic Name</TableHead>
                      <TableHead>Objectives</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topics.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>No Topics found</TableCell>
                      </TableRow>
                    )
                    :
                    topics.map((topic: any) => (
                        <TableRow key={topic.id}>
                          <TableCell>{getMonth(topic.topicNumber)}</TableCell>
                          <TableCell>
                              <Link href={`/admin/topic?topicId=${topic.id}`}>{topic.topicName}</Link>
                          </TableCell>
                          <TableCell>{topic.objectiveCount ? topic.objectiveCount : 0}</TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
            
          </div>
        </div>
    </>
  );
};
