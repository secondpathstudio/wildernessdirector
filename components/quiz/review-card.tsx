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
import { TopicProgress, completedObjectiveCount } from "@/lib/progress";
import { useUserStore } from "@/lib/store";
import { QuizRunner } from "./quiz-runner";

const DECK_SIZE = 10;
// attempts saved from review decks carry this sentinel instead of a topic id,
// so per-topic stats never pick them up but miss-tracking still does
export const REVIEW_TOPIC_SENTINEL = "review";

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Only fellows/admins may query the shared approved-question bank (rules
// enforce it), so don't mount the deck at all for other roles — a free user
// or a stale token would otherwise hit permission-denied on the dashboard.
export const ReviewCard: FC = () => {
  const userRole = useUserStore((state) => state.role);
  if (userRole !== 'fellow' && userRole !== 'admin') {
    return null;
  }
  return <ReviewDeck />;
};

const ReviewDeck: FC = () => {
  const auth = useAuth();
  const firestore = useFirestore();
  const uid = auth.currentUser?.uid ?? "anonymous";

  // every attempt (topic quizzes, practice, and past review decks)
  const { data: attempts } = useFirestoreCollectionData(
    collection(firestore, `users/${uid}/quizAttempts`),
    { idField: 'id' },
  );

  // the whole approved bank; rules require the approved filter
  const bankQuery = query(collection(firestore, "questions"), where('approved', '==', true));
  const { status: bankStatus, data: bank } = useFirestoreCollectionData(bankQuery, { idField: 'id' });

  const { data: progressDocs } = useFirestoreCollectionData(
    collection(firestore, `users/${uid}/progress`),
    { idField: 'id' },
  );
  const { data: topics } = useFirestoreCollectionData(
    collection(firestore, "topics"),
    { idField: 'id' },
  );

  // latest result per question, across all attempts in time order
  const latestByQuestion = new Map<string, { correct: boolean; at: number }>();
  [...(attempts ?? [])]
    .sort((a: any, b: any) => a.completedAt?.seconds - b.completedAt?.seconds)
    .forEach((attempt: any) => {
      attempt.responses?.forEach((response: any) => {
        latestByQuestion.set(response.questionId, {
          correct: response.correct,
          at: attempt.completedAt?.seconds ?? 0,
        });
      });
    });

  // topics the fellow has fully completed — the pool for unseen questions
  const objectiveCountByTopic = new Map(topics?.map((topic: any) => [topic.id, topic.objectiveCount]) ?? []);
  const completedTopicIds = new Set(
    (progressDocs ?? [])
      .filter((progress: any) => {
        const total = objectiveCountByTopic.get(progress.id);
        return total > 0 && completedObjectiveCount(progress as TopicProgress) >= total;
      })
      .map((progress: any) => progress.id)
  );

  // deck priority: latest-miss > never-seen from completed topics > longest-ago correct
  const missed = (bank ?? []).filter(
    (question: any) => latestByQuestion.get(question.id)?.correct === false
  );
  const unseen = (bank ?? []).filter(
    (question: any) => !latestByQuestion.has(question.id) && completedTopicIds.has(question.topicId)
  );
  const staleCorrect = (bank ?? [])
    .filter((question: any) => latestByQuestion.get(question.id)?.correct === true)
    .sort((a: any, b: any) => latestByQuestion.get(a.id)!.at - latestByQuestion.get(b.id)!.at);

  const deck = [...shuffle(missed), ...shuffle(unseen), ...staleCorrect].slice(0, DECK_SIZE);

  const [session, setSession] = useState(0);
  const [deckOpen, setDeckOpen] = useState(false);
  // freeze the deck when the quiz starts so live updates don't reshuffle mid-run
  const [activeDeck, setActiveDeck] = useState<any[]>([]);

  const startReview = () => {
    setActiveDeck(deck);
    setSession(session + 1);
    setDeckOpen(true);
  };

  if (bankStatus !== "success" || deck.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Spaced Review</CardTitle>
          <CardDescription>
            {missed.length > 0
              ? `${missed.length} question${missed.length === 1 ? "" : "s"} you missed recently`
              : "Keep past topics fresh"}
            {" · "}{deck.length} in today&apos;s deck
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={startReview}>Start Review</Button>
        </CardContent>
      </Card>

      <Dialog open={deckOpen} onOpenChange={setDeckOpen}>
        <DialogContent className="sm:max-w-[550px] w-11/12 rounded-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Spaced Review</DialogTitle>
          </DialogHeader>
          {deckOpen && (
            <QuizRunner
              key={session}
              topicId={REVIEW_TOPIC_SENTINEL}
              questions={activeDeck}
              onClose={() => setDeckOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
