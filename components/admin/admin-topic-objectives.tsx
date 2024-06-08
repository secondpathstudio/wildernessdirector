'use client';
import { FC, useState } from "react";
import { AdminObjectiveCreator } from "./admin-objective-creator";
import { useSearchParams } from "next/navigation";


export const AdminTopicObjectives: FC = () => {
  const params = useSearchParams();
  const topicId = params?.get("topicId") || "noTopicId";

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <AdminObjectiveCreator topicId={topicId} setCurrentTopic={() => console.log("no longer need this page")}/>
          </div>
        </div>
    </>
  );
};
