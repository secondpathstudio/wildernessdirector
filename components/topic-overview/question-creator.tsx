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
import { CreateMCQuestionForm }  from "./create-mc-question-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CreateTFQuestionForm } from "./create-tf-question-form";

interface QuestionCreatorProps {
    topicId: string;
}

export const QuestionCreator: FC<QuestionCreatorProps> = (props) => {

  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle className="pb-2">Question Creator</CardTitle>
        <CardContent>
          <Tabs defaultValue="mc">
            <TabsList>
              <TabsTrigger value={"mc"}>Multiple Choice</TabsTrigger>
              <TabsTrigger value={"tf"}>True/False</TabsTrigger>
            </TabsList>
            <TabsContent value={"mc"}>
              <CreateMCQuestionForm topicId={props.topicId} />
            </TabsContent>
            <TabsContent value={"tf"}>
              <CreateTFQuestionForm topicId={props.topicId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </CardHeader>
    </Card>
  );
};
