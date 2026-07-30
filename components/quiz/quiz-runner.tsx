'use client';
import { FC, useState } from "react";
import { useAuth, useFirestore } from "reactfire";
import { Timestamp, addDoc, collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuizRunnerProps {
  topicId: string;
  // approved questions for this topic, already fetched by the parent
  questions: any[];
  // set when running an admin-created quiz; stamped onto the saved attempt
  quizId?: string;
  onClose: () => void;
}

interface QuizResponse {
  questionId: string;
  correct: boolean;
}

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const isChoiceCorrect = (question: any, choice: number | boolean): boolean => {
  if (question.questionType === 'Multiple Choice') {
    return question.answers[choice as number]?.correct === true;
  }
  return question.answer === choice;
};

export const QuizRunner: FC<QuizRunnerProps> = (props) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const [order] = useState<any[]>(() => shuffle(props.questions));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | boolean | null>(null);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [saved, setSaved] = useState(false);

  const question = order[index];
  const finished = index >= order.length;
  const correctCount = responses.filter((response) => response.correct).length;

  const handleAnswer = (choice: number | boolean) => {
    if (selected !== null) {
      return; // already answered — waiting on Next
    }
    setSelected(choice);
    setResponses([
      ...responses,
      { questionId: question.id, correct: isChoiceCorrect(question, choice) },
    ]);
  };

  const handleNext = async () => {
    const nextIndex = index + 1;
    setSelected(null);
    setIndex(nextIndex);
    if (nextIndex >= order.length) {
      await saveAttempt();
    }
  };

  const saveAttempt = async () => {
    const uid = auth.currentUser?.uid;
    if (uid === undefined || saved) {
      return;
    }
    try {
      await addDoc(collection(firestore, `users/${uid}/quizAttempts`), {
        userId: uid,
        topicId: props.topicId,
        ...(props.quizId ? { quizId: props.quizId } : {}),
        total: order.length,
        correct: responses.filter((response) => response.correct).length,
        responses,
        completedAt: Timestamp.now(),
      });
      setSaved(true);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed to save quiz result", description: `${error}` });
    }
  };

  if (finished) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Score: {correctCount} / {order.length}
        </h3>
        <ul className="space-y-1 max-h-60 overflow-y-auto">
          {order.map((q, i) => (
            <li key={q.id} className="flex items-start gap-2 text-sm">
              {responses[i]?.correct
                ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                : <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />}
              <span>{q.questionText}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Button onClick={props.onClose}>Done</Button>
        </div>
      </div>
    );
  }

  const answered = selected !== null;
  const wasCorrect = answered && isChoiceCorrect(question, selected!);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Question {index + 1} of {order.length}
      </p>
      <p className="font-medium">{question.questionText}</p>

      {question.questionType === 'Multiple Choice' && (
        <div className="space-y-2">
          {question.answers.map((answer: any, i: number) => {
            const highlight = answered
              ? answer.correct
                ? "border-green-600 bg-green-600/10"
                : selected === i
                  ? "border-red-600 bg-red-600/10"
                  : "opacity-60"
              : "hover:bg-accent/10";
            return (
              <button
                key={i}
                type="button"
                className={`w-full text-left border rounded-md px-3 py-2 text-sm ${highlight}`}
                onClick={() => handleAnswer(i)}
              >
                {answer.text}
              </button>
            );
          })}
        </div>
      )}

      {question.questionType === 'True/False' && (
        <div className="flex gap-2">
          {[true, false].map((value) => {
            const label = value ? "True" : "False";
            const highlight = answered
              ? question.answer === value
                ? "border-green-600 bg-green-600/10"
                : selected === value
                  ? "border-red-600 bg-red-600/10"
                  : "opacity-60"
              : "hover:bg-accent/10";
            return (
              <button
                key={label}
                type="button"
                className={`flex-1 border rounded-md px-3 py-2 text-sm ${highlight}`}
                onClick={() => handleAnswer(value)}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {answered && (
        <div className="space-y-2 rounded-md border p-3">
          <p className="text-sm font-semibold">
            {wasCorrect ? "Correct ✅" : "Incorrect ❌"}
          </p>
          <p className="text-sm">{question.explanation}</p>
          {question.reference && (
            <p className="text-xs text-muted-foreground">Reference: {question.reference}</p>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!answered}>
          {index + 1 >= order.length ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
};
