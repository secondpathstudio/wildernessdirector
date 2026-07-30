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
import { Timestamp, addDoc, collection, deleteField, doc, updateDoc } from "firebase/firestore";
import { useUserStore } from "@/lib/store";

interface QuestionFormProps {
  topicId: string;
  // when set, the form edits this question in place instead of creating a new one
  existingQuestion?: any;
  onSaved?: () => void;
}

export const CreateTFQuestionForm: FC<QuestionFormProps> = (props) => {
  const firestore = useFirestore();
  const questionsCollection = collection(firestore, "questions");
  const [isLoading, setIsLoading] = useState(false);
  const existing = props.existingQuestion;
  const [questionText, setQuestionText] = useState<string>(existing?.questionText ?? "");
  const [answer, setAnswer] = useState<boolean>(existing?.answer ?? true);
  const [explanation, setExplanation] = useState<string>(existing?.explanation ?? "");
  const [reference, setReference] = useState<string>(existing?.reference ?? "");
  const userRole = useUserStore((state) => state.role);
  const auth = useAuth();

  const resetForm = () => {
    setQuestionText("");
    setAnswer(true);
    setExplanation("");
    setReference("");
  };

  const validate = (): string | null => {
    if (questionText.trim() === "") {
      return "Write the question text.";
    }
    if (explanation.trim() === "") {
      return "Add an explanation for the correct answer.";
    }
    if (reference.trim() === "") {
      return "Add a reference.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin' && userRole !== 'fellow') {
      toast({ title: "You do not have permission to create questions" });
      return;
    }
    if (auth.currentUser === null) {
      toast({ title: "You need to be logged in to create a question" });
      return;
    }

    const problem = validate();
    if (problem !== null) {
      toast({ title: "Question incomplete", description: problem });
      return;
    }

    setIsLoading(true);
    try {
      if (existing) {
        // editing clears any revision request so the question returns to review
        await updateDoc(doc(questionsCollection, existing.id), {
          questionText: questionText.trim(),
          answer: answer,
          explanation: explanation.trim(),
          reference: reference.trim(),
          reviewComment: deleteField(),
          updatedAt: Timestamp.now(),
        });
        toast({ title: "Question updated" });
        props.onSaved?.();
      } else {
        await addDoc(questionsCollection, {
          questionText: questionText.trim(),
          questionType: "True/False",
          answer: answer,
          explanation: explanation.trim(),
          reference: reference.trim(),
          topicId: props.topicId ? props.topicId : "unknownTopicId",
          approved: false,
          authorId: auth.currentUser.uid,
          authorName: auth.currentUser.displayName ? auth.currentUser.displayName : "unknown",
          createdAt: Timestamp.now(),
        });
        toast({
          title: "Question submitted",
          description: "It will count toward your total once an admin approves it.",
        });
        resetForm();
      }
    } catch (error: any) {
      console.error(error);
      // keep the form contents so nothing is lost
      toast({ title: "Failed to save question", description: `${error}` });
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isLoading} className="space-y-4">
        <label>Question</label>
        <div className="flex items-center gap-1">
            <Textarea
              placeholder="Question text..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
        </div>
        <RadioGroup
          value={answer ? "true" : "false"}
          className="flex"
          onValueChange={(v) => setAnswer(v === "true")}
        >
          <div className="flex gap-1">
          <RadioGroupItem value="true" id="tf-true" />
          <Label htmlFor="tf-true">True</Label>
          </div>
          <div className="flex gap-1">
          <RadioGroupItem value="false" id="tf-false" />
          <Label htmlFor="tf-false">False</Label>
          </div>
        </RadioGroup>
        <div className="w-full">
          <label>Explanation</label>
          <Textarea
            placeholder="Explanation for the correct answer..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
        </div>
        <div className="w-full">
          <label>Reference</label>
          <Input
            className="grow"
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
        <Button type="submit">{existing ? "Save Changes" : "Create Question"}</Button>
      </fieldset>
    </form>
  );
};
