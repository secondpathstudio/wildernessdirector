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

export const NavbarUserLinks: FC = () => {
  const { data, hasEmitted } = useUser();
  const userRole = useUserStore((state) => state.role);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (hasEmitted) {
      if (!data && !pathname?.includes("/login")) {
        router.push("/login");
      } else {
        router.push("/home");
      }
    } 
  }, [hasEmitted, data, router]);

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
