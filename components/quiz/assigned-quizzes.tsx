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
import { toast } from "@/components/ui/use-toast";
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, doc, getDoc, query, where } from "firebase/firestore";
import { useUserStore } from "@/lib/store";
import { QuizRunner } from "./quiz-runner";

interface AssignedQuizzesProps {
  topicId: string;
}

// Question fetches and attempt writes require the fellow/admin claim.
export const AssignedQuizzes: FC<AssignedQuizzesProps> = (props) => {
  const userRole = useUserStore((state) => state.role);
  if (userRole !== 'fellow' && userRole !== 'admin') {
    return null;
  }
  return <AssignedQuizList {...props} />;
};

const AssignedQuizList: FC<AssignedQuizzesProps> = (props) => {
  const auth = useAuth();
  const firestore = useFirestore();

  const quizzesQuery = query(
    collection(firestore, "quizzes"),
    where('topicId', '==', props.topicId),
  );
  const { status, data: quizzes } = useFirestoreCollectionData(quizzesQuery, { idField: 'id' });

  const uid = auth.currentUser?.uid ?? "anonymous";
  const attemptsQuery = query(
    collection(firestore, `users/${uid}/quizAttempts`),
    where('topicId', '==', props.topicId),
  );
  const { data: attempts } = useFirestoreCollectionData(attemptsQuery, { idField: 'id' });

  // the quiz currently being taken, with its resolved questions
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<any[]>([]);
  const [loadingQuizId, setLoadingQuizId] = useState<string | null>(null);
  const [session, setSession] = useState(0);

  const startQuiz = async (quiz: any) => {
    setLoadingQuizId(quiz.id);
    try {
      // per-doc gets pass the approved-questions read rule; deleted or
      // unapproved questions resolve to null and are dropped
      const snaps = await Promise.all(
        (quiz.questionIds ?? []).map((questionId: string) =>
          getDoc(doc(firestore, "questions", questionId)).catch(() => null)
        )
      );
      const questions = snaps
        .filter((snap: any) => snap !== null && snap.exists() && snap.data().approved === true)
        .map((snap: any) => ({ id: snap.id, ...snap.data() }));

      if (questions.length === 0) {
        toast({
          title: "Quiz unavailable",
          description: "None of this quiz's questions are currently available.",
        });
        return;
      }
      setActiveQuestions(questions);
      setSession(session + 1);
      setActiveQuiz(quiz);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed to load quiz", description: `${error}` });
    } finally {
      setLoadingQuizId(null);
    }
  };

  if (status !== "success" || quizzes.length === 0) {
    return null;
  }

  return (
    <>
      {quizzes.map((quiz: any) => {
        const quizAttempts = (attempts ?? []).filter((attempt: any) => attempt.quizId === quiz.id);
        const bestScore = quizAttempts.reduce(
          (best: number | null, attempt: any) =>
            best === null ? attempt.correct / attempt.total : Math.max(best, attempt.correct / attempt.total),
          null as number | null,
        );
        return (
          <Card key={quiz.id} className="lg:col-span-6 md:col-span-2 col-span-1">
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription>
                Assigned quiz · {quiz.questionIds?.length ?? 0} questions
                {quizAttempts.length > 0 && bestScore !== null && (
                  <> · {quizAttempts.length} attempt{quizAttempts.length === 1 ? "" : "s"}, best {Math.round(bestScore * 100)}%</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => startQuiz(quiz)}
                disabled={loadingQuizId !== null}
              >
                {loadingQuizId === quiz.id
                  ? "Loading..."
                  : quizAttempts.length > 0 ? "Retake Quiz" : "Start Quiz"}
              </Button>
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={activeQuiz !== null} onOpenChange={(open) => !open && setActiveQuiz(null)}>
        <DialogContent className="sm:max-w-[550px] w-11/12 rounded-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activeQuiz?.title}</DialogTitle>
          </DialogHeader>
          {activeQuiz && (
            <QuizRunner
              key={session}
              topicId={props.topicId}
              quizId={activeQuiz.id}
              questions={activeQuestions}
              onClose={() => setActiveQuiz(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
