import { NavbarMobile } from "@/components/navbar/navbar-mobile";
import { NavbarUserLinks } from "@/components/navbar/navbar-user-links";
import { buttonVariants } from "@/components/ui/button";
import WildermedIcon from "../ui/WildermedIcon";
import Link from "next/link";
import { FC } from "react";

export const NavBar: FC = () => {
  return (
    <>
      <div className="animate-in fade-in w-full">
        <nav className="container px-6 md:px-8 py-4">
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-1">
              <WildermedIcon 
                leafColor={"#283618"} 
                strokeWidth={"#000"} 
                crossColor={"#FEFAE0"} 
                strokeColor={"#000"} 
                size={24} 
              />
                <span className="text-xl text-[#283618] font-semibold tracking-tighter">
                  WildernessDirector
                </span>
              </div>
            </Link>
            <div className="hidden md:flex justify-between grow">
              <div>
                <a target="_blank" href="http://www.ruhswilderness.com/" rel="noopener noreferrer">
                  <button className={buttonVariants({ variant: "link" })}>Fellowship @ RUHS</button>
                </a>
                {/* <Link href="/mobile-app" className={buttonVariants({ variant: "link" })}>
                  Mobile App
                </Link> */}
              </div>
              {/* <div className="flex items-center space-x-4">
                <NavbarUserLinks />
              </div> */}
            </div>
            <div className="grow md:hidden flex justify-end">
              <NavbarMobile />
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};
