'use client';

import { FC, useEffect, useState } from "react";
import { getDocs, collection, query, orderBy, doc } from "firebase/firestore";
import { useAuth, useFirestore, useFirestoreCollection, useFirestoreDoc } from "reactfire";
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
import { Button } from "../ui/button";

export const Dashboard: FC = () => {
  const [currentTopic, setCurrentTopic] = useState(0);
  const firestore = useFirestore();
  const auth = useAuth();
  const topicsCollection = collection(firestore, "topics");
  const [isAscending, setIsAscending] = useState(true);
  const topicsQuery = query(topicsCollection, orderBy('topicNumber', isAscending ? 'asc' : 'desc'));
  const { status, data: topics } = useFirestoreCollection(topicsQuery, {
    idField: 'id'
  });
  const userDoc = doc(firestore, `users/${auth.currentUser?.uid}`)
  const { status: userStatus, data: userData } = useFirestoreDoc(userDoc, {
    idField: 'id'
  });
  
  useEffect(() => {
    //calculate current topic
    var topicToSet = 0;
    if (status === 'success' && topics.docs.length > 0) {
      topics.docs.forEach((topic, i) => {
        const userProgress = topic.data().userProgress?.find((user: any) => user.userId === auth.currentUser?.uid);
        if (userProgress !== undefined) {
          if (userProgress.completedObjectives / topic.data().objectiveCount >= 1) {
            topicToSet = i + 1;
          }
        }
      });
      setCurrentTopic(topicToSet);
      console.log('current topic', topicToSet);
    }
  }, [topics]);

  

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
            Fellowship Progress
          </h2>
          <div>
            {userData && userData.data()?.role === 'admin' && (
              <div>Admin</div>
            )}
          </div>
        </div>

        <div className="flex">
          <div>
            {topics && topics.docs.map((topic,i) => {
              var isLocked = topic.data().topicNumber > currentTopic;
              var progress = 0;
              
              //check user progress on topic
              const userProgress = topic.data().userProgress?.find((user: any) => user.userId === auth.currentUser?.uid);
              if (userProgress !== undefined) {
                progress = Math.round((userProgress.completedObjectives / topic.data().objectiveCount) * 100);

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
                  totalCount={11}
                  locked={false} 
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
