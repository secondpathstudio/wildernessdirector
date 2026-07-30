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
import { TopicOrderEditor } from "./topic-order-editor";
import { AdminTopicDetail } from "./admin-topic-detail";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { toast } from "../ui/use-toast";
import { Users } from "lucide-react";

interface AdminOverviewProps {
  userId: string | undefined;
  users: any;
}

export const AdminOverview: FC<AdminOverviewProps> = (props) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const selectedUser = props.users?.find((user: any) => user.id === props.userId);
  // Missing field means gated — the default for existing and new users.
  const curriculumGated = selectedUser?.data()?.curriculumGated !== false;

  // discard any unsaved role choice and topic selection when a different
  // user is selected
  useEffect(() => {
    setUserRole(undefined);
    setSelectedTopicId(null);
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

  // friendly landing state until a fellow is chosen (including "All")
  if (!selectedUser) {
    return (
      <div className="flex-1 space-y-4 pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-7">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Select a fellow to get started</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Choose a user from the list in the top right to review their
                progress, adjust their curriculum order, or manage their settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7">
              <CardHeader>
                <CardTitle>Overview for {selectedUser.data()?.name || selectedUser.data()?.email}</CardTitle>
                <CardDescription>{selectedUser.data()?.email}</CardDescription>
                <div className="flex items-center">
                  <Select
                    onValueChange={(v) => handleUserRoleChange(v)}
                    value={userRole !== undefined ? userRole : selectedUser.data()?.role ?? "free"}
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
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 lg:grid-cols-7">
                  <div className="lg:col-span-3">
                    <TopicOrderEditor
                      userId={selectedUser.id}
                      savedTopicOrder={selectedUser.data()?.topicOrder}
                      selectedTopicId={selectedTopicId}
                      onTopicSelect={setSelectedTopicId}
                    />
                  </div>
                  <div className="lg:col-span-4">
                    {selectedTopicId ? (
                      <AdminTopicDetail userId={selectedUser.id} topicId={selectedTopicId} />
                    ) : (
                      <p className="text-sm text-muted-foreground pt-8">
                        Select a topic to review this fellow&apos;s progress.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </>
  );
};
