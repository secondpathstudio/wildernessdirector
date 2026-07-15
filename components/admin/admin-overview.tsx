'use client';
import { FC, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  LinkCard,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, useFirestore } from "reactfire";
import { doc, updateDoc } from "firebase/firestore";
import { AdminUserOverview } from "./admin-user-overview";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { toast } from "../ui/use-toast";

interface AdminOverviewProps {
  userId: string | undefined;
  users: any;
}

export const AdminOverview: FC<AdminOverviewProps> = (props) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const [userRole, setUserRole] = useState<string | undefined>(undefined);

  const selectedUser = props.users?.find((user: any) => user.id === props.userId);
  // Missing field means gated — the default for existing and new users.
  const curriculumGated = selectedUser?.data()?.curriculumGated !== false;

  // discard any unsaved role choice when a different user is selected
  useEffect(() => {
    setUserRole(undefined);
  }, [props.userId]);

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

    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ uid: props.userId, role: userRole }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast({
          title: "Failed to update role",
          description: body.error ?? `Request failed (${res.status})`,
        });
        return;
      }

      toast({
        title: "Role updated",
        description: "Takes effect when the user next signs in or their session refreshes.",
      });
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to update role", description: `${e}` });
    }
  }

  const handleCurriculumGatingChange = async (gated: boolean) => {
    if (props.userId === undefined || props.userId === "") {
      return;
    }

    try {
      await updateDoc(doc(firestore, `users/${props.userId}`), {
        curriculumGated: gated,
      });
      toast({
        title: gated ? "Curriculum gated" : "Curriculum opened",
        description: gated
          ? "Topics unlock in order as each one is completed."
          : "All topics are unlocked for this user.",
      });
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to update curriculum gating", description: `${e}` });
    }
  }

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7">
              <CardHeader>
                <CardTitle>Overview for {props.users?.find((user: any) => user.id === props.userId)?.data()?.name} ({props.users?.find((user: any) => user.id === props.userId)?.data()?.email})</CardTitle>
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
                {selectedUser && (
                  <div className="flex items-center gap-3 pt-2">
                    <Switch
                      checked={curriculumGated}
                      onCheckedChange={handleCurriculumGatingChange}
                    />
                    <span className="text-sm text-muted-foreground">
                      {curriculumGated
                        ? "Gated curriculum — topics unlock in order"
                        : "Open curriculum — all topics unlocked"}
                    </span>
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
