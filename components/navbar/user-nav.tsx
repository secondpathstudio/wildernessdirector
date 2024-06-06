"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { getAuth, signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFirestore, useFirestoreDoc, useUser } from "reactfire";

interface UserNavProps {
  userRole: string;
}

export function UserNav({ userRole }: UserNavProps) {
  const { data: userAuth } = useUser(); 
  const router = useRouter();
  const doLogout = async () => {
    await signOut(getAuth());
    toast({
      title: "Logged out",
      description: "You have been logged out.",
    });
    router.replace("/");
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className={`h-10 w-10 ${userRole === 'admin' && 'border-4 border-yellow-400'}`}>
            <AvatarImage
              src={userAuth?.photoURL || "/avatars/04.png"}
              alt="@shadcn"
            />
            <AvatarFallback>
              {userAuth?.displayName?.slice(0, 2) || userAuth?.email?.slice(0, 2) || ""}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userAuth?.displayName ||
                userAuth?.email?.slice(0, userAuth?.email?.indexOf("@")) ||
                "Anonymous"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userAuth?.email || "No email"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {userRole === "admin" && (
          <DropdownMenuItem>
            <Link href="/admin">Admin</Link>
          </DropdownMenuItem>
          )}
          {/* <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>New Team</DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={doLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
