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
import { DatePicker } from "../ui/datepicker";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useAuth, useFirestore, useFirestoreDoc } from "reactfire";
import { toast } from "../ui/use-toast";
import { Timestamp, addDoc, collection, doc, setDoc } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import Link from "next/link";

interface AdminObjectiveCreatorProps {
    topicId: string;
}

export const AdminObjectiveCreator: FC<AdminObjectiveCreatorProps> = (props) => {
  const firestore = useFirestore();
  const topicDoc = doc(firestore, "topics", props.topicId);
  const { status, data: topicData } = useFirestoreDoc(topicDoc);
  const [isLoading, setIsLoading] = useState(false);
  const [objective, setObjective] = useState({
    text: "",
    chapter: "",
    type: "",
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

    if (objective.text === "" || objective.type === "") {
        toast({
            title: "Objective not created",
            description: "Objective text and type are required.",
        });
        setIsLoading(false);
        return;
    }


    //get the current objectives array from the topic
    var currentObjectives = topicData.data()?.objectives;
    if (!currentObjectives) {
        //create new array
        currentObjectives = [];
    }

    //add the new objective to the array
    currentObjectives.push({...objective, createdAt: Timestamp.now()});

    //update the topic with the new array
    try {
      await setDoc(topicDoc, { objectives: currentObjectives }, { merge: true });
      toast({
        title: "Objective created",
        description: "Objective added successfully!",
      });
    } catch (error : any) {
      //TODO use toast
      console.log(error)
    }

    //reset objective
    setObjective({
        text: "",
        chapter: "",
        type: "",
    });

    setIsLoading(false);
  }

    const handleObjectiveDelete = async (index: number) => {
        var currentObjectives = topicData.data()?.objectives;
        currentObjectives.splice(index, 1);
        try {
            await setDoc(topicDoc, { objectives: currentObjectives }, { merge: true });
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
                <Link href="/admin">
                    <Button>Back</Button>
                </Link>
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
                    {(topicData.data().objectives === null || topicData.data().objectives === undefined || topicData.data().objectives?.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={3}>No objectives found</TableCell>
                      </TableRow>
                    )
                    :
                    topicData.data().objectives?.map((objective: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{objective.type}</TableCell>
                          <TableCell>{objective.text}</TableCell>
                          <TableCell>{objective.chapter ? objective.chapter : ""}</TableCell>
                          <TableCell className="hover:cursor-pointer hover:bg-red-500" onClick={() => handleObjectiveDelete(index)}>Delete</TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        <Card className="col-span-3">
        <CardHeader>
            <CardTitle className="pb-2">Objective Creator</CardTitle>
            <CardDescription>{topicData.data()?.topicName}</CardDescription>
        </CardHeader>
        <CardContent className="flex-col gap-10">
        <form onSubmit={handleSubmit}>
        <fieldset disabled={isLoading} className="space-y-4">

            {/* Type of objective */}
            <Select 
            onValueChange={(v) => setObjective({...objective, type: v})}
            value={objective.type}
            >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Objective Type" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                <SelectItem value="Reading">Reading</SelectItem>
                <SelectItem value="Skills">Skills</SelectItem>
                    <SelectItem value="Experience">Experience</SelectItem>
                </SelectGroup>
            </SelectContent>
            </Select>

            {/* Chapter of reading */}
            {objective.type === "Reading" && (
            <Input 
            placeholder="Chapter" 
            onChange={(e) => setObjective({...objective, chapter: e.target.value})}
            value={objective.chapter}
            />
            )}

            {/* objective text */}
            <Textarea 
            placeholder="Objective" 
            onChange={(e) => setObjective({...objective, text: e.target.value})}
            value={objective.text}
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