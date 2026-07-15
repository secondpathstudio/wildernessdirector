'use client';
import { FC, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useAuth, useFirestore, useFirestoreCollection, useFirestoreDoc } from "reactfire";
import { collection, orderBy, query } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useUserStore } from "@/lib/store";
import { toast } from "../ui/use-toast";
import { Axe, Book, Check } from "lucide-react";
import CheckmarkButton from "../ui/checkmark-button";
import { TopicProgress, getCompletion, progressDocRef, setObjectiveCompletion } from "@/lib/progress";

interface TopicObjectivesProps {
  topicId: string;
}

export const TopicObjectives: FC<TopicObjectivesProps> = (props) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const topicObjectivesCollection = collection(firestore, "topics", props.topicId, "objectives");
  const topicObjectivesQuery = query(topicObjectivesCollection,
    orderBy("reference", "asc"),
  );
  const { status: topicObjectivesStatus, data: topicObjectivesData } = useFirestoreCollection(topicObjectivesQuery);
  const progressRef = progressDocRef(firestore, auth.currentUser?.uid ?? "anonymous", props.topicId);
  const { data: progressSnap } = useFirestoreDoc(progressRef);
  const progress = progressSnap?.data() as TopicProgress | undefined;
  const userRole = useUserStore((state) => state.role);
  const [showCompleted, setShowCompleted] = useState(true);

  const markObjectiveCompleted = async (objectiveId: string) => {
    if (auth.currentUser === null) {
      return;
    }

    if (userRole !== 'admin' && userRole !== 'fellow') {
      toast({
        title: "You do not have permission to complete objectives",
      })
      return;
    }

    if (getCompletion(progress, objectiveId) !== undefined) {
      return;
    }

    await setObjectiveCompletion(firestore, {
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName,
      topicId: props.topicId,
      objectiveId,
      completed: true,
    });
  }

  return (
    <>
        <div className="flex-1 space-y-4 pt-6 w-full">
          <div className="grid gap-4 grid-cols-1">
            <Card className="col-span-4">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Objectives</CardTitle>
                <div className="flex items-center gap-3">
                  <CardDescription className="hidden md:flex">{showCompleted ? "Hide" : "Show"} Completed</CardDescription>
                  <CheckmarkButton toggleOn={showCompleted} onClick={() => setShowCompleted(prev=>!prev)}/>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                {topicObjectivesStatus === "loading" && <p>Loading objectives...</p>}
                {topicObjectivesStatus === "error" && <p>Error loading objectives!</p>}
                {topicObjectivesStatus === "success" && (
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Detail</TableHead>
                      <TableHead>Ref</TableHead>
                      <TableHead className={`${showCompleted ? '' : 'hidden'}`}>
                        <Check />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!topicObjectivesData || topicObjectivesData.docs.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={3}>No objectives found</TableCell>
                      </TableRow>
                    )
                    :
                    topicObjectivesData.docs.map((objective: any) => {
                      const completion = getCompletion(progress, objective.id);

                      if (!showCompleted && completion !== undefined) {
                        return;
                      }


                      //TODO: vertical align the row content
                      return (
                      <Dialog key={objective.id}>
                      <TableRow>
                        <TableCell className="text-primary">
                          {objective.data().objectiveType === "Reading" ? <Book /> : <Axe />}
                        </TableCell>
                        <DialogTrigger>
                          <TableCell className="truncate max-w-[100px] sm:max-w-[250px] md:max-w-[500px] lg:max-w-[700px] xl:max-w-full">{objective.data().objectiveText}</TableCell>
                        </DialogTrigger>
                        <TableCell>{objective.data().reference ? objective.data().reference : ""}</TableCell>
                        <TableCell>
                          {
                            completion !== undefined ? (
                              <span className="text-primary"><Check size={25}/></span>
                            ) : (
                              <span></span>
                            )
                          }
                        </TableCell>
                      </TableRow>
                      <DialogContent className="max-h-screen overflow-scroll sm:max-w-[425px] w-11/12 rounded-md">
                        <DialogHeader>
                          <DialogTitle>Objective Details</DialogTitle>
                          <DialogDescription>{objective.data().objectiveText}</DialogDescription>
                          {objective.data().reference && (
                            <>
                            <DialogTitle className="text-sm">Reading Chapter</DialogTitle>
                            <DialogDescription>{objective.data().reference}</DialogDescription>
                            </>
                          )}
                          <DialogTitle className="text-sm">Objective Type</DialogTitle>
                          <DialogDescription>{objective.data().objectiveType}</DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                        {(objective.data().objectiveType === "Reading" && completion) && (
                            <DialogDescription className="italic text-sm font-bold text-primary">
                              Completed on {completion.completedAt.toDate().toLocaleDateString()} ✅
                            </DialogDescription>
                        )}
                        {(objective.data().objectiveType === "Reading" && !completion) && (
                          <Button onClick={() => markObjectiveCompleted(objective.id)}>Mark as Completed</Button>
                        )}
                        {objective.data().objectiveType === "Skills" && completion && (
                            <DialogDescription className="italic text-sm font-bold text-primary">
                              Completed on {completion.completedAt.toDate().toLocaleDateString()} ✅
                            </DialogDescription>
                        )}
                        {objective.data().objectiveType === "Skills" && !completion && (
                            <DialogDescription className="italic text-sm text-primary">
                              Requires sign off by fellowship director.
                            </DialogDescription>
                        )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    )}
                    )}
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
