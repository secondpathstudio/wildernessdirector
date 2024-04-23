'use client';
import { FC, useState } from "react";
import { MainNav } from "@/components/dashboard/main-nav";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  LinkCard,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, orderBy, query, where } from "firebase/firestore";
import { AdminObjectiveCreator } from "./admin-objective-creator";
import { Button } from "../ui/button";
import { useSearchParams } from "next/navigation";


export const AdminTopicObjectives: FC = () => {
  const auth = useAuth();
  const params = useSearchParams();
  const topicId = params?.get("topicId") || "noTopicId";
  const [currentTopic, setCurrentTopic] = useState<any>(null);
  const firestore = useFirestore();
  const [isAscending, setIsAscending] = useState(true);

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <AdminObjectiveCreator topicId={topicId} />
          </div>
        </div>
    </>
  );
};
