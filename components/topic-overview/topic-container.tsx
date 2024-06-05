'use client';
import { FC, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MainNav } from "@/components/dashboard/main-nav";
import { useFirestore, useFirestoreDoc } from "reactfire";
import { doc } from "firebase/firestore";
import { TopicOverview } from "./topic-overview";
import { QuestionCreator } from "./question-creator";
import { TopicObjectives } from "./topic-objectives";
import { TopicQuestions } from "./topic-questions";
import { FieldReports } from "./field-reports";

export const TopicContainer: FC = () => {
  const params = useSearchParams();
  const topicId = params?.get("topicId") || "noTopicId";
  const [activeTab, setActiveTab] = useState(0); 

  //get the topic data from the database
  const firestore = useFirestore();
  const topicData = doc(firestore, "topics", topicId);
  const { status, data } = useFirestoreDoc(topicData);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex-col md:flex">
        <div className="flex items-end justify-between space-y-2 mb-6">
          <h2 className="text-3xl leading-5 font-bold tracking-tight">
            {data?.data()?.topicName || "Loading..."}
          </h2>
        </div>
        <div className="flex h-16 items-center bg-muted px-6 rounded-xl">
          <MainNav 
            changeTab={setActiveTab}
            activeTab={activeTab}
          />
        </div>
        
        {activeTab === 0 && <TopicOverview topicId={topicId} topicData={data.data()} />}
        {activeTab === 1 && <TopicObjectives topicId={topicId} />}
        {activeTab === 2 && <FieldReports topicId={topicId}/>}
        {activeTab === 3 && <TopicQuestions topicId={topicId} />}
      </div>
    </>
  );
};
