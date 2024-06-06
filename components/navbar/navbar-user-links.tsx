"use client";

import { useUserStore } from "@/lib/store";
import { UserNav } from "@/components/navbar/user-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { FC, useEffect } from "react";
import { useUser } from "reactfire";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc, getFirestore } from "firebase/firestore";

export const NavbarUserLinks: FC = () => {
  const { data, hasEmitted } = useUser();
  const firestore = getFirestore();
  const userRole = useUserStore((state) => state.role);
  const setUserRole = useUserStore((state) => state.setRole);
  const router = useRouter();

  useEffect(() => {
    console.log("help")
    if (hasEmitted && data) {
        const userDoc = doc(firestore, "users", data.uid);
        //check for user role
        
        getDoc(userDoc).then((doc) => {
          if (doc.exists()) {
            console.log("Setting user role", doc.data().role)
            setUserRole(doc.data().role);
          }
        });
    } else {
      console.log("No user data")
    }
  }, [hasEmitted, data]);

  return (
    <>
      {hasEmitted && data ? (
        <>
          <Link href="/home/calendar" className={buttonVariants({variant: "outline"})}>
            <div className="flex gap-2 items-center">Schedule <Calendar /></div>
          </Link>
          <Link href="/home" className={buttonVariants({variant: "default"})}>
            Curriculum &rarr;
          </Link>
          <UserNav userRole={userRole}/>
        </>
      ) : (
        <>
          <Link href="/login" className={buttonVariants()}>
            Fellow Login &rarr;
          </Link>
        </>
      )}
    </>
  );
};
