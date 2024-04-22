'use client';
import { FC } from "react";
import { MainNav } from "@/components/dashboard/main-nav";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  LinkCard,
} from "@/components/ui/card";

export const FieldReports: FC = () => {

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="flex">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Field Reports</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">Listed here</CardContent>
            </Card>
          </div>
        </div>
    </>
  );
};
