'use client';
import { FC, useState } from "react";
import { MainNav } from "@/components/dashboard/main-nav";
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, orderBy, query, where } from "firebase/firestore";
import { useSearchParams } from "next/navigation";


const AdminUserPage = () => {
  const params = useSearchParams();
  const userId = params?.get("userId") || "noUserId";

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              placeholder
          </div>
        </div>
    </>
  );
};

export default AdminUserPage;