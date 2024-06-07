import Link from "next/link";

import { cn } from "@/lib/utils";
import { FC } from "react";
import { BookOpen, FileQuestion, ListChecks } from "lucide-react";

interface TopicNavProps {
  changeTab: (index: number) => void,
  activePage: number
}

export const MainNav: FC<TopicNavProps> = ({ changeTab, ...props }) => {
  return (
    <>
      <nav
        className={cn("hidden md:flex items-center space-x-4 lg:space-x-6")}
        {...props}
      >
        <button
          onClick={() => changeTab(0)}
          className={`text-sm font-medium transition-colors hover:text-primary ${props.activePage === 0 && 'text-primary'}`}
        >
          Overview
        </button>
        <button
          onClick={() => changeTab(1)}
          className={`text-sm font-medium transition-colors hover:text-primary ${props.activePage === 1 && 'text-primary'}`}
        >
          Objectives
        </button>
        <button
          onClick={() => changeTab(2)}
          className={`text-sm font-medium transition-colors hover:text-primary ${props.activePage === 2 && 'text-primary'}`}
        >
          Field Reports
        </button>
        <button
          onClick={() => changeTab(3)}
          className={`text-sm font-medium transition-colors hover:text-primary ${props.activePage === 3 && 'text-primary'}`}
        >
          Questions
        </button>
      </nav>
      <nav
        className={cn("flex md:hidden items-center w-full justify-between space-x-4 lg:space-x-6")}
        {...props}
      >
        <button
          onClick={() => changeTab(0)}
          className={`text-sm font-medium transition-colors hover:text-primary ${props.activePage === 0 && 'text-primary'}`}
        >
          Overview
        </button>
        <button
          onClick={() => changeTab(1)}
          className={`text-sm font-medium transition-colors hover:text-primary ${props.activePage === 1 && 'text-primary'}`}
        >
          <ListChecks />
        </button>
        <button
          onClick={() => changeTab(2)}
          className={`text-sm font-medium transition-colors hover:text-primary ${props.activePage === 2 && 'text-primary'}`}
        >
          <BookOpen />
        </button>
        <button
          onClick={() => changeTab(3)}
          className={`text-sm font-medium transition-colors hover:text-primary ${props.activePage === 3 && 'text-primary'}`}
        >
          <FileQuestion />
        </button>
      </nav>
    </>
  );
}
