import { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

export const registerGeorge: OnMount = (editor, monaco) => {
  // Register the george language
  monaco.languages.register({ id: "george" });

  // Set language configuration for auto-closing brackets
  monaco.languages.setLanguageConfiguration("george", {
    surroundingPairs: [{ open: "{", close: "}" }],
    autoClosingPairs: [{ open: "{", close: "}" }],
    indentationRules: {
      increaseIndentPattern: /{$/,
      decreaseIndentPattern: /^}/,
    },
    brackets: [
      ["{", "}"], // Only define curly braces as brackets
    ],
    onEnterRules: [
      {
        // Match lines that start with a number followed by ")"
        beforeText: /^\s*(\d+)\).*$/,
        action: {
          indentAction: monaco.languages.IndentAction.None,
          appendText: "\n",
          removeText: 0,
        },
      },
    ],
    comments: {
      lineComment: "//",
    },
  });

  // Define syntax highlighting rules
  monaco.languages.setMonarchTokensProvider("george", {
    tokenizer: {
      root: [
        // Comments - must be before other rules
        [/\/\/.*$/, "comment"],

        // Source constants (#q, #u, #a)
        [/#[qua]/, "constant.other"],

        // Check statements
        [/#check\s+(PROP|ND|PC|Z|TP|ST|PRED|NONE)\b/, "constant.other"],

        // Line numbers - must be before regular numbers
        [/^\s*\d+\)/, "variable.language"],

        // Keywords
        [
          /\b(by|on|forall|exists|schema|pred|end|proc|fun|assert|if|then|else|while|do)\b/,
          "keyword",
        ],

        // Built-in constants
        [/\b(true|false|empty|univ|N)\b/, "string"],

        // Language constants (proof rules)
        [
          /\b(and_i|and_e|or_i|or_e|lem|imp_e|not_e|not_not_i|not_not_e|iff_i|iff_e|trans|iff_mp|exists_i|forall_e|eq_i|eq_e|premise|raa|cases|imp_i|forall_i|exists_e|disprove|case|assume|for every|for some|and_nb|not_and_br|or_br|not_or_nb|imp_br|not_imp_nb|not_not_nb|iff_br|not_iff_br|forall_nb|not_forall_nb|exists_nb|not_exists_nb|closed|comm_assoc|contr|lem|impl|contrapos|simp1|simp2|distr|dm|neg|equiv|idemp|forall_over_and|exists_over_or|swap_vars|move_exists|move_forall|set|arith|Delta|Xi)\b/,
          "constant.language",
        ],

        // Operators
        [
          /\b(in|sube|sub|pow|union|inter|card|gen_U|dom|ran|id|iter|seq)\b/,
          "constant.numeric",
        ],

        // Special symbols
        [/[&()+:;=\|\-<>?!]/, "constant.numeric"],

        // Identifiers with numbers - must be before standalone numbers
        [/[a-zA-Z_]\w*/, "identifier"],

        // Standalone numbers - moved to end
        [/\b\d+\b/, "variable.language"],
      ],
    },
  });

  // Register completions - fixed type signature
  monaco.languages.registerCompletionItemProvider("george", {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [
        // Checks
        {
          label: "check ND",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "check ND",
          range,
        },
        {
          label: "check TP",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "check TP",
          range,
        },
        {
          label: "check ST",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "check ST",
          range,
        },
        {
          label: "check PROP",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "check PROP",
          range,
        },
        {
          label: "check Z",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "check Z",
          range,
        },
        {
          label: "check PC",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "check PC",
          range,
        },
        {
          label: "check NONE",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "check NONE",
          range,
        },

        // Keywords
        {
          label: "false",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "false",
          range,
        },
        {
          label: "true",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "true",
          range,
        },

        // Natural deduction rules
        {
          label: "and_i",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "and_i",
          range,
        },
        {
          label: "and_e",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "and_e",
          range,
        },
        {
          label: "or_i",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "or_i",
          range,
        },
        {
          label: "or_e",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "or_e",
          range,
        },
        {
          label: "imp_e",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "imp_e",
          range,
        },
        {
          label: "imp_i",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "imp_i",
          range,
        },
        {
          label: "not_e",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "not_e",
          range,
        },
        {
          label: "not_not_i",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "not_not_i",
          range,
        },
        {
          label: "not_not_e",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "not_not_e",
          range,
        },
        {
          label: "iff_i",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "iff_i",
          range,
        },
        {
          label: "iff_e",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "iff_e",
          range,
        },
        {
          label: "iff_mp",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "iff_mp",
          range,
        },
        {
          label: "exists_i",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "exists_i",
          range,
        },
        {
          label: "exists_e",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "exists_e",
          range,
        },
        {
          label: "forall_i",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "forall_i",
          range,
        },
        {
          label: "forall_e",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "forall_e",
          range,
        },
        {
          label: "eq_i",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "eq_i",
          range,
        },
        {
          label: "eq_e",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "eq_e",
          range,
        },
        {
          label: "premise",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "premise",
          range,
        },
        {
          label: "raa",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "raa",
          range,
        },
        {
          label: "cases",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "cases",
          range,
        },
        {
          label: "case",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "case",
          range,
        },
        {
          label: "assume",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "assume",
          range,
        },
        {
          label: "disprove",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "disprove",
          range,
        },

        // Semantic tableaux rules
        {
          label: "and_nb",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "and_nb",
          range,
        },
        {
          label: "not_and_br",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "not_and_br",
          range,
        },
        {
          label: "or_br",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "or_br",
          range,
        },
        {
          label: "not_or_nb",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "not_or_nb",
          range,
        },
        {
          label: "imp_br",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "imp_br",
          range,
        },
        {
          label: "not_imp_nb",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "not_imp_nb",
          range,
        },
        {
          label: "not_not_nb",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "not_not_nb",
          range,
        },
        {
          label: "iff_br",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "iff_br",
          range,
        },
        {
          label: "not_iff_br",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "not_iff_br",
          range,
        },
        {
          label: "forall_nb",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "forall_nb",
          range,
        },
        {
          label: "not_forall_nb",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "not_forall_nb",
          range,
        },
        {
          label: "exists_nb",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "exists_nb",
          range,
        },
        {
          label: "not_exists_nb",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "not_exists_nb",
          range,
        },

        // Transformational rules
        {
          label: "comm_assoc",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "comm_assoc",
          range,
        },
        {
          label: "contr",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "contr",
          range,
        },
        {
          label: "lem",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "lem",
          range,
        },
        {
          label: "impl",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "impl",
          range,
        },
        {
          label: "contrapos",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "contrapos",
          range,
        },
        {
          label: "simp1",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "simp1",
          range,
        },
        {
          label: "simp2",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "simp2",
          range,
        },
        {
          label: "distr",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "distr",
          range,
        },
        {
          label: "dm",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "dm",
          range,
        },
        {
          label: "neg",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "neg",
          range,
        },
        {
          label: "equiv",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "equiv",
          range,
        },
        {
          label: "idemp",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "idemp",
          range,
        },
        {
          label: "forall_over_and",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "forall_over_and",
          range,
        },
        {
          label: "exists_over_or",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "exists_over_or",
          range,
        },
        {
          label: "swap_vars",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "swap_vars",
          range,
        },
        {
          label: "move_exists",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "move_exists",
          range,
        },
        {
          label: "move_forall",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "move_forall",
          range,
        },

        // Set operations
        {
          label: "card()",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "card()",
          range,
        },
        {
          label: "pow()",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "pow()",
          range,
        },
        {
          label: "dom()",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "dom()",
          range,
        },
        {
          label: "ran()",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "ran()",
          range,
        },
      ];

      return { suggestions };
    },
  });

  // Define theme colors
  monaco.editor.defineTheme("george", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "666666" },
      { token: "constant.other", foreground: "569CD6" },
      { token: "keyword", foreground: "C586C0" },
      { token: "constant.language", foreground: "4EC9B0" },
      { token: "constant.numeric", foreground: "B5CEA8" },
      { token: "string", foreground: "CE9178" },
      { token: "variable.language", foreground: "9CDCFE" },
      { token: "string.regexp", foreground: "D16969" },
    ],
    colors: {
      "editor.foreground": "#D4D4D4",
      "editor.background": "#0A0A0A",
    },
  });

  // Set the theme
  monaco.editor.setTheme("george");

  // Helper function to update references in a line
  const updateReferences = (
    content: string,
    startNumber: number,
    increment: boolean
  ) => {
    // Match numbers after "on" that are references, capturing spaces
    return content.replace(/\bon\s+(\d+(?:\s*,\s*\d+)*)/g, (match, numbers) => {
      // Split by comma but capture whitespace
      const refs = numbers.split(/(\s*,\s*)/);
      const updatedRefs = refs.map((part: string) => {
        // If it's a comma with whitespace, preserve it
        if (part.includes(",")) {
          return part;
        }
        // If it's a number, update it
        const num = parseInt(part.trim());
        if (!isNaN(num) && num >= startNumber) {
          return increment ? num + 1 : num - 1;
        }
        return part;
      });
      return `on ${updatedRefs.join("")}`;
    });
  };

  // Add enter key handler to editor
  editor.onKeyDown((e) => {
    const model = editor.getModel();
    if (!model) return;

    const position = editor.getPosition();
    if (!position) return;

    // Handle Enter key for incrementing
    if (e.keyCode === monaco.KeyCode.Enter) {
      const lineContent = model.getLineContent(position.lineNumber);

      // Check if cursor is between braces
      if (
        lineContent.trim().endsWith("{}") &&
        position.column === lineContent.indexOf("}") + 1
      ) {
        e.preventDefault();
        const currentIndent = lineContent.match(/^\s*/)?.[0] || "";
        const additionalIndent = "\t"; // Tab for nested indent

        // Insert new line with proper indentation
        const operations = [
          {
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
            text:
              "\n" + currentIndent + additionalIndent + "\n" + currentIndent,
          },
        ];

        model.pushEditOperations([], operations, () => null);

        // Position cursor on the indented line
        editor.setPosition({
          lineNumber: position.lineNumber + 1,
          column: (currentIndent + additionalIndent).length + 1,
        });
        return;
      }

      // Check for empty line number
      const emptyMatch = lineContent.match(/^\s*(\d+)\)\s*$/);
      if (emptyMatch) {
        e.preventDefault();
        const currentIndent = lineContent.match(/^\s*/)?.[0] || "";

        // Replace the line with just the indentation
        const operations = [
          {
            range: new monaco.Range(
              position.lineNumber,
              1,
              position.lineNumber,
              lineContent.length + 1
            ),
            text: currentIndent,
          },
        ];

        model.pushEditOperations([], operations, () => null);
        editor.setPosition({
          lineNumber: position.lineNumber,
          column: currentIndent.length + 1,
        });
        return;
      }

      const match = lineContent.match(/^\s*(\d+)\)/);
      if (match) {
        e.preventDefault();
        const currentNumber = parseInt(match[1]);
        const currentIndent = lineContent.match(/^\s*/)?.[0] || "";

        // Get sequential lines after current position
        const followingLines = [];
        let expectedNumber = currentNumber + 1;
        for (let i = position.lineNumber + 1; i <= model.getLineCount(); i++) {
          const line = model.getLineContent(i);
          const numMatch = line.match(/^\s*(\d+)\)/);
          if (numMatch) {
            const lineNum = parseInt(numMatch[1]);
            if (lineNum !== expectedNumber) break;
            followingLines.push({
              lineNumber: i,
              number: lineNum,
              content: line,
              indent: line.match(/^\s*/)?.[0] || "",
            });
            expectedNumber++;
          }
        }

        // Insert new line with incremented number
        const newNumber = currentNumber + 1;
        const newLine = `${currentIndent}${newNumber}) `;

        const operations = [
          {
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
            text: "\n" + newLine,
          },
          ...followingLines.map((line) => {
            const updatedContent = updateReferences(
              line.content,
              currentNumber + 1,
              true
            );
            return {
              range: new monaco.Range(
                line.lineNumber,
                1,
                line.lineNumber,
                line.content.length + 1
              ),
              text: updatedContent.replace(
                /^\s*\d+\)/,
                `${line.indent}${line.number + 1})`
              ),
            };
          }),
        ];

        model.pushEditOperations([], operations, () => null);
        editor.setPosition({
          lineNumber: position.lineNumber + 1,
          column: newLine.length + 1,
        });
      }
    }

    // Handle Backspace/Delete for decrementing
    if (
      e.keyCode === monaco.KeyCode.Backspace ||
      e.keyCode === monaco.KeyCode.Delete
    ) {
      const selection = editor.getSelection();
      if (!selection) return;

      const lineContent = model.getLineContent(position.lineNumber);
      const match = lineContent.match(/^\s*(\d+)\)/);

      // If there's a multi-line selection
      if (!selection.isEmpty()) {
        const startLine = selection.startLineNumber;
        const endLine = selection.endLineNumber;

        // Get the first numbered line after the selection
        let nextNumberedLine = endLine + 1;
        let followingLines = [];
        let expectedNumber;

        // Find the first numbered line before the selection
        let lastNumberBeforeSelection: number | undefined;
        for (let i = startLine - 1; i > 0; i--) {
          const line = model.getLineContent(i);
          const numMatch = line.match(/^\s*(\d+)\)/);
          if (numMatch) {
            lastNumberBeforeSelection = parseInt(numMatch[1]);
            break;
          }
        }

        // If we found a numbered line before the selection
        if (lastNumberBeforeSelection !== undefined) {
          expectedNumber = lastNumberBeforeSelection + 1;

          // Collect following sequential lines
          for (let i = nextNumberedLine; i <= model.getLineCount(); i++) {
            const line = model.getLineContent(i);
            const numMatch = line.match(/^\s*(\d+)\)/);
            if (numMatch) {
              const lineNum = parseInt(numMatch[1]);
              if (expectedNumber === undefined) {
                expectedNumber = lineNum;
              } else if (lineNum !== expectedNumber) {
                break;
              }
              followingLines.push({
                lineNumber: i,
                number: lineNum,
                content: line,
                indent: line.match(/^\s*/)?.[0] || "",
              });
              expectedNumber++;
            }
          }

          // If there are following lines to update
          if (followingLines.length > 0) {
            const operations = followingLines.map((line) => {
              const updatedContent = updateReferences(
                line.content,
                currentNumber + 1,
                false
              );
              return {
                range: new monaco.Range(
                  line.lineNumber,
                  1,
                  line.lineNumber,
                  line.content.length + 1
                ),
                text: updatedContent.replace(
                  /^\s*\d+\)/,
                  `${line.indent}${line.number - 1})`
                ),
              };
            });

            // Let the delete happen first, then update line numbers
            setTimeout(() => {
              model.pushEditOperations([], operations, () => null);
            }, 0);
          }
        }
        return;
      }

      if (!match) return;
      const currentNumber = parseInt(match[1]);
      const currentIndent = lineContent.match(/^\s*/)?.[0] || "";

      // Get sequential lines after current position
      const followingLines = [];
      let expectedNumber = currentNumber + 1;
      for (let i = position.lineNumber + 1; i <= model.getLineCount(); i++) {
        const line = model.getLineContent(i);
        const numMatch = line.match(/^\s*(\d+)\)/);
        if (numMatch) {
          const lineNum = parseInt(numMatch[1]);
          if (lineNum !== expectedNumber) break;
          followingLines.push({
            lineNumber: i,
            number: lineNum,
            content: line,
            indent: line.match(/^\s*/)?.[0] || "",
          });
          expectedNumber++;
        }
      }

      // If there are following lines to update, create the operations
      if (followingLines.length > 0) {
        const operations = followingLines.map((line) => {
          const updatedContent = updateReferences(
            line.content,
            currentNumber + 1,
            false
          );
          return {
            range: new monaco.Range(
              line.lineNumber,
              1,
              line.lineNumber,
              line.content.length + 1
            ),
            text: updatedContent.replace(
              /^\s*\d+\)/,
              `${line.indent}${line.number - 1})`
            ),
          };
        });

        // Let the delete/backspace happen first, then update line numbers
        setTimeout(() => {
          model.pushEditOperations([], operations, () => null);
        }, 0);
      }
    }

    // Handle Cmd+X (or Ctrl+X) for line deletion
    if (e.keyCode === monaco.KeyCode.KeyX && (e.metaKey || e.ctrlKey)) {
      const lineContent = model.getLineContent(position.lineNumber);
      const match = lineContent.match(/^\s*(\d+)\)/);

      if (match) {
        const currentNumber = parseInt(match[1]);

        // Get sequential lines after current position
        const followingLines = [];
        let expectedNumber = currentNumber + 1;
        for (let i = position.lineNumber + 1; i <= model.getLineCount(); i++) {
          const line = model.getLineContent(i);
          const numMatch = line.match(/^\s*(\d+)\)/);
          if (numMatch) {
            const lineNum = parseInt(numMatch[1]);
            if (lineNum !== expectedNumber) break;
            followingLines.push({
              lineNumber: i,
              number: lineNum,
              content: line,
              indent: line.match(/^\s*/)?.[0] || "",
            });
            expectedNumber++;
          }
        }

        // If there are following lines to update, create the operations
        if (followingLines.length > 0) {
          const operations = followingLines.map((line) => ({
            range: new monaco.Range(
              line.lineNumber,
              1,
              line.lineNumber,
              line.content.length + 1
            ),
            text: line.content.replace(
              /^\s*\d+\)/,
              `${line.indent}${line.number - 1})`
            ),
          }));

          // Let the cut happen first, then update line numbers
          setTimeout(() => {
            model.pushEditOperations([], operations, () => null);
          }, 0);
        }
      }
    }
  });
};
