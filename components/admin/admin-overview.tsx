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
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, query, where } from "firebase/firestore";


export const AdminOverview: FC = (props) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const usersCollection = collection(firestore, "users");
  const usersQuery = query(usersCollection, where('isAdmin', '==', false));
  const { status: usersStatus, data: users } = useFirestoreCollectionData(usersQuery, {
    idField: 'id',
  });

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Users Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {usersStatus === "loading" && (
                  <div className="text-2xl font-bold">Loading users...</div>
                )}
                {usersStatus === "success" && (
                  <div>
                    <div className="text-2xl font-bold">Users</div>
                    <div>
                      {users.map((user: any) => (
                        <LinkCard key={user.id} href="#">
                          <CardDescription>
                            {user.email}
                          </CardDescription>
                        </LinkCard>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
    </>
  );
};
