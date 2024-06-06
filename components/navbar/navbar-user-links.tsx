"use client";

import { UserNav } from "@/components/navbar/user-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { useUser } from "reactfire";

export const NavbarUserLinks: FC = () => {
  const { data, hasEmitted } = useUser();

  return (
    <>
      {hasEmitted && data ? (
        <>
          <Link href="/home/calendar" className={buttonVariants({variant: "outline"})}>
            <div className="flex gap-2 items-center">Schedule <Calendar /></div>
          </Link>
          <Link href="/home" className={buttonVariants({variant: "default"})}>
            Fellowship Progress &rarr;
          </Link>
          <UserNav />
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
