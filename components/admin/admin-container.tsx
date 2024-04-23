'use client';
import { FC, useState } from "react";
import { MainNav } from "@/components/dashboard/main-nav";
import { useAuth, useFirestore, useFirestoreDoc, useUser } from "reactfire";
import { AdminOverview } from "./admin-overview";
import { AdminFieldReports } from "./admin-field-reports";
import { AdminTopicQuestions } from "./admin-questions";
import { AdminTopics } from "./admin-topics";

export const AdminContainer: FC = () => {
    const user = useUser();
  const [activeTab, setActiveTab] = useState(0); 
  const firestore = useFirestore();

//TODO ADD ADMIN AUTHENTICATION

  return (
    <>
      <div className="flex-col md:flex">
        <div className="flex items-end justify-between space-y-2 mb-6">
          <h2 className="text-3xl leading-5 font-bold tracking-tight">
            Admin Dashboard
          </h2>
        </div>
        <div className="flex h-16 items-center bg-muted px-6 rounded-xl">
          <MainNav 
            changeTab={setActiveTab}
            activeTab={activeTab}
          />
        </div>
        
        {activeTab === 0 && <AdminOverview />}
        {activeTab === 1 && <AdminTopics />}
        {activeTab === 2 && <AdminFieldReports />}
        {activeTab === 3 && <AdminTopicQuestions />}
        
      </div>
    </>
  );
};
