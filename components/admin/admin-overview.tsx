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
import { useAuth, useFirestore, useFirestoreCollectionData, useFirestoreDoc } from "reactfire";
import { collection, doc, query, where } from "firebase/firestore";
import Link from "next/link";
import { AdminUserOverview } from "./admin-user-overview";

interface AdminOverviewProps {
  userId: string | undefined;
  users: any;
}

export const AdminOverview: FC<AdminOverviewProps> = (props) => {
  const auth = useAuth();
  

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7">
              <CardHeader>
                <CardTitle>User Overview for {props.users?.find((user: any) => user.id === props.userId)?.data()?.name}</CardTitle>
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
