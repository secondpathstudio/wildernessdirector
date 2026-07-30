'use client';
import { FC, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { formatCohort, getCurrentAcademicYear } from "@/lib/CONSTANTS";

interface FellowsTableProps {
  users: any;
  onSelect: (userId: string) => void;
}

export const FellowsTable: FC<FellowsTableProps> = (props) => {
  // "all" or a cohort start year as a string; defaults to the current cohort
  const [cohortFilter, setCohortFilter] = useState<string>(String(getCurrentAcademicYear()));
  const [showFreeUsers, setShowFreeUsers] = useState(false);

  // every cohort year present on any user, newest first, plus the current year
  const cohortYears = Array.from(new Set<number>([
    getCurrentAcademicYear(),
    ...(props.users ?? [])
      .map((user: any) => user.data().cohortYear)
      .filter((year: any) => typeof year === 'number'),
  ])).sort((a, b) => b - a);

  // admins never appear — this is a fellows table; free users are hidden
  // unless toggled on; users with no cohortYear only appear under "All
  // cohorts", never in a specific year
  const visibleUsers = (props.users ?? [])
    .filter((user: any) => {
      if (user.data().role === 'admin') return false;
      if (!showFreeUsers && (user.data().role ?? 'free') === 'free') return false;
      if (cohortFilter === "all") return true;
      return user.data().cohortYear === Number(cohortFilter);
    })
    .sort((a: any, b: any) =>
      (a.data().name || a.data().email || "").localeCompare(b.data().name || b.data().email || ""));

  const lastActive = (user: any) => {
    const lastLogin = user.data().lastLogin;
    return lastLogin ? lastLogin.toDate().toLocaleDateString() : "Never";
  };

  return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Fellows</CardTitle>
                <CardDescription>
                  Select a fellow to review their progress and settings.
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                  <Switch
                    checked={showFreeUsers}
                    onCheckedChange={setShowFreeUsers}
                  />
                  Free users
                </label>
                <Select onValueChange={setCohortFilter} value={cohortFilter}>
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Cohort</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      No users match these filters — users without a cohort
                      (like new self-signups) only appear under All cohorts
                      {!showFreeUsers ? ", with Free users toggled on." : "."}
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleUsers.map((user: any) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer"
                      onClick={() => props.onSelect(user.id)}
                    >
                      <TableCell className="font-medium">{user.data().name || "—"}</TableCell>
                      <TableCell>{user.data().email}</TableCell>
                      <TableCell className="capitalize">{user.data().role ?? "free"}</TableCell>
                      <TableCell>
                        {typeof user.data().cohortYear === 'number'
                          ? formatCohort(user.data().cohortYear)
                          : "—"}
                      </TableCell>
                      <TableCell>{lastActive(user)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
