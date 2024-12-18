"use client";

// React and hooks
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWindowSize } from "@uidotdev/usehooks";

// Monaco editor
import monaco from "monaco-editor";
import { BeforeMount, Editor, Monaco, OnMount } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";

// UI Components
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

// Local components
import Explorer from "./explorer";
import SettingsModal from "./settings";
import { UploadModal } from "./upload";
import Tabs from "./tabs";
import ManageAccessModal from "./access";
import Toolbar from "./toolbar";

// Types and utilities
import { FilesResponse, Tab } from "@/lib/types";
import { registerGeorge } from "@/lib/lang";
import { API_BASE_URL, askGeorge } from "@/lib/actions";
import { ImperativePanelHandle } from "react-resizable-panels";
import { toast } from "sonner";

// Collaboration
import * as Y from "yjs";
import { Socket, io } from "socket.io-client";

// Update the import to include useFiles
import { useFiles } from "@/lib/query";
import { useTheme } from "next-themes";

// Add import at the top
import { darkThemeOld, lightThemeOld } from "@/lib/colors";
import { createUserDecorationStyles } from "@/lib/decorations";
import { setupCollaboration, cleanupCollaboration } from "@/lib/collaboration";

import { useColorTheme } from "@/components/providers/color-context";

const sizes = {
  min: 140,
  default: 180,
};

