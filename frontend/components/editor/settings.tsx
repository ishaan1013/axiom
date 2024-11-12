import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Keyboard, FileCode2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { Switch } from "@/components/ui/switch";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Category = "editor" | "shortcuts" | "invites";

const categories = [
  { id: "editor" as const, label: "Code Editor", icon: FileCode2 },
  { id: "shortcuts" as const, label: "Shortcuts", icon: Keyboard },
];

const shortcuts = [
  { label: "Ask George", shortcut: "⌘G" },
  { label: "Toggle Sidebar", shortcut: "⌘B" },
  { label: "Toggle Output", shortcut: "⌘J" },
  { label: "Open Settings", shortcut: "⌘K" },
  { label: "Upload File", shortcut: "⌘U" },
];

export default function SettingsModal({
  open,
  setOpen,
  autoComplete,
  setAutoComplete,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  autoComplete: boolean;
  setAutoComplete: (autoComplete: boolean) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<Category>("editor");

  useEffect(() => {
    if (!open) setActiveCategory("editor");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0 gap-0">
        <div className="flex h-96">
          <div className="border-r p-2 space-y-0.5 w-48 bg-tabs-bg">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                }}
                variant={activeCategory === category.id ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </Button>
            ))}
          </div>
          <div className="grow">
            <div className="flex items-center p-4 pb-0 gap-1">
              <div className="font-semibold">
                {categories.find((c) => c.id === activeCategory)?.label}
              </div>
            </div>
            <div className="p-4 overflow-y-auto">
              {activeCategory === "editor" ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <label>Theme</label>
                    <Select defaultValue="dark">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between h-8">
                    <div className="flex items-center gap-2">
                      <label>Auto Complete</label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="size-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Toggle code completion suggestions
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      checked={autoComplete}
                      onCheckedChange={(checked) => {
                        setAutoComplete(checked);
                        localStorage.setItem("autoComplete", String(checked));
                      }}
                    />
                  </div>
                </div>
              ) : activeCategory === "shortcuts" ? (
                <div className="space-y-2 text-sm">
                  {shortcuts.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      <span className="w-8 justify-center py-0.5 inline-flex text-muted-foreground border rounded border-b-2 bg-muted/25">
                        {item.shortcut}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
