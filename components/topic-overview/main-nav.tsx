import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";
import { BookOpen, FileQuestion, ListChecks } from "lucide-react";

export interface NavTab {
  label: string;
  // shown on mobile; the first tab always shows its label
  icon: ReactNode | null;
}

const DEFAULT_TABS: NavTab[] = [
  { label: "Overview", icon: null },
  { label: "Objectives", icon: <ListChecks /> },
  { label: "Field Reports", icon: <BookOpen /> },
  { label: "Questions", icon: <FileQuestion /> },
];

interface TopicNavProps {
  changeTab: (index: number) => void,
  activePage: number,
  tabs?: NavTab[],
}

export const MainNav: FC<TopicNavProps> = ({ changeTab, tabs, ...props }) => {
  const navTabs = tabs ?? DEFAULT_TABS;
  return (
    <>
      <nav
        className={cn("hidden md:flex items-center space-x-4 lg:space-x-6")}
        {...props}
      >
        {navTabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => changeTab(i)}
            className={`text-sm font-medium transition-colors hover:text-primary ${props.activePage === i && 'text-primary'}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <nav
        className={cn("flex md:hidden items-center w-full justify-between space-x-4 lg:space-x-6")}
        {...props}
      >
        {navTabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => changeTab(i)}
            className={`text-sm font-medium transition-colors hover:text-primary ${props.activePage === i && 'text-primary'}`}
          >
            {tab.icon ?? tab.label}
          </button>
        ))}
      </nav>
    </>
  );
}