export default function EditorLayout({
  files,
  userId,
}: {
  files: FilesResponse;
  userId: string;
}) {
  const { width } = useWindowSize();

  const { theme } = useTheme();

  const colorTheme = useColorTheme();
  const darkTheme = colorTheme?.darkTheme;
  const lightTheme = colorTheme?.lightTheme;

  const { data: filesData } = useFiles(files);

  const explorerRef = useRef<ImperativePanelHandle>(null);
  const outputRef = useRef<ImperativePanelHandle>(null);
  // Editor state
  const [editorRef, setEditorRef] =
    useState<monaco.editor.IStandaloneCodeEditor>();
  const [monacoInstance, setMonacoInstance] = useState<Monaco>();
  const [monacoBinding, setMonacoBinding] = useState<MonacoBinding | null>(
    null
  );

  // Tab state
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(-1);
  const activeId = useMemo(() => {
    if (activeTabIndex >= 0 && openTabs[activeTabIndex]) {
      const workspaceId = openTabs[activeTabIndex].workspaceId;
      return workspaceId ?? openTabs[activeTabIndex].path;
    }
    return undefined;
  }, [activeTabIndex, openTabs]);

  // Modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [manageAccessId, setManageAccessId] = useState<string | null>(null);

  // George state
  const [loading, setLoading] = useState(false);
  const [georgeResponse, setGeorgeResponse] = useState<string>("");

  // Collaboration state
  const workspaceDocsRef = useRef<Map<string, Y.Doc>>(new Map());
  const [socket, setSocket] = useState<Socket>();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>();

  const [decorationsCollection, setDecorationsCollection] =
    useState<monaco.editor.IEditorDecorationsCollection>();

  const [autoComplete, setAutoComplete] = useState(() => {
    const saved = localStorage.getItem("autoComplete");
    return saved !== null ? saved === "true" : true;
  });

  const [currentFilePath, setCurrentFilePath] = useState<string>();

  const [acceptSuggestionOnEnter, setAcceptSuggestionOnEnter] = useState(() => {
    const saved = localStorage.getItem("acceptSuggestionOnEnter");
    return saved !== null ? saved === "true" : true;
  });

  // Add state for socket connection status
  const [isConnected, setIsConnected] = useState(false);

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

  const handleAskGeorge = async () => {
    const body = editorRef?.getModel()?.getValue();
    if (!body || loading) return;

    setLoading(true);
    try {
      const response = await askGeorge(body);
      setGeorgeResponse(response);
      outputRef.current?.expand();
    } catch (error) {
      console.error(error);
      setGeorgeResponse("Error: Failed to get response from George");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Modern way to detect platform using userAgentData
      const isMac =
        "userAgentData" in navigator
          ? (navigator.userAgentData as any)?.platform
              ?.toLowerCase()
              .includes("mac")
          : /Mac|iPhone|iPod|iPad/.test(navigator.userAgent);

      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === "g") {
        e.preventDefault();
        handleAskGeorge();
      }
      if (cmdOrCtrl && e.key === "b") {
        e.preventDefault();
        toggleExplorer();
      }
      if (cmdOrCtrl && e.key === "j") {
        e.preventDefault();
        toggleOutput();
      }
      if (cmdOrCtrl && e.key === "k") {
        e.preventDefault();
        setIsSettingsOpen(true);
      }
      if (cmdOrCtrl && e.key === "u") {
        e.preventDefault();
        setIsUploadOpen(true);
      }
    },
    [
      handleAskGeorge,
      toggleExplorer,
      toggleOutput,
      setIsSettingsOpen,
      setIsUploadOpen,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  // Initialize socket connection
  useEffect(() => {
    const socket = io(API_BASE_URL, {
      auth: {
        userId,
      },
    });

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("error", (error: string) => {
      toast.error(error);
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const handleEditorContent = async (path: string, workspaceId?: string) => {
    if (!editorRef || !monacoInstance) return;

    // Set current file path
    setCurrentFilePath(path);

    // Cleanup previous
    monacoBinding?.destroy();

    if (workspaceId) {
      // Prevent multiple workspace connections
      if (activeWorkspaceId && activeWorkspaceId !== workspaceId) {
        toast.error("Close files from other workspace first");
        return;
      }

      // Setup model first
      const model = monacoInstance.editor.createModel("", "george");
      editorRef.setModel(model);

      try {
        const { doc, binding, awareness } = await setupCollaboration({
          socket: socket!,
          path,
          workspaceId,
          editor: editorRef,
          model,
          userId,
          decorationsCollection: decorationsCollection!,
        });

        workspaceDocsRef.current.set(path, doc);
        setMonacoBinding(binding);

        // Add socket listener for awareness updates
        socket?.on(
          "awareness-update",
          ({ path: updatePath, clientId: updateClientId, state }) => {
            console.log("Received awareness update:", {
              path: updatePath,
              clientId: updateClientId,
              state,
            });

            if (decorationsCollection) {
              // Only process awareness if paths match and it's a different user
              if (
                updatePath === currentFilePath && // Compare with current file path
                updatePath === path &&
                updateClientId !== socket.id &&
                state?.user
              ) {
                awareness.getStates().set(updateClientId, state);

                // Clear previous decorations for this user
                const styleEl = document.getElementById(
                  `user-${updateClientId}-style`
                );
                if (styleEl) {
                  styleEl.remove();
                }

                // Update cursor decorations
                if (state.user?.cursor) {
                  const { position, selection } = state.user.cursor;
                  const decorations: monaco.editor.IModelDeltaDecoration[] = [];

                  // Add cursor line
                  decorations.push({
                    range: new monacoInstance.Range(
                      position.lineNumber,
                      position.column,
                      position.lineNumber,
                      position.column + 1
                    ),
                    options: {
                      className: `cursor-${updateClientId}`,
                      beforeContentClassName: `cursor-${updateClientId}-line`,
                      hoverMessage: {
                        value: `**${state.user.name}**`,
                        isTrusted: true,
                        supportThemeIcons: true,
                      },
                    },
                  });

                  // Add selection if exists
                  if (selection) {
                    decorations.push({
                      range: new monacoInstance.Range(
                        selection.startLineNumber,
                        selection.startColumn,
                        selection.endLineNumber,
                        selection.endColumn
                      ),
                      options: {
                        className: `selection-${updateClientId}`,
                      },
                    });
                  }

                  // Update styles
                  const styleId = `user-${updateClientId}-style`;
                  let styleEl = document.getElementById(styleId);
                  if (!styleEl) {
                    styleEl = document.createElement("style");
                    styleEl.id = styleId;
                    document.head.appendChild(styleEl);
                  }

                  styleEl.textContent = createUserDecorationStyles(
                    updateClientId,
                    state.user.color
                  );

                  // Clear previous decorations and set new ones
                  decorationsCollection.clear();
                  decorationsCollection.set(decorations);
                }
              } else {
                // Remove decorations if user switched to different file
                decorationsCollection.clear();
                const styleEl = document.getElementById(
                  `user-${updateClientId}-style`
                );
                styleEl?.remove();
              }
            }
          }
        );

        // Add user left handler
        socket?.on("user-left", ({ clientId, userId }) => {
          // Remove cursor decorations for disconnected user
          if (decorationsCollection) {
            decorationsCollection.clear();
          }
          const styleEl = document.getElementById(`user-${clientId}-style`);
          styleEl?.remove();

          // Show toast notification
          toast.info(`${userId} left the workspace`);
        });
      } catch (error) {
        console.error("Failed to setup collaboration:", error);
        toast.error("Failed to setup collaboration");
      }
    } else {
      // Local file
      const content = localStorage.getItem(path) || "";
      const model = monacoInstance.editor.createModel(content, "george");
      editorRef.setModel(model);

      model.onDidChangeContent(() => {
        localStorage.setItem(path, model.getValue());
      });
    }
  };

  const handleFileClick = async (
    path: string,
    name: string,
    workspaceId?: string
  ) => {
    // Check if trying to open file from different workspace
    if (workspaceId && activeWorkspaceId && workspaceId !== activeWorkspaceId) {
      const workspaceName = openTabs.find(
        (tab) => tab.workspaceId === activeWorkspaceId
      )?.name;
      toast.error(
        workspaceName
          ? `Another workspace (${workspaceName}) is already open.`
          : "Another workspace is already open."
      );
      return;
    }

    const existingIndex = openTabs.findIndex((tab) => tab.path === path);

    if (existingIndex >= 0) {
      setActiveTabIndex(existingIndex);
    } else {
      if (workspaceId) {
        setActiveWorkspaceId(workspaceId);
        // Add the tab first
        setOpenTabs((prev) => [...prev, { path, name, workspaceId }]);
        setActiveTabIndex(openTabs.length);
        // Immediately handle the editor content
        if (editorRef && monacoInstance) {
          await handleEditorContent(path, workspaceId);
        }
      } else {
        setOpenTabs((prev) => [...prev, { path, name }]);
        setActiveTabIndex(openTabs.length);
      }
    }
  };

  // Clean up when closing tabs
  const handleTabClose = (indexToClose: number) => {
    const closingTab = openTabs[indexToClose];

    // Clean up decorations for this tab
    decorationsCollection?.clear();

    setOpenTabs((prevTabs) => {
      const newTabs = prevTabs.filter((_, i) => i !== indexToClose);

      // Clean up workspace doc and connection if needed
      if (closingTab.workspaceId) {
        workspaceDocsRef.current.delete(closingTab.path);
        const hasOtherWorkspaceTabs = newTabs.some(
          (tab) => tab.workspaceId === closingTab.workspaceId
        );
        if (!hasOtherWorkspaceTabs) {
          setActiveWorkspaceId(undefined);
          socket?.emit("leaveRoom", {
            workspaceId: closingTab.workspaceId,
          });
        }
      }

      // Handle active tab updates
      if (indexToClose === activeTabIndex) {
        const newIndex =
          indexToClose === prevTabs.length - 1
            ? indexToClose - 1
            : indexToClose;
        if (newIndex >= 0 && newTabs[newIndex]) {
          setActiveTabIndex(newIndex);
        } else {
          setActiveTabIndex(-1);
        }
      } else if (indexToClose < activeTabIndex) {
        setActiveTabIndex(activeTabIndex - 1);
      }

      return newTabs;
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        cleanupCollaboration({
          socket,
          workspaceDocs: workspaceDocsRef.current,
          binding: monacoBinding,
          decorationsCollection,
        });
      }
    };
  }, []);

  useEffect(() => {
    if (activeTabIndex >= 0 && openTabs[activeTabIndex]) {
      const tab = openTabs[activeTabIndex];
      handleEditorContent(tab.path, tab.workspaceId);
    }
  }, [activeTabIndex, openTabs, activeId]);

  useEffect(() => {
    if (editorRef) {
      editorRef.updateOptions({
        quickSuggestions: autoComplete,
        suggestOnTriggerCharacters: autoComplete,
        parameterHints: { enabled: autoComplete },
        acceptSuggestionOnEnter: acceptSuggestionOnEnter ? "on" : "off",
      });
    }
  }, [autoComplete, acceptSuggestionOnEnter]);

  const handleUpload = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file || !editorRef) return;

      setIsUploadOpen(false);

      const content = await file.text();
      const model = editorRef.getModel();
      if (model) {
        model.setValue(content);
      }
    },
    [editorRef]
  );

  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!monacoInstance) return;
    console.log("Updating Monaco theme from editor");
    monacoInstance.editor.defineTheme(
      "dark",
      darkTheme ? darkTheme : darkThemeOld
    );
    monacoInstance.editor.defineTheme(
      "light",
      lightTheme ? lightTheme : lightThemeOld
    );
    monacoInstance.editor.setTheme(resolvedTheme === "dark" ? "dark" : "light");
  }, [monacoInstance, resolvedTheme, darkTheme, lightTheme]);

  if (!width) return null;

  const percentSizes = {
    min: (sizes.min / width) * 100,
    default: (sizes.default / width) * 100,
  };

  const handleEditorWillMount: BeforeMount = (monaco) => {
    // Remove all keybindings we want to handle globally
    monaco.editor.addKeybindingRules([
      {
        keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG,
        command: null,
      },
      {
        keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB,
        command: null,
      },
      {
        keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ,
        command: null,
      },
      {
        keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
        command: null,
      },
      {
        keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU,
        command: null,
      },
    ]);
  };

  const handleEditorMount: OnMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    setEditorRef(editor);
    setMonacoInstance(monaco);

    monaco.editor.setTheme("dark");

    registerGeorge(editor, monaco);
    monaco.editor.setModelLanguage(editor.getModel()!, "george");

    // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
    //     setIsSettingsOpen(true);
    // });

    // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG, () => {
    //     handleAskGeorge();
    // });

    const decorationsCollection = editor.createDecorationsCollection();
    setDecorationsCollection(decorationsCollection);

    editor.updateOptions({
      quickSuggestions: autoComplete,
      suggestOnTriggerCharacters: autoComplete,
      parameterHints: { enabled: autoComplete },
    });
  };

  return (
    <>
      <ManageAccessModal
        open={!!manageAccessId}
        setOpen={(open) => setManageAccessId(open ? manageAccessId : null)}
        workspaceId={manageAccessId}
        userId={userId}
      />
      <SettingsModal
        open={isSettingsOpen}
        setOpen={setIsSettingsOpen}
        userId={userId}
        autoComplete={autoComplete}
        setAutoComplete={setAutoComplete}
        acceptSuggestionOnEnter={acceptSuggestionOnEnter}
        setAcceptSuggestionOnEnter={setAcceptSuggestionOnEnter}
        isConnected={isConnected}
      />
      <UploadModal
        open={isUploadOpen}
        setOpen={setIsUploadOpen}
        handleUpload={handleUpload}
      />
      <div className="w-full h-full flex flex-col">
        <Toolbar
          loading={loading}
          activeTabIndex={activeTabIndex}
          handleAskGeorge={handleAskGeorge}
          toggleExplorer={toggleExplorer}
          toggleOutput={toggleOutput}
          setIsSettingsOpen={setIsSettingsOpen}
        />
        <ResizablePanelGroup
          className="grow"
          direction="horizontal"
          autoSaveId="explorer-editor"
        >
          <ResizablePanel
            ref={explorerRef}
            collapsible
            maxSize={40}
            defaultSize={percentSizes.default}
            minSize={percentSizes.min}
          >
            <Explorer
              userId={userId}
              files={filesData}
              onFileClick={handleFileClick}
              openUpload={() => setIsUploadOpen(true)}
              openAccess={(workspaceId) => setManageAccessId(workspaceId)}
              disableUpload={activeTabIndex === -1}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={85}>
            <ResizablePanelGroup
              direction="vertical"
              autoSaveId="editor-output"
            >
              <ResizablePanel defaultSize={100}>
                <div
                  className={`flex flex-col w-full h-full ${
                    openTabs.length === 0 ? "invisible" : ""
                  }`}
                >
                  <Tabs
                    tabs={openTabs}
                    activeTabIndex={activeTabIndex}
                    onTabClick={setActiveTabIndex}
                    onTabClose={handleTabClose}
                  />
                  <Editor
                    beforeMount={handleEditorWillMount}
                    onMount={handleEditorMount}
                    className="grow"
                    theme="vs-dark"
                    options={{
                      minimap: {
                        enabled: false,
                      },
                      padding: {
                        bottom: 4,
                        top: 4,
                      },
                      scrollBeyondLastLine: true,
                      fixedOverflowWidgets: true,
                      autoClosingBrackets: "always",
                      autoClosingQuotes: "always",
                      autoIndent: "full",
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel
                ref={outputRef}
                collapsible
                defaultSize={0}
                maxSize={80}
                minSize={20}
              >
                <div
                  className={`p-4 h-full overflow-auto whitespace-pre-wrap font-mono text-sm ${
                    georgeResponse ? "" : "text-muted-foreground"
                  }`}
                >
                  {georgeResponse || "No response."}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
