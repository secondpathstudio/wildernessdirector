'use client';
import { FC, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  LinkCard,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, useFirestore, useFirestoreCollectionData, useFirestoreDoc } from "reactfire";
import { AdminUserOverview } from "./admin-user-overview";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "../ui/use-toast";

interface AdminOverviewProps {
  userId: string | undefined;
  users: any;
}

export const AdminOverview: FC<AdminOverviewProps> = (props) => {
  const auth = useAuth();
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const firestore = useFirestore();
  
  const handleUserRoleChange = (newRole: string) => {
    if (auth.currentUser === null) {
      return;
    }

    setUserRole(newRole);
  }

  const saveUserRoleChange = async () => {
    if (auth.currentUser === null || props.userId === undefined || userRole === undefined) {
      return;
    }

    const userRef = doc(firestore, `users/${props.userId}`);
    try {
      await setDoc(userRef, { role: userRole }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7">
              <CardHeader>
                <CardTitle>Overview for {props.users?.find((user: any) => user.id === props.userId)?.data()?.name != "" ? 
                props.users?.find((user: any) => user.id === props.userId)?.data()?.name 
              :
              props.users?.find((user: any) => user.id === props.userId)?.data()?.email}</CardTitle>
                {props.userId !== undefined && (
                <div className="flex items-center">
                  <Select 
                    onValueChange={(v) => handleUserRoleChange(v)}
                    value={userRole !== undefined ? userRole : props.users?.find((user: any) => user.id === props.userId)?.data()?.role}
                    >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="User Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="fellow">Fellow</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                    </Select>
                    {userRole !== undefined && <Button className="ml-4" onClick={saveUserRoleChange}>Save</Button>}
                  </div>
                )}
                {props.users?.find((user: any) => user.id === props.userId) && (
                  <CardDescription>
                    {props.users?.find((user: any) => user.id === props.userId)?.data()?.role ? 
                    `Role: ${props.users?.find((user: any) => user.id === props.userId)?.data()?.role}` :
                    "Role: free"
                    }
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pl-2">
                {props.users?.find((user: any) => user.id === props.userId) ? (
                    <AdminUserOverview userId={props.users?.find((user: any) => user.id === props.userId).id}/>
                ) : 
                <p>No user selected</p>
                }
              </CardContent>
            </Card>
          </div>
        </div>
    </>
  );
};
