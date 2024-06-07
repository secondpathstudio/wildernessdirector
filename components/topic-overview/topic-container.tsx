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
import { getMonth } from "@/lib/CONSTANTS";

export const TopicContainer: FC = () => {
  const params = useSearchParams();
  const topicId = params?.get("topicId") || "noTopicId";
  const [activePage, setActivePage] = useState(0); 

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
        <div className="flex flex-col items-start justify-between space-y-2 mb-6">
          <h3>
            {getMonth(data?.data()?.topicNumber)}
          </h3>
          <h2 className="text-xl md:text-3xl leading-5 font-bold tracking-tight">
          {data?.data()?.topicName || "Loading..."}
          </h2>
        </div>
        <div className="flex h-16 items-center bg-muted px-6 rounded-xl">
          <MainNav 
            changeTab={setActivePage}
            activePage={activePage}
          />
        </div>
        
        {activePage === 0 && <TopicOverview topicId={topicId} topicData={data.data()} />}
        {activePage === 1 && <TopicObjectives topicId={topicId} />}
        {activePage === 2 && <FieldReports topicId={topicId}/>}
        {activePage === 3 && <TopicQuestions topicId={topicId} />}
      </div>
    </>
  );
};
