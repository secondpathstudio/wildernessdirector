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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useAuth, useFirestore, useFirestoreCollection, useFirestoreDoc } from "reactfire";
import { toast } from "../ui/use-toast";
import { Timestamp, addDoc, collection, deleteDoc, doc, query, setDoc, orderBy } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

interface AdminObjectiveCreatorProps {
    topicId: string;
    setCurrentTopic: (topic: any) => void;
}

export const AdminObjectiveCreator: FC<AdminObjectiveCreatorProps> = (props) => {
  const firestore = useFirestore();
  const topicDoc = doc(firestore, "topics", props.topicId);
  const topicObjectivesCollection = collection(firestore, "topics", props.topicId, "objectives");
  const topicObjectivesQuery = query(topicObjectivesCollection,
    orderBy("reference", "asc"),
  );
  const { status: topicObjectivesStatus, data: topicObjectives } = useFirestoreCollection(topicObjectivesQuery);
  const { status, data: topicData } = useFirestoreDoc(topicDoc);
  const [isLoading, setIsLoading] = useState(false);
  const [newObjective, setNewObjective] = useState({
    objectiveText: "",
    completedBy: [],
    reference: "",
    objectiveType: "",
    topicId: props.topicId,
  })

  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (auth.currentUser === null) {
      toast({
        title: "You need to be logged in to create an objective.",
      })
      setIsLoading(false);
      return;
    }

    if (newObjective.objectiveText === "" || newObjective.objectiveType === "") {
        toast({
            title: "Objective not created",
            description: "Objective text and type are required.",
        });
        setIsLoading(false);
        return;
    }

    //add objective to sub-collection
    try {
      const topicObjectivesCollection = collection(firestore, "topics", props.topicId, "objectives");
      await addDoc(topicObjectivesCollection, {
        ...newObjective,
        createdAt: Timestamp.now(),
      });

      await setDoc(doc(firestore, "topics", props.topicId), {
        lastUpdated: Timestamp.now(),
        objectiveCount: topicData.data()?.objectiveCount ? topicData.data()?.objectiveCount + 1 : 1,
      }, { merge: true });
      
      toast({
        title: "Objective created",
        description: "Objective added successfully!",
      });
    } catch (error : any) {
      //TODO use toast
      console.log(error)
    }

    //reset objective
    setNewObjective({
        objectiveText: "",
        reference: "",
        completedBy: [],
        objectiveType: "",
        topicId: props.topicId,
    });

    setIsLoading(false);
  }

    const handleObjectiveDelete = async (id: string) => {
        try {
            const objectiveDoc = doc(firestore, "topics", props.topicId, "objectives", id);
            await deleteDoc(objectiveDoc);
            await setDoc(doc(firestore, "topics", props.topicId), {
                lastUpdated: Timestamp.now(),
                objectiveCount: topicData.data()?.objectiveCount ? topicData.data()?.objectiveCount - 1 : 0,
            }, { merge: true });
        } catch (error : any) {
            console.log(error);
        }
    }

  if (status === "loading") {
    return <div>Loading topic data...</div>;
  }

  if (status === "error") {
    return <div>Error loading topic data!</div>;
  }

  if (!topicData.exists()) {
    return <div>Topic not found</div>;
  }

  if (status === "success") {
    return (
    <>
        <Card className="col-span-4">
              <Button className="m-2" variant={"destructive"} onClick={() => props.setCurrentTopic(null)}>Back</Button>
              <CardHeader>
                <CardTitle>Objectives for {topicData.data().topicName}</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Objective Type</TableHead>
                      <TableHead>Objective</TableHead>
                      <TableHead>Chapter</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(topicObjectives === null || topicObjectives === undefined || topicObjectives.docs.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={3}>No objectives found</TableCell>
                      </TableRow>
                    )
                    :
                    topicObjectives.docs.map((topicObjective: any) => (
                      <Dialog>
                        <TableRow key={topicObjective.id}>
                          <TableCell>{topicObjective.data().objectiveType}</TableCell>
                          <DialogTrigger>
                            <TableCell>{topicObjective.data().objectiveText}</TableCell>
                          </DialogTrigger>
                          <TableCell>{topicObjective.data().reference ? topicObjective.data().reference : ""}</TableCell>
                          {/* <TableCell className="hover:cursor-pointer hover:bg-red-500" onClick={() => handleObjectiveDelete(index)}>Delete</TableCell> */}
                        </TableRow>
                        <DialogContent className="max-h-screen overflow-scroll">
                          <DialogHeader>
                            <DialogTitle>Objective Details</DialogTitle>
                            <DialogDescription>{topicObjective.data().objectiveText}</DialogDescription>
                            {topicObjective.data().reference && (
                              <>
                              <DialogTitle>Reference</DialogTitle>
                              <DialogDescription>{topicObjective.data().reference}</DialogDescription>
                              </>
                            )}
                          </DialogHeader>
                            
                          <DialogTitle>Objective Type</DialogTitle>
                          <DialogDescription>{topicObjective.data().objectiveType}</DialogDescription>
                          <DialogFooter>
                            <Button onClick={() => handleObjectiveDelete(topicObjective.id)}>Delete</Button>
                            <DialogDescription className="italic text-sm opacity-30">Created on {topicObjective.data().createdAt.toDate().toLocaleDateString()}</DialogDescription>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        <Card className="col-span-3 max-h-fit">
        <CardHeader>
            <CardTitle className="pb-2">Objective Creator</CardTitle>
            <CardDescription>{topicData.data()?.topicName}</CardDescription>
        </CardHeader>
        <CardContent className="flex-col gap-10">
        <form onSubmit={handleSubmit}>
        <fieldset disabled={isLoading} className="space-y-4">

            {/* Type of objective */}
            <Select 
            onValueChange={(v) => setNewObjective({...newObjective, objectiveType: v})}
            value={newObjective.objectiveType}
            >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Objective Type" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                <SelectItem value="Reading">Reading</SelectItem>
                <SelectItem value="Skills">Skills</SelectItem>
                </SelectGroup>
            </SelectContent>
            </Select>

            <Input 
            placeholder="Reference" 
            onChange={(e) => setNewObjective({...newObjective, reference: e.target.value})}
            value={newObjective.reference}
            />

            {/* objective text */}
            <Textarea 
            placeholder="Objective" 
            onChange={(e) => setNewObjective({...newObjective, objectiveText: e.target.value})}
            value={newObjective.objectiveText}
            />

            {/* Submit button */}
            <Button>Create Objective</Button>
            </fieldset>
            </form>
        </CardContent>
        </Card>
    </>
    );
    }
};