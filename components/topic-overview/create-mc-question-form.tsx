'use client';

import * as React from "react";
import { FC, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, useFirestore } from "reactfire";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Timestamp, addDoc, collection } from "firebase/firestore";

interface QuestionFormProps {
  topicId: string;
}

export const CreateMCQuestionForm: FC<QuestionFormProps> = (props) => {
  const firestore = useFirestore();
  const questionsCollection = collection(firestore, "questions");
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState({
    questionText: "",
    questionType: "Multiple Choice",
    answers: [
      { text: "", correct: false },
      { text: "", correct: false },
      { text: "", correct: false },
      { text: "", correct: false },
    ],
    reference: "",
    explanation: "",
    topicId: props.topicId ? props.topicId : "unknownTopicId",
  
  })

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

    //upload question to firestore "questions" collection with auto generated id
    try {
      const newQuestionRef = await addDoc(questionsCollection, {
        ...question,
        authorId: auth.currentUser.uid,
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
      questionType: "Multiple Choice",
      answers: [
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
      ],
      reference: "",
      explanation: "",
      topicId: props.topicId ? props.topicId : "unknownTopicId",
    });

    setIsLoading(false);
  }

  const updateAnswerText = (index: number, text: string) => {
    const newAnswers = [...question.answers];
    newAnswers[index].text = text;
    setQuestion({ ...question, answers: newAnswers });
  }

  const updateAnswerValue = (index: number, correct: boolean) => {
    const newAnswers = [...question.answers];
    newAnswers[index].correct = correct;
    setQuestion({ ...question, answers: newAnswers });
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isLoading} className="space-y-4">
        <div>
          <label>Multiple Choice Question</label>
          <Textarea
            placeholder="Write a new multiple choice question..."
            className=""
            value={question.questionText}
            onChange={(e) => setQuestion({ ...question, questionText: e.target.value })}
          />
        </div>

        {Array.from({ length: 4 }).map((_, i) => (
          <div className="flex gap-1" key={i}>
            <div className="w-full">
              <label>Answer {i+1}</label>
              <div className="flex items-center gap-1">
                <Input
                  className="grow"
                  type="text"
                  value={question.answers[i].text}
                  onChange={(e) => updateAnswerText(i, e.target.value)}
                />
                <Checkbox
                checked={question.answers[i].correct}
                onCheckedChange={(e) => updateAnswerValue(i, e as boolean)}
              />
              </div>
            </div>
          </div>
        ))}

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