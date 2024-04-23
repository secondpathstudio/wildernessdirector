'use client';
import { FC, useState } from "react";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { useAuth, useFirestore, useFirestoreCollection } from "reactfire";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  LinkCard,
} from "@/components/ui/card";
import Link from "next/link";
import { TopicButton } from "../ui/topic-button";
import { TopicBanner } from "../ui/topic-banner";
import { Button } from "../ui/button";

export const Dashboard: FC = () => {
  const firestore = useFirestore();
  const auth = useAuth();
  const topicsCollection = collection(firestore, "topics");
  const [isAscending, setIsAscending] = useState(true);
  const topicsQuery = query(topicsCollection, orderBy('topicNumber', isAscending ? 'asc' : 'desc'));
  const { status, data: topics } = useFirestoreCollection(topicsQuery, {
    idField: 'id'
  });

  if (auth.currentUser === null) {
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
            Fellowship Progress
          </h2>
        </div>

        {/* <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 auto-rows-max gap-6 gap-y-20"> */}
        {topics && topics.docs.map((topic,i) => {
          const isCurrent = topic.data().topicNumber === 0;
          const isLocked = !topic.data().isCompleted && !isCurrent;

          return (
            <>
              {/* <TopicBanner 
                title={topic.data().topicName}
                description={topic.data().chapters}
              /> */}

                {/* <div className="bg-primary h-5 w-5">
                </div> */}
                <TopicButton
                  topicName={topic.data().topicName}
                  key={topic.id}
                  id={topic.id}
                  index={i}
                  totalCount={11}
                  locked={isLocked} 
                  current={isCurrent}
                  percentage={0}
                />
            </>
          )
        })}
        </div>
    </>
  );
};
