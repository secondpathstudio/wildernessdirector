'use client';
import { FC, useState } from "react";
import { MainNav, NavTab } from "@/components/topic-overview/main-nav";
import { AdminQuizzes } from "./admin-quizzes";
import { BookOpen, ClipboardList, FileQuestion, ListChecks } from "lucide-react";
import { formatCohort, getCurrentAcademicYear } from "@/lib/CONSTANTS";
import { useAuth, useFirestore, useFirestoreCollection, useFirestoreDoc, useUser } from "reactfire";
import { AdminOverview } from "./admin-overview";
import { AdminFieldReports } from "./admin-field-reports";
import { AdminTopicQuestions } from "./admin-questions";
import { AdminTopics } from "./admin-topics";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { collection, query, where } from "firebase/firestore";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from "../ui/dialog";
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
    const user = useUser();
  const [activePage, setActivePage] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>("");
  // "all" or a cohort start year as a string; defaults to the current cohort
  const [cohortFilter, setCohortFilter] = useState<string>(String(getCurrentAcademicYear()));
  const [showFreeUsers, setShowFreeUsers] = useState(false);
  const firestore = useFirestore();
  const usersCollection = collection(firestore, "users");
  const usersQuery = query(usersCollection);
  const { status: usersStatus, data: users } = useFirestoreCollection(usersQuery, {
    idField: 'id',
  });

  // every cohort year present on any user, newest first, plus the current year
  const cohortYears = Array.from(new Set<number>([
    getCurrentAcademicYear(),
    ...(users?.docs ?? [])
      .map((user: any) => user.data().cohortYear)
      .filter((year: any) => typeof year === 'number'),
  ])).sort((a, b) => b - a);

  // users with no cohortYear (admins, self-signups) always pass the cohort
  // filter; free users are hidden unless toggled on (doc role mirrors the
  // claim, defaulting to free)
  const visibleUsers = (users?.docs ?? []).filter((user: any) => {
    if (!showFreeUsers && (user.data().role ?? 'free') === 'free') return false;
    if (cohortFilter === "all") return true;
    const cohortYear = user.data().cohortYear;
    return cohortYear === undefined || cohortYear === Number(cohortFilter);
  });

  const handleCohortChange = (value: string) => {
    setCohortFilter(value);
    // the selected user may no longer be in view
    setCurrentUserId("");
  };

  const handleShowFreeUsersChange = (show: boolean) => {
    setShowFreeUsers(show);
    setCurrentUserId("");
  };

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
          <div className="flex items-center gap-4">
          {usersStatus === "success" && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
              <Switch
                checked={showFreeUsers}
                onCheckedChange={handleShowFreeUsersChange}
              />
              Free users
            </label>
          )}
          {usersStatus === "success" && (
            <Select
            onValueChange={handleCohortChange}
            value={cohortFilter}
            >
            <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Cohort" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                  {cohortYears.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      Cohort {formatCohort(year)}
                    </SelectItem>
                  ))}
                  <SelectItem value="all">All cohorts</SelectItem>
                </SelectGroup>
            </SelectContent>
            </Select>
          )}
            Current User:
          {usersStatus === "success" && (
            <Select
            onValueChange={(v) => setCurrentUserId(v)}
            value={currentUserId}
            >
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="User List" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                  <SelectItem value="All">All Users</SelectItem>
                  {visibleUsers.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.data().name != "" ? user.data().name : user.data().email}
                    </SelectItem>
                  ))}
                </SelectGroup>
            </SelectContent>
            </Select>
          )}
          <Dialog>
            <DialogTrigger>
              <Button><UserPlus /></Button>
            </DialogTrigger>
            <DialogContent>
                <AddUserForm />
              </DialogContent>
          </Dialog>
          </div>
        </div>
        
      
        {activePage === 0 && <AdminOverview userId={currentUserId} users={users?.docs}/>}
        {activePage === 1 && <AdminTopics />}
        {activePage === 2 && <AdminFieldReports />}
        {activePage === 3 && <AdminTopicQuestions userId={currentUserId} />}
        {activePage === 4 && <AdminQuizzes />}
        
      </div>
    </>
  );
};
