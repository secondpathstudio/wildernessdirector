"use client";

import { NavbarUserLinks } from "@/components/navbar/navbar-user-links";
import { buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { MenuIcon } from "lucide-react";

export const NavbarMobile = () => {
  return (
    <>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="-mr-4">
              <MenuIcon />
            </NavigationMenuTrigger>
            <NavigationMenuContent className="flex flex-col p-1">
              <NavigationMenuLink
                href="http://www.ruhswilderness.com"
                className={buttonVariants({ variant: "link" })}
              >
                Fellowship @ RUHS
              </NavigationMenuLink>
              {/* <NavigationMenuLink
                href="/mobile-app"
                className={buttonVariants({ variant: "link" })}
              >
                Mobile App
              </NavigationMenuLink> */}
              {/* <NavigationMenuLink
                href="#3"
                className={buttonVariants({ variant: "link" })}
              >
                Settings
              </NavigationMenuLink> */}
              {/* <div className="flex flex-col mb-0.5">
                <NavbarUserLinks />
              </div> */}
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
};
