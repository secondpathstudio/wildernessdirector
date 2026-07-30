'use client';

import * as React from "react";
import { FC, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, useFirestore } from "reactfire";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Timestamp, addDoc, collection, deleteField, doc, updateDoc } from "firebase/firestore";
import { useUserStore } from "@/lib/store";

interface QuestionFormProps {
  topicId: string;
  // when set, the form edits this question in place instead of creating a new one
  existingQuestion?: any;
  onSaved?: () => void;
}

const ANSWER_SLOTS = 4;

const answersFromExisting = (existing: any): string[] => {
  const texts = existing?.answers?.map((answer: any) => answer.text) ?? [];
  while (texts.length < ANSWER_SLOTS) {
    texts.push("");
  }
  return texts.slice(0, ANSWER_SLOTS);
};

export const CreateMCQuestionForm: FC<QuestionFormProps> = (props) => {
  const firestore = useFirestore();
  const questionsCollection = collection(firestore, "questions");
  const [isLoading, setIsLoading] = useState(false);
  const existing = props.existingQuestion;
  const [questionText, setQuestionText] = useState<string>(existing?.questionText ?? "");
  const [answers, setAnswers] = useState<string[]>(answersFromExisting(existing));
  const [correctIndex, setCorrectIndex] = useState<number>(
    existing?.answers?.findIndex((answer: any) => answer.correct) ?? -1
  );
  const [explanation, setExplanation] = useState<string>(existing?.explanation ?? "");
  const [reference, setReference] = useState<string>(existing?.reference ?? "");
  const userRole = useUserStore((state) => state.role);
  const auth = useAuth();

  const resetForm = () => {
    setQuestionText("");
    setAnswers(Array(ANSWER_SLOTS).fill(""));
    setCorrectIndex(-1);
    setExplanation("");
    setReference("");
  };

  const validate = (): string | null => {
    if (questionText.trim() === "") {
      return "Write the question text.";
    }
    const filled = answers.filter((answer) => answer.trim() !== "");
    if (filled.length < 2) {
      return "Fill in at least two answer choices.";
    }
    if (correctIndex < 0 || answers[correctIndex]?.trim() === "") {
      return "Mark one answer choice as correct.";
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

    // drop empty slots, keeping the correct flag with its answer
    const payloadAnswers = answers
      .map((text, i) => ({ text: text.trim(), correct: i === correctIndex }))
      .filter((answer) => answer.text !== "");

    setIsLoading(true);
    try {
      if (existing) {
        // editing clears any revision request so the question returns to review
        await updateDoc(doc(questionsCollection, existing.id), {
          questionText: questionText.trim(),
          answers: payloadAnswers,
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
          questionType: "Multiple Choice",
          answers: payloadAnswers,
          explanation: explanation.trim(),
          reference: reference.trim(),
          topicId: props.topicId ? props.topicId : "unknownTopicId",
          approved: false,
          authorId: auth.currentUser.uid,
          authorName: auth.currentUser.displayName || auth.currentUser.email || "unknown",
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

  const updateAnswerText = (index: number, text: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = text;
    setAnswers(newAnswers);
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isLoading} className="space-y-4">
        <div>
          <label>Multiple Choice Question</label>
          <Textarea
            placeholder="Write a new multiple choice question..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
        </div>

        <RadioGroup
          value={correctIndex >= 0 ? String(correctIndex) : undefined}
          onValueChange={(v) => setCorrectIndex(Number(v))}
          className="space-y-2"
        >
          {answers.map((answer, i) => (
            <div className="w-full" key={i}>
              <label>Answer {i + 1}</label>
              <div className="flex items-center gap-2">
                <Input
                  className="grow"
                  type="text"
                  value={answer}
                  onChange={(e) => updateAnswerText(i, e.target.value)}
                />
                <RadioGroupItem
                  value={String(i)}
                  aria-label={`Answer ${i + 1} is correct`}
                />
              </div>
            </div>
          ))}
        </RadioGroup>
        <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer.</p>

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
