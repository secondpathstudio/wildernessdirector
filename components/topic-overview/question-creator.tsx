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
import { Form } from "../ui/form";
import { CreateMCQuestionForm, CreateQuestionForm }  from "./create-mc-question-form";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CreateTFQuestionForm } from "./create-tf-question-form";

export const QuestionCreator: FC = () => {

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Questions</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">{/* <Overview /> */}</CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="pb-2">Question Creator</CardTitle>
                <CardContent>
                  <Tabs defaultValue="mc">
                    <TabsList>
                      <TabsTrigger value={"mc"}>Multiple Choice</TabsTrigger>
                      <TabsTrigger value={"tf"}>True/False</TabsTrigger>
                    </TabsList>
                    <TabsContent value={"mc"}>
                      <CreateMCQuestionForm />
                    </TabsContent>
                    <TabsContent value={"tf"}>
                      <CreateTFQuestionForm />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </CardHeader>
            </Card>
          </div>
        </div>
    </>
  );
};
