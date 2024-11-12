import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Tab } from "@/lib/types";
import { useState } from "react";

interface TabsProps {
  tabs: Tab[];
  activeTabIndex: number;
  onTabClick: (index: number) => void;
  onTabClose: (index: number) => void;
}

export default function Tabs({
  tabs,
  activeTabIndex,
  onTabClick,
  onTabClose,
}: TabsProps) {
  return (
    <div className="w-full h-10 bg-tabs-bg shrink-0 flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {tabs.map((tab, index) => (
        <TabComponent
          key={tab.path}
          tab={tab}
          index={index}
          activeTabIndex={activeTabIndex}
          onTabClick={onTabClick}
          onTabClose={onTabClose}
        />
      ))}
      <div className="grow border-b"></div>
    </div>
  );
}

function TabComponent({
  tab,
  index,
  activeTabIndex,
  onTabClick,
  onTabClose,
}: {
  tab: Tab;
  index: number;
  activeTabIndex: number;
  onTabClick: (index: number) => void;
  onTabClose: (index: number) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      key={tab.path}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onTabClick(index)}
      className={cn(
        "group flex border-r border-b justify-center items-center pl-2.5 pr-1.5 gap-0.5 text-sm",
        index === activeTabIndex
          ? "bg-background border-b-background"
          : "text-muted-foreground"
      )}
    >
      {tab.name}
      {isHovered ? (
        <div
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onTabClose(index);
          }}
          className={cn(
            "inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent bg-transparent size-5",
            index === activeTabIndex
              ? "text-accent-foreground"
              : "text-muted-foreground"
          )}
        >
          <X className="size-3.5" />
        </div>
      ) : (
        <div className="size-5" />
      )}
    </button>
  );
}
