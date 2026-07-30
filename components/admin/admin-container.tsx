'use client';
import { FC, useState } from "react";
import { MainNav, NavTab } from "@/components/topic-overview/main-nav";
import { AdminQuizzes } from "./admin-quizzes";
import { BookOpen, ClipboardList, FileQuestion, ListChecks } from "lucide-react";
import { useFirestore, useFirestoreCollection } from "reactfire";
import { AdminOverview } from "./admin-overview";
import { AdminFieldReports } from "./admin-field-reports";
import { AdminTopicQuestions } from "./admin-questions";
import { AdminTopics } from "./admin-topics";
import { collection, query } from "firebase/firestore";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { UserPlus } from "lucide-react";
import { Button } from "../ui/button";
import AddUserForm from "./add-user-form";

const ADMIN_TABS: NavTab[] = [
  { label: "Overview", icon: null },
  { label: "Objectives", icon: <ListChecks /> },
  { label: "Field Reports", icon: <BookOpen /> },
  { label: "Questions", icon: <FileQuestion /> },
  { label: "Quizzes", icon: <ClipboardList /> },
];

export const AdminContainer: FC = () => {
  const [activePage, setActivePage] = useState(0);
  const firestore = useFirestore();
  const usersCollection = collection(firestore, "users");
  const usersQuery = query(usersCollection);
  const { data: users } = useFirestoreCollection(usersQuery, {
    idField: 'id',
  });

  return (
    <>
      <div className="flex-col md:flex">
        <div className="flex items-end justify-between space-y-2 mb-6">
          <h2 className="text-3xl leading-5 font-bold tracking-tight">
            Admin Dashboard
          </h2>
        </div>
        <div className="flex h-16 items-center bg-muted px-6 rounded-xl justify-between">
          <MainNav
            changeTab={setActivePage}
            activePage={activePage}
            tabs={ADMIN_TABS}
          />
          <Dialog>
            <DialogTrigger>
              <Button><UserPlus /></Button>
            </DialogTrigger>
            <DialogContent>
                <AddUserForm />
              </DialogContent>
          </Dialog>
        </div>


        {activePage === 0 && <AdminOverview users={users?.docs}/>}
        {activePage === 1 && <AdminTopics />}
        {activePage === 2 && <AdminFieldReports />}
        {activePage === 3 && <AdminTopicQuestions userId={undefined} />}
        {activePage === 4 && <AdminQuizzes />}

      </div>
    </>
  );
};
