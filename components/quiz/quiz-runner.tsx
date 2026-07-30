'use client';
import { FC, useState } from "react";
import { useAuth, useFirestore } from "reactfire";
import { Timestamp, addDoc, collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface QuizRunnerProps {
  topicId: string;
  // approved questions for this topic, already fetched by the parent
  questions: any[];
  // set when running an admin-created quiz; stamped onto the saved attempt
  quizId?: string;
  // reports whether there are unsubmitted answers (for close confirmation)
  onDirtyChange?: (dirty: boolean) => void;
  onClose: () => void;
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
  // one slot per question; null = not answered yet
  const [answers, setAnswers] = useState<(number | boolean | null)[]>(
    () => Array(props.questions.length).fill(null)
  );
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const question = order[index];
  const answeredCount = answers.filter((answer) => answer !== null).length;
  const allAnswered = answeredCount === order.length;
  const correctCount = order.filter(
    (q, i) => answers[i] !== null && isChoiceCorrect(q, answers[i]!)
  ).length;

  const selectAnswer = (choice: number | boolean) => {
    if (submitted) {
      return;
    }
    const next = [...answers];
    next[index] = choice;
    setAnswers(next);
    props.onDirtyChange?.(true);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setIndex(0);
    props.onDirtyChange?.(false);

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
        correct: order.filter((q, i) => answers[i] !== null && isChoiceCorrect(q, answers[i]!)).length,
        responses: order.map((q, i) => ({
          questionId: q.id,
          correct: answers[i] !== null && isChoiceCorrect(q, answers[i]!),
        })),
        completedAt: Timestamp.now(),
      });
      setSaved(true);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed to save quiz result", description: `${error}` });
    }
  };

  const pillClass = (i: number) => {
    const base = "h-7 w-7 rounded-full text-xs font-medium border transition-colors";
    const current = i === index ? " ring-2 ring-primary ring-offset-1" : "";
    if (submitted) {
      const correct = answers[i] !== null && isChoiceCorrect(order[i], answers[i]!);
      return `${base}${current} ${correct
        ? "border-green-600 bg-green-600/15 text-green-700"
        : "border-red-600 bg-red-600/15 text-red-700"}`;
    }
    return `${base}${current} ${answers[i] !== null
      ? "bg-primary text-background border-primary"
      : "text-muted-foreground"}`;
  };

  const selected = answers[index];

  const choiceClass = (isThisChoice: boolean, isCorrectChoice: boolean) => {
    if (submitted) {
      if (isCorrectChoice) return "border-green-600 bg-green-600/10";
      if (isThisChoice) return "border-red-600 bg-red-600/10";
      return "opacity-60";
    }
    return isThisChoice
      ? "border-primary bg-primary/10"
      : "hover:bg-accent/10";
  };

  return (
    <div className="space-y-4">
      {/* navigator: arrows + per-question answered/result map */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
          aria-label="Previous question"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 flex-wrap justify-center gap-1.5">
          {order.map((_, i) => (
            <button
              key={i}
              type="button"
              className={pillClass(i)}
              onClick={() => setIndex(i)}
              aria-label={`Question ${i + 1}${answers[i] !== null ? " (answered)" : ""}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={index === order.length - 1}
          onClick={() => setIndex(index + 1)}
          aria-label="Next question"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {submitted && (
        <p className="text-center font-semibold">
          Score: {correctCount} / {order.length}
        </p>
      )}

      <p className="font-medium">{question.questionText}</p>

      {question.questionType === 'Multiple Choice' && (
        <div className="space-y-2">
          {question.answers.map((answer: any, i: number) => (
            <button
              key={i}
              type="button"
              className={`w-full text-left border rounded-md px-3 py-2 text-sm ${choiceClass(selected === i, answer.correct === true)}`}
              onClick={() => selectAnswer(i)}
            >
              {answer.text}
            </button>
          ))}
        </div>
      )}

      {question.questionType === 'True/False' && (
        <div className="flex gap-2">
          {[true, false].map((value) => (
            <button
              key={String(value)}
              type="button"
              className={`flex-1 border rounded-md px-3 py-2 text-sm ${choiceClass(selected === value, question.answer === value)}`}
              onClick={() => selectAnswer(value)}
            >
              {value ? "True" : "False"}
            </button>
          ))}
        </div>
      )}

      {submitted && (
        <div className="space-y-2 rounded-md border p-3">
          <p className="text-sm font-semibold">
            {selected !== null && isChoiceCorrect(question, selected)
              ? "Correct ✅"
              : "Incorrect ❌"}
          </p>
          <p className="text-sm">{question.explanation}</p>
          {question.reference && (
            <p className="text-xs text-muted-foreground">Reference: {question.reference}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {submitted
            ? `Question ${index + 1} of ${order.length}`
            : `${answeredCount} of ${order.length} answered`}
        </p>
        {submitted ? (
          <Button onClick={props.onClose}>Done</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!allAnswered}>
            Submit Quiz
          </Button>
        )}
      </div>
    </div>
  );
};
