'use client';

import * as React from "react";
import { FC, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, useFirestore } from "reactfire";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "../ui/textarea";
import { Timestamp, addDoc, collection } from "firebase/firestore";
import { useUserStore } from "@/lib/store";


interface QuestionFormProps {
  topicId: string;
}

export const CreateTFQuestionForm: FC<QuestionFormProps> = (props) => {
  const firestore = useFirestore();
  const questionsCollection = collection(firestore, "questions");
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState({
    questionText: "",
    questionType: "True/False",
    answer: true,
    reference: "",
    explanation: "",
    topicId: props.topicId ? props.topicId : "unknownTopicId",
  });
  const userRole = useUserStore((state) => state.role);

  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (auth.currentUser === null) {
      toast({
        title: "You need to be logged in to create a question",
      })
      setIsLoading(false);
      return;
    }

    if (userRole !== 'admin' && userRole !== 'fellow') {
      toast({
        title: "You do not have permission to create questions",
      })
      return;
    }

    //upload question to firestore "questions" collection with auto generated id
    try {
      const newQuestionRef = await addDoc(questionsCollection, {
        ...question,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName ? auth.currentUser.displayName : "unknown",
        createdAt: Timestamp.now(),
      });
      toast({
        title: "Question created",
        description: `Question created successfully! ID: ${newQuestionRef.id}`,
      });

    } catch (error : any) {
      //TODO use toast
      console.log(error)
    }

    //reset question
    setQuestion({
      questionText: "",
      questionType: "True/False",
      answer: false,
      reference: "",
      explanation: "",
      topicId: props.topicId ? props.topicId : "unknownTopicId",
    });

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isLoading} className="space-y-4">
        <label>Question</label>
        <div className="flex items-center gap-1">
            <Textarea
              placeholder="Question text..."
              value={question.questionText}
              onChange={(e) => setQuestion({ ...question, questionText: e.target.value })}
            />
        </div>
        <RadioGroup 
          defaultValue="true" 
          className="flex"
          onValueChange={(e) => setQuestion({ ...question, answer: e === "true" ? true : false})}
        >
          <div className="flex gap-1">
          <RadioGroupItem value="true" />
          <Label>True</Label>
          </div>
          <div className="flex gap-1">
          <RadioGroupItem value="false" />
          <Label>False</Label>
          </div>
        </RadioGroup>
        <div className="w-full">
          <label>Explanation</label>
          <Textarea
            placeholder="Explanation for the correct answer..."
            className=""
            value={question.explanation}
            onChange={(e) => setQuestion({ ...question, explanation: e.target.value })}
          />
        </div>
        <div className="w-full">
          <label>Reference</label>
          <Input
            className="grow"
            type="text"
            value={question.reference}
            onChange={(e) => setQuestion({ ...question, reference: e.target.value })}
          />
        </div>
        <Button type="submit">Create Question</Button>
      </fieldset>
    </form>
  );
};
