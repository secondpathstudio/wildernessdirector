'use client';
import { FC } from "react";
import { MainNav } from "@/components/dashboard/main-nav";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  LinkCard,
} from "@/components/ui/card";
import { useAuth, useFirestore, useFirestoreDoc, useFirestoreDocData } from "reactfire";
import { doc, query } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";

interface TopicObjectivesProps {
  topicId: string;
}

export const TopicObjectives: FC<TopicObjectivesProps> = (props) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const topicDoc = doc(firestore, "topics", props.topicId);
  const { status, data: topicData } = useFirestoreDoc(topicDoc);


  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Objectives</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {status === "loading" && <p>Loading objectives...</p>}
                {status === "error" && <p>Error loading objectives!</p>}
                {status === "success" && (
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Objective Type</TableHead>
                      <TableHead>Detail</TableHead>
                      <TableHead>Chapter</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!topicData.data()?.objectives || topicData.data()?.objectives.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={3}>No objectives found</TableCell>
                      </TableRow>
                    )
                    :
                    topicData.data()?.objectives.map((objective: any, index: number) => (
                      <Dialog>
                      <TableRow key={index}>
                        <TableCell>{objective.type}</TableCell>
                        <DialogTrigger>
                          <TableCell>{objective.text}</TableCell>
                        </DialogTrigger>
                        <TableCell>{objective.chapter ? objective.chapter : ""}</TableCell>
                        {/* <TableCell className="hover:cursor-pointer hover:bg-red-500" onClick={() => handleObjectiveDelete(index)}>Delete</TableCell> */}
                      </TableRow>
                      <DialogContent className="max-h-screen overflow-scroll">
                        <DialogHeader>
                          <DialogTitle>Objective Details</DialogTitle>
                          <DialogDescription>{objective.text}</DialogDescription>
                          {objective.chapter && (
                            <>
                            <DialogTitle>Reading Chapter</DialogTitle>
                            <DialogDescription>{objective.chapter}</DialogDescription>
                            </>
                          )}
                        </DialogHeader>
                          
                        <DialogTitle>Objective Type</DialogTitle>
                        <DialogDescription>{objective.type}</DialogDescription>
                        <DialogFooter>
                          <Button>Mark as Complete</Button>
                          <DialogDescription className="italic text-sm opacity-30">Created on {objective.createdAt.toDate().toLocaleDateString()}</DialogDescription>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
