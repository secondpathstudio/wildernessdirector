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
  const setUserRole = useUserStore((state) => state.setRole);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hasEmitted && data) {
        // role lives in the auth token's custom claims; no claim means 'free'
        data.getIdTokenResult().then((result) => {
          setUserRole(typeof result.claims.role === "string" ? result.claims.role : "free");
        });

        if (data.uid) {
          if (pathname?.includes("/login")) {
            router.push("/home");
          }
        }
    } else {
      console.log("No user data")
    }
  }, [hasEmitted, data]);

  return (
    <>
      {hasEmitted && data ? (
        <nav className="flex flex-col md:flex-row gap-2 md:items-center mb-4 md:mb-0 px-2">
          <Link href="/home/calendar" className={buttonVariants({variant: "outline"})}>
            <div className="flex gap-2 items-center">Schedule <Calendar /></div>
          </Link>
          <Link href="/home" className={buttonVariants({variant: "default"})}>
            Curriculum &rarr;
          </Link>
          <div className="rounded-md bg-gray-200 md:bg-transparent flex items-center justify-end p-2">
            <UserNav userRole={userRole}/>
          </div>
        </nav>
      ) : (
        <nav className="flex justify-center">
          <Link href="/login" className={buttonVariants()}>
            Login &rarr;
          </Link>
        </nav>
      )}
    </>
  );
};
