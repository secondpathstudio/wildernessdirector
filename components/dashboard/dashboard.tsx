'use client';

import { FC, useEffect, useState } from "react";
import { collection, query, orderBy, doc, where } from "firebase/firestore";
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

export const Dashboard: FC = () => {
  const [currentTopic, setCurrentTopic] = useState(0);
  const firestore = useFirestore();
  const auth = useAuth();
  const uid = auth.currentUser?.uid ?? "anonymous";
  const topicsCollection = collection(firestore, "topics");
  const [isAscending, setIsAscending] = useState(true);
  const topicsQuery = query(topicsCollection, orderBy('topicNumber', isAscending ? 'asc' : 'desc'));
  const { status, data: topics } = useFirestoreCollection(topicsQuery, {
    idField: 'id'
  });
  const userDoc = doc(firestore, `users/${uid}`)
  const { status: userStatus, data: userData } = useFirestoreDoc(userDoc, {
    idField: 'id'
  });
  // Admin-controlled flag on the user doc; missing means gated.
  const curriculumGated = userData?.data()?.curriculumGated !== false;

  // One progress doc per topic, keyed by topicId, owned by this user.
  const progressCollection = collection(firestore, `users/${uid}/progress`);
  const { data: progressDocs } = useFirestoreCollection(progressCollection);
  const completedByTopic = new Map<string, number>();
  progressDocs?.docs.forEach((progressDoc) => {
    completedByTopic.set(progressDoc.id, completedObjectiveCount(progressDoc.data() as TopicProgress));
  });

  const approvedQuestionsQuery = query(
    collection(firestore, "questions"),
    where('authorId', '==', uid),
    where('approved', '==', true),
  );
  const { data: approvedQuestions } = useFirestoreCollection(approvedQuestionsQuery);
  const approvedQuestionsByTopic = new Map<string, number>();
  approvedQuestions?.docs.forEach((question) => {
    const topicId = question.data().topicId;
    approvedQuestionsByTopic.set(topicId, (approvedQuestionsByTopic.get(topicId) ?? 0) + 1);
  });

  useEffect(() => {
    //calculate current topic
    var topicToSet = 0;
    if (status === 'success' && topics.docs.length > 0) {
      topics.docs.forEach((topic, i) => {
        const completed = progressDocs?.docs
          .find((progressDoc) => progressDoc.id === topic.id);
        if (completed !== undefined) {
          if (completedObjectiveCount(completed.data() as TopicProgress) / topic.data().objectiveCount >= 1) {
            topicToSet = i + 1;
          }
        }
      });
      setCurrentTopic(topicToSet);
      console.log('current topic', topicToSet);
    }
  }, [topics, progressDocs]);



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

        <div className="flex">
          <div>
            {topics && topics.docs.map((topic,i) => {
              var isLocked = curriculumGated && topic.data().topicNumber > currentTopic;
              var progress = 0;

              //check user progress on topic
              const completed = completedByTopic.get(topic.id);
              if (completed !== undefined) {
                progress = Math.round((completed / topic.data().objectiveCount) * 100);

                if (progress >= 100 && (approvedQuestionsByTopic.get(topic.id) ?? 0) > 10) {
                  isLocked = false;
                }
              }


              return (
                <TopicButton
                  topicName={topic.data().topicName}
                  key={topic.id}
                  id={topic.id}
                  index={i}
                  totalCount={11}
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
