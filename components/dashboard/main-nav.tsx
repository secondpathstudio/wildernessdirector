import Link from "next/link";

import { cn } from "@/lib/utils";
import { FC } from "react";

interface TopicNavProps {
  changeTab: (index: number) => void,
  activeTab: number
}

export const MainNav: FC<TopicNavProps> = ({ changeTab, ...props }) => {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6")}
      {...props}
    >
      <button
        onClick={() => changeTab(0)}
        className={`text-sm font-medium transition-colors hover:text-primary ${props.activeTab === 0 && 'text-primary'}`}
      >
        Overview
      </button>
      <button
        onClick={() => changeTab(1)}
        className={`text-sm font-medium transition-colors hover:text-primary ${props.activeTab === 1 && 'text-primary'}`}
      >
        Objectives
      </button>
      <button
        onClick={() => changeTab(2)}
        className={`text-sm font-medium transition-colors hover:text-primary ${props.activeTab === 3 && 'text-primary'}`}
      >
        Field Reports
      </button>
      <button
        onClick={() => changeTab(3)}
        className={`text-sm font-medium transition-colors hover:text-primary ${props.activeTab === 2 && 'text-primary'}`}
      >
        Questions
      </button>
    </nav>
  );
}
