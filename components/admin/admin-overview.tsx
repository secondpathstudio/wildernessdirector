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
import { deleteField, doc, updateDoc } from "firebase/firestore";
import { formatCohort, getCurrentAcademicYear } from "@/lib/CONSTANTS";
import { TopicOrderEditor } from "./topic-order-editor";
import { AdminTopicDetail } from "./admin-topic-detail";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { toast } from "../ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { Input } from "../ui/input";
import { FellowsTable } from "./fellows-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface AdminOverviewProps {
  users: any;
}

export const AdminOverview: FC<AdminOverviewProps> = (props) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedUser = props.users?.find((user: any) => user.id === selectedUserId);
  // Missing field means gated — the default for existing and new users.
  const curriculumGated = selectedUser?.data()?.curriculumGated !== false;

  // discard any unsaved role choice, topic selection, and delete confirmation
  // when a different user is selected
  useEffect(() => {
    setUserRole(undefined);
    setSelectedTopicId(null);
    setDeleteOpen(false);
    setDeleteConfirmText("");
  }, [selectedUserId]);

  const handleDeleteUser = async () => {
    if (auth.currentUser === null || selectedUserId === null) {
      return;
    }

    setIsDeleting(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ uid: selectedUserId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast({
          title: "Failed to delete user",
          description: body.error ?? `Request failed (${res.status})`,
        });
        return;
      }

      toast({
        title: "User deleted",
        description: "Their account, progress, and quiz attempts are removed. Authored questions and field reports remain.",
      });
      setDeleteOpen(false);
      setSelectedUserId(null);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to delete user", description: `${e}` });
    } finally {
      setIsDeleting(false);
    }
  }

  const handleUserRoleChange = (newRole: string) => {
    if (auth.currentUser === null) {
      return;
    }

    setUserRole(newRole);
  }

  const saveUserRoleChange = async () => {
    if (auth.currentUser === null || selectedUserId === null || userRole === undefined) {
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
        body: JSON.stringify({ uid: selectedUserId, role: userRole }),
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

  const handleCohortChange = async (value: string) => {
    if (selectedUserId === null) {
      return;
    }

    try {
      await updateDoc(doc(firestore, `users/${selectedUserId}`), {
        cohortYear: value === "none" ? deleteField() : Number(value),
      });
      toast({
        title: value === "none" ? "Cohort cleared" : `Cohort set to ${formatCohort(Number(value))}`,
      });
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to update cohort", description: `${e}` });
    }
  }

  const handleCurriculumGatingChange = async (gated: boolean) => {
    if (selectedUserId === null) {
      return;
    }

    try {
      await updateDoc(doc(firestore, `users/${selectedUserId}`), {
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

  // the fellows table is the landing view; a row click drills into a user
  // (also covers a selected user disappearing, e.g. after deletion)
  if (!selectedUser) {
    return <FellowsTable users={props.users} onSelect={setSelectedUserId} />;
  }

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7">
              <CardHeader>
                <div>
                  <button
                    type="button"
                    className="flex items-center text-sm font-medium text-primary hover:underline mb-2"
                    onClick={() => setSelectedUserId(null)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" /> All fellows
                  </button>
                </div>
                <CardTitle>Overview for {selectedUser.data()?.name || selectedUser.data()?.email}</CardTitle>
                <CardDescription>
                  {selectedUser.data()?.email}
                  {" · "}
                  {selectedUser.data()?.lastLogin
                    ? `Last active ${selectedUser.data().lastLogin.toDate().toLocaleDateString()} at ${selectedUser.data().lastLogin.toDate().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                    : "Never logged in"}
                </CardDescription>
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
                <div className="flex items-center gap-3 pt-2">
                  <Select
                    onValueChange={handleCohortChange}
                    value={selectedUser.data()?.cohortYear !== undefined
                      ? String(selectedUser.data()?.cohortYear)
                      : "none"}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Cohort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">No cohort</SelectItem>
                        {Array.from({ length: 8 }, (_, i) => getCurrentAcademicYear() + 1 - i).map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            Cohort {formatCohort(year)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    The July the fellow started — drives the admin cohort filter
                  </span>
                </div>
                {auth.currentUser?.uid !== selectedUser.id && (
                  <div className="pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => { setDeleteConfirmText(""); setDeleteOpen(true); }}
                    >
                      Delete User
                    </Button>
                  </div>
                )}
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

        <Dialog open={deleteOpen} onOpenChange={(open) => { if (!open) { setDeleteOpen(false); setDeleteConfirmText(""); } }}>
          <DialogContent className="sm:max-w-[425px] w-11/12 rounded-md">
            <DialogHeader>
              <DialogTitle>Delete {selectedUser.data()?.name || selectedUser.data()?.email}?</DialogTitle>
              <DialogDescription>
                This permanently deletes their login, progress, and quiz attempts.
                Questions and field reports they authored are kept. This cannot be undone.
              </DialogDescription>
              <DialogDescription>
                Type <span className="font-semibold">{selectedUser.data()?.email}</span> to confirm.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Email"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={isDeleting || deleteConfirmText.trim() !== selectedUser.data()?.email}
                onClick={handleDeleteUser}
              >
                {isDeleting ? "Deleting..." : "Delete User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
};
