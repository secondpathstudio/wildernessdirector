'use client';
import { FC, useState } from "react";
import { MainNav } from "@/components/dashboard/main-nav";
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, orderBy, query, where } from "firebase/firestore";
import { AdminObjectiveCreator } from "./admin-objective-creator";
import { Button } from "../ui/button";
import { useSearchParams } from "next/navigation";


export const AdminTopicObjectives: FC = () => {
  const params = useSearchParams();
  const topicId = params?.get("topicId") || "noTopicId";

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <AdminObjectiveCreator topicId={topicId} />
          </div>
        </div>
    </>
  );
};
