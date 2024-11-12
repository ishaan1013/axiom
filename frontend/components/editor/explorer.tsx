import { FilesResponse, Workspace } from "@/lib/types";
import { useMemo, useState, useEffect } from "react";
import { TooltipButton } from "@/components/tooltip-button";
import {
  Download,
  MoreHorizontal,
  Plus,
  RotateCw,
  Trash,
  Upload,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import ConfirmModal from "./confirm";
import { downloadFile } from "@/lib/utils";

const MISC_FOLDER: FilesResponse[0] = {
  name: "Miscellaneous",
  files: [
    {
      name: "scratchpad.grg",
      path: "Miscellaneous/scratchpad.grg",
    },
  ],
};

function getStoredFolderState(folderId: string): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(`folder-${folderId}`);
  return stored === "true";
}

export default function Explorer({
  files,
  onFileClick,
  openUpload,
  disableUpload,
}: {
  files: FilesResponse;
  onFileClick: (
    path: string,
    name: string,
    workspaceId?: string,
    initialContent?: string
  ) => void;
  openUpload: () => void;
  disableUpload: boolean;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-2 py-2">
        <div className="font-semibold text-xs text-muted-foreground">
          Explorer
        </div>
        <TooltipButton
          variant="ghost"
          disabled={files.length === 0 || disableUpload}
          size="xsIcon"
          className="!text-muted-foreground"
          tooltip="Upload File (⌘U)"
          onClick={openUpload}
        >
          <Upload className="!size-3" />
        </TooltipButton>
      </div>
      <div className="overflow-y-auto flex-1 text-sm">
        <FolderItem
          key={MISC_FOLDER.name}
          folder={MISC_FOLDER}
          onFileClick={(path, name) => {
            if (path === "Miscellaneous/scratchpad.grg") {
              const content = localStorage.getItem(path) || "";
              onFileClick(path, name, undefined, content);
            } else {
              onFileClick(path, name);
            }
          }}
        />
        {files.map((folder) => (
          <FolderItem
            key={folder.name}
            folder={folder}
            onFileClick={onFileClick}
          />
        ))}
      </div>
    </div>
  );
}

function FolderItem({
  folder,
  onFileClick,
}: {
  folder: FilesResponse[0];
  onFileClick: (
    path: string,
    name: string,
    workspaceId?: string,
    initialContent?: string
  ) => void;
}) {
  const folderId = folder.name;
  const [isOpen, setIsOpen] = useState(() => getStoredFolderState(folderId));
  const files = folder.files.map((file) => ({ ...file, id: file.path }));

  useEffect(() => {
    if (folderId) {
      localStorage.setItem(`folder-${folderId}`, isOpen.toString());
    }
  }, [isOpen, folderId]);

  return (
    <div>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 hover:bg-muted w-full px-2 h-6 relative"
      >
        <span className="w-4 text-xs">{isOpen ? "▼" : "▶"}</span>
        {folder.name}
      </button>

      {isOpen && (
        <>
          {files.map((file) => (
            <File key={file.id} file={file} onFileClick={onFileClick} />
          ))}
        </>
      )}
    </div>
  );
}

function File({
  file,
  onFileClick,
  workspaceId,
}: {
  file: {
    name: string;
    path: string;
  };
  onFileClick: (
    path: string,
    name: string,
    workspaceId?: string,
    initialContent?: string
  ) => void;
  workspaceId?: string;
}) {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleDownload = () => {
    downloadFile(file.path);
  };

  return (
    <>
      <ConfirmModal
        open={isResetConfirmOpen}
        setOpen={setIsResetConfirmOpen}
        title="Reset File"
        description="Are you sure you want to reset this file? All changes will be lost."
        onConfirm={() => console.log("reset", file.path)}
      />
      <ContextMenu onOpenChange={setIsContextMenuOpen}>
        <ContextMenuTrigger asChild>
          <button
            onClick={() => onFileClick(file.path, file.name, workspaceId)}
            className={`hover:bg-muted w-full text-left pr-2 pl-7 py-0.5 relative group/file ${
              isContextMenuOpen || isDropdownOpen ? "bg-muted" : ""
            }`}
          >
            {file.name}
            <FileMenu
              path={file.path}
              isOpen={isDropdownOpen}
              setIsOpen={setIsDropdownOpen}
              handleDownload={handleDownload}
            />
          </button>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem onClick={handleDownload}>
            <Download className="!w-3 !h-3" /> Download
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setIsResetConfirmOpen(true)}>
            <RotateCw className="!w-3 !h-3" /> Reset
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}

function FileMenu({
  path,
  isOpen,
  setIsOpen,
  handleDownload,
}: {
  path: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleDownload: () => void;
}) {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  return (
    <>
      <ConfirmModal
        open={isResetConfirmOpen}
        setOpen={setIsResetConfirmOpen}
        title="Reset File"
        description="Are you sure you want to reset this file? All changes will be lost."
        onConfirm={() => console.log("reset", path)}
      />
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <div
            tabIndex={0}
            className={`absolute right-0 top-0 h-6 w-6 flex group-hover/file:visible items-center justify-center ${
              isOpen ? "visible" : "invisible"
            }`}
          >
            <MoreHorizontal className="w-3 h-3" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
          >
            <Download className="!w-3 !h-3" /> Download
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => setIsResetConfirmOpen(true)}>
            <RotateCw className="!w-3 !h-3" /> Reset
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
