'use client';

import { FC, useEffect, useState } from "react";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { useAuth, useFirestore, useFirestoreCollection, useFirestoreDoc } from "reactfire";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { TopicButton } from "../ui/topic-button";
import { Button } from "../ui/button";
import { TopicProgress, completedObjectiveCount } from "@/lib/progress";
import { sortTopicsByOrder } from "@/lib/topic-order";
import { ReviewCard } from "../quiz/review-card";

export const Dashboard: FC = () => {
  const [currentTopic, setCurrentTopic] = useState(0);
  const firestore = useFirestore();
  const auth = useAuth();
  const uid = auth.currentUser?.uid ?? "anonymous";
  const topicsCollection = collection(firestore, "topics");
  // sortTopicsByOrder expects canonical topicNumber-asc input.
  const topicsQuery = query(topicsCollection, orderBy('topicNumber', 'asc'));
  const { status, data: topics } = useFirestoreCollection(topicsQuery, {
    idField: 'id'
  });
  const userDoc = doc(firestore, `users/${uid}`)
  const { status: userStatus, data: userData } = useFirestoreDoc(userDoc, {
    idField: 'id'
  });
  // Admin-controlled flag on the user doc; missing means gated.
  const curriculumGated = userData?.data()?.curriculumGated !== false;
  // Admin-controlled per-fellow ordering; missing means canonical order.
  const topicOrder = userData?.data()?.topicOrder;
  const orderedTopics = topics ? sortTopicsByOrder(topics.docs, topicOrder) : [];

  // One progress doc per topic, keyed by topicId, owned by this user.
  const progressCollection = collection(firestore, `users/${uid}/progress`);
  const { data: progressDocs } = useFirestoreCollection(progressCollection);
  const completedByTopic = new Map<string, number>();
  progressDocs?.docs.forEach((progressDoc) => {
    completedByTopic.set(progressDoc.id, completedObjectiveCount(progressDoc.data() as TopicProgress));
  });

  useEffect(() => {
    // current topic = first topic in the fellow's order that isn't fully
    // complete, so the pointer stays sane after a mid-year reorder
    if (status === 'success' && topics.docs.length > 0) {
      const ordered = sortTopicsByOrder(topics.docs, userData?.data()?.topicOrder);
      var topicToSet = ordered.length;
      for (let i = 0; i < ordered.length; i++) {
        const progressDoc = progressDocs?.docs
          .find((progressDoc) => progressDoc.id === ordered[i].id);
        const completed = progressDoc === undefined
          ? 0
          : completedObjectiveCount(progressDoc.data() as TopicProgress);
        if (completed / ordered[i].data().objectiveCount < 1) {
          topicToSet = i;
          break;
        }
      }
      setCurrentTopic(topicToSet);
    }
  }, [status, topics, progressDocs, userData]);



  if (auth.currentUser === null || auth.currentUser === undefined) {
    return (
      <div className="flex justify-center items-center w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-5xl text-center">🚫</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">You need to be signed in to view this page.</p>
            <Link href="/login" className="flex justify-center mt-10">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex-col relative">
        <div className="flex items-end justify-between space-y-2 mb-6">
          <h2 className="text-3xl leading-5 font-bold tracking-tight">
            Fellowship Curriculum
          </h2>
        </div>

        <ReviewCard />

        <div className="flex">
          <div>
            {orderedTopics.map((topic,i) => {
              var isLocked = curriculumGated && i > currentTopic;
              var progress = 0;

              //check user progress on topic
              const completed = completedByTopic.get(topic.id);
              if (completed !== undefined) {
                progress = Math.round((completed / topic.data().objectiveCount) * 100);

                // completed work stays accessible even if a reorder moves it
                // past the current topic
                if (progress >= 100) {
                  isLocked = false;
                }
              }


              return (
                <TopicButton
                  topicName={topic.data().topicName}
                  key={topic.id}
                  id={topic.id}
                  index={i}
                  totalCount={orderedTopics.length - 1}
                  locked={isLocked}
                  current={currentTopic === i}
                  percentage={progress}
                />
              )
            })}
            </div>
        </div>
      </div>
    </>
  );
};
