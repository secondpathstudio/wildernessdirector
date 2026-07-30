'use client';
import { FC, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, query, where } from "firebase/firestore";
import { QuizRunner } from "./quiz-runner";

interface PracticeQuizCardProps {
  topicId: string;
  topicName: string;
}

export const PracticeQuizCard: FC<PracticeQuizCardProps> = (props) => {
  const auth = useAuth();
  const firestore = useFirestore();
  // The shared bank: approved questions from every author. The approved
  // filter is required by the security rules, not just preference.
  const bankQuery = query(
    collection(firestore, "questions"),
    where('topicId', '==', props.topicId),
    where('approved', '==', true),
  );
  const { status, data: bank } = useFirestoreCollectionData(bankQuery, { idField: 'id' });

  const uid = auth.currentUser?.uid ?? "anonymous";
  const attemptsQuery = query(
    collection(firestore, `users/${uid}/quizAttempts`),
    where('topicId', '==', props.topicId),
  );
  const { data: attempts } = useFirestoreCollectionData(attemptsQuery, { idField: 'id' });
  const sortedAttempts = [...(attempts ?? [])]
    .sort((a: any, b: any) => b.completedAt?.seconds - a.completedAt?.seconds);
  const bestScore = sortedAttempts.reduce(
    (best: number | null, attempt: any) =>
      best === null ? attempt.correct / attempt.total : Math.max(best, attempt.correct / attempt.total),
    null as number | null,
  );

  // increments each time a quiz starts so QuizRunner remounts with a fresh shuffle
  const [session, setSession] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);

  const startQuiz = () => {
    setSession(session + 1);
    setQuizOpen(true);
  };

  return (
    <>
      <Card className="lg:col-span-6 md:col-span-2 col-span-1">
        <CardHeader>
          <CardTitle>Practice Quiz</CardTitle>
          <CardDescription>
            {status === "success"
              ? `${bank.length} approved question${bank.length === 1 ? "" : "s"} in the ${props.topicName} bank`
              : "Loading question bank..."}
            {sortedAttempts.length > 0 && bestScore !== null && (
              <> · {sortedAttempts.length} attempt{sortedAttempts.length === 1 ? "" : "s"}, best {Math.round(bestScore * 100)}%</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={startQuiz} disabled={status !== "success" || bank.length === 0}>
            {sortedAttempts.length > 0 ? "Retake Quiz" : "Start Quiz"}
          </Button>
          {status === "success" && bank.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              No approved questions yet — the quiz opens once questions clear review.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="sm:max-w-[550px] w-11/12 rounded-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{props.topicName} Quiz</DialogTitle>
          </DialogHeader>
          {quizOpen && status === "success" && (
            <QuizRunner
              key={session}
              topicId={props.topicId}
              questions={bank}
              onClose={() => setQuizOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
