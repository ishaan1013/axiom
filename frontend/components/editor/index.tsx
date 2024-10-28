"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { PanelBottom, PanelLeft, Settings } from "lucide-react";
import { useEffect, useRef } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";

import { TooltipButton } from "@/components/tooltipButton";
// import useScreenSize from "@/hooks/useScreenSize";
import { useWindowSize } from "@uidotdev/usehooks";
import Explorer from "./explorer";
import { FilesResponse } from "@/lib/types";

const sizes = {
  min: 100,
  default: 150,
};

export default function Editor({ files }: { files: FilesResponse }) {
  const { width } = useWindowSize();

  const explorerRef = useRef<ImperativePanelHandle>(null);
  const outputRef = useRef<ImperativePanelHandle>(null);

  const toggleExplorer = () => {
    const panel = explorerRef.current;
    if (panel) {
      if (panel.isCollapsed()) {
        panel.expand();
      } else {
        panel.collapse();
      }
    }
  };
  const toggleOutput = () => {
    const panel = outputRef.current;
    if (panel) {
      if (panel.isCollapsed()) {
        panel.expand();
      } else {
        panel.collapse();
      }
    }
  };

  const handleAskGeorge = () => {
    console.log("ask george");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey && e.key === "Enter") {
      e.preventDefault();
      handleAskGeorge();
    }
    if (e.metaKey && e.key === "b") {
      e.preventDefault();
      toggleExplorer();
    }
    if (e.metaKey && e.key === "j") {
      e.preventDefault();
      toggleOutput();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!width) return null;

  const percentSizes = {
    min: (sizes.min / width) * 100,
    default: (sizes.default / width) * 100,
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex items-center justify-between border-b p-1.5 px-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="font-semibold">SE212</div>
          <TooltipButton
            variant="secondary"
            size="sm"
            onClick={handleAskGeorge}
            tooltip="Ask George (⌘⏎)"
          >
            Ask George
          </TooltipButton>
        </div>
        <div className="flex items-center">
          <TooltipButton
            variant="ghost"
            size="smIcon"
            onClick={toggleExplorer}
            tooltip="Toggle Explorer (⌘B)"
          >
            <PanelLeft />
          </TooltipButton>
          <TooltipButton
            variant="ghost"
            size="smIcon"
            onClick={toggleOutput}
            tooltip="Toggle Explorer (⌘J)"
          >
            <PanelBottom />
          </TooltipButton>

          <TooltipButton variant="ghost" size="smIcon" tooltip="Settings (⌘K)">
            <Settings />
          </TooltipButton>
        </div>
      </div>
      <ResizablePanelGroup className="grow" direction="horizontal">
        <ResizablePanel
          ref={explorerRef}
          collapsible
          maxSize={40}
          defaultSize={percentSizes.default}
          minSize={percentSizes.min}
        >
          <Explorer files={files} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={85}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={100}>Code</ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
              ref={outputRef}
              collapsible
              defaultSize={0}
              maxSize={50}
              minSize={10}
            >
              Output
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}