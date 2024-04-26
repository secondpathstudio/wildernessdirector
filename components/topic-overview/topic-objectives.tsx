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
import { useAuth, useFirestore, useFirestoreCollection, useFirestoreDoc, useFirestoreDocData } from "reactfire";
import { Timestamp, collection, doc, query, setDoc } from "firebase/firestore";
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
  const topicObjectivesCollection = collection(firestore, "topics", props.topicId, "objectives");
  const { status: topicObjectivesStatus, data: topicObjectivesData } = useFirestoreCollection(topicObjectivesCollection);

  const markObjectiveCompleted = async (objectiveId: string) => {
    const objectiveDoc = doc(firestore, "topics", props.topicId, "objectives", objectiveId);

    if (auth.currentUser === null) {
      return;
    }

    //update objective document
    var completedByArray: object[] = [];
    if (topicObjectivesData.docs.length > 0) {
      completedByArray = topicObjectivesData.docs.find((objective: any) => objective.id === objectiveId)?.data().completedBy;
      if (completedByArray.find((user: any) => user.userId === auth.currentUser?.uid) !== undefined){
        return;
      } else {
        completedByArray.push({
          userId: auth.currentUser?.uid,
          completedAt: Timestamp.now(),
        });
      }
    }

    await setDoc(objectiveDoc, {
      lastUpdated: Timestamp.now(),
      completedBy: completedByArray,
    }, { merge: true });

    //TODO track user progress for main dashboard progress
    var topicProgress = topicData?.data()?.userProgress;
    if (topicProgress === undefined) {
      topicProgress = [];
    }
    if (topicProgress.find((user: any) => user.userId === auth.currentUser?.uid) !== undefined){
      //found user - update user progress by 1
      topicProgress.find((user: any) => user.userId === auth.currentUser?.uid).completedObjectives += 1;
      topicProgress.find((user: any) => user.userId === auth.currentUser?.uid).lastUpdated = Timestamp.now();
    } else {
      topicProgress.push({
        userId: auth.currentUser?.uid,
        completedObjectives: 1,
        lastUpdated: Timestamp.now(),
      });
    }

    await setDoc(topicDoc, {
      userProgress: topicProgress,
    }, { merge: true });

  }

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Objectives</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {topicObjectivesStatus === "loading" && <p>Loading objectives...</p>}
                {topicObjectivesStatus === "error" && <p>Error loading objectives!</p>}
                {topicObjectivesStatus === "success" && (
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Objective Type</TableHead>
                      <TableHead>Detail</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!topicObjectivesData || topicObjectivesData.docs.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={3}>No objectives found</TableCell>
                      </TableRow>
                    )
                    :
                    topicObjectivesData.docs.map((objective: any) => (
                      <Dialog>
                      <TableRow key={objective.id}>
                        <TableCell>{objective.data().objectiveType}</TableCell>
                        <DialogTrigger>
                          <TableCell>{objective.data().objectiveText}</TableCell>
                        </DialogTrigger>
                        <TableCell>{objective.data().reference ? objective.data().reference : ""}</TableCell>
                        <TableCell className="text-2xl">
                          {
                            objective.data().completedBy.find((user:any) => user.userId === auth.currentUser?.uid) !== undefined ? (
                              <span>✅</span>
                            ) : (
                              <span></span>
                            )
                          }
                        </TableCell>
                      </TableRow>
                      <DialogContent className="max-h-screen overflow-scroll">
                        <DialogHeader>
                          <DialogTitle>Objective Details</DialogTitle>
                          <DialogDescription>{objective.data().objectiveText}</DialogDescription>
                          {objective.data().reference && (
                            <>
                            <DialogTitle>Reading Chapter</DialogTitle>
                            <DialogDescription>{objective.data().reference}</DialogDescription>
                            </>
                          )}
                        </DialogHeader>
                          
                        <DialogTitle>Objective Type</DialogTitle>
                        <DialogDescription>{objective.data().objectiveType}</DialogDescription>
                        <DialogFooter>
                        {(objective.data().objectiveType === "Reading" && objective.data().completedBy.find((user: any) => user.userId === auth.currentUser?.uid)) && (
                            <DialogDescription className="italic text-sm font-bold text-primary">
                              Completed on {objective.data().completedBy.find((user: any) => user.userId === auth.currentUser?.uid).completedAt.toDate().toLocaleDateString()} ✅
                            </DialogDescription>
                        )}
                        {(objective.data().objectiveType === "Reading" && !objective.data().completedBy.find((user: any) => user.userId === auth.currentUser?.uid)) && (
                          <Button onClick={() => markObjectiveCompleted(objective.id)}>Mark as Completed</Button>
                        )}
                        {objective.data().objectiveType === "Skills" && objective.data().completedBy.find((user: any) => user.userId === auth.currentUser?.uid) && (
                            <DialogDescription className="italic text-sm font-bold text-primary">
                              Completed on {objective.data().completedBy.find((user: any) => user.userId === auth.currentUser?.uid).completedAt.toDate().toLocaleDateString()} ✅
                            </DialogDescription>
                        )}
                        {objective.data().objectiveType === "Skills" && !objective.data().completedBy.find((user: any) => user.userId === auth.currentUser?.uid) && (
                            <DialogDescription className="italic text-sm text-primary">
                              Requires sign off by fellowship director.
                            </DialogDescription>
                        )}
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
