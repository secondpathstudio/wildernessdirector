'use client';
import { FC, useState } from "react";
import { MainNav } from "@/components/topic-overview/main-nav";
import { useAuth, useFirestore, useFirestoreCollection, useFirestoreDoc, useUser } from "reactfire";
import { AdminOverview } from "./admin-overview";
import { AdminFieldReports } from "./admin-field-reports";
import { AdminTopicQuestions } from "./admin-questions";
import { AdminTopics } from "./admin-topics";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { collection, query, where } from "firebase/firestore";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from "../ui/dialog";
import { UserPlus } from "lucide-react";
import { Button } from "../ui/button";
import AddUserForm from "./add-user-form";

export const AdminContainer: FC = () => {
    const user = useUser();
  const [activePage, setActivePage] = useState(0); 
  const [currentUserId, setCurrentUserId] = useState<string | undefined>("");
  const firestore = useFirestore();
  const usersCollection = collection(firestore, "users");
  //TODO check for isAdmin = false or undefined
  const usersQuery = query(usersCollection);
  const { status: usersStatus, data: users } = useFirestoreCollection(usersQuery, {
    idField: 'id',
  });

//TODO ADD ADMIN AUTHENTICATION

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
          />
          <div className="flex items-center gap-4">
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
                  {users.docs.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>{user.data().name} - {user.data().email}</SelectItem>
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
        {activePage === 3 && <AdminTopicQuestions />}
        
      </div>
    </>
  );
};
