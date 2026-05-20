import Editor from "@monaco-editor/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { LANGUAGE_CATALOG, LANGUAGE_BY_ID } from "../constants/languages";

const cursorColors = [
  "#66fcf1",
  "#c678dd",
  "#f59e0b",
  "#22c55e",
  "#38bdf8",
  "#f472b6",
  "#a3e635",
  "#fb7185",
];

const safeClassName = (value) => String(value || "user").replace(/[^a-zA-Z0-9_-]/g, "-");

const colorForUser = (key) => {
  const text = String(key || "");
  const hash = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return cursorColors[hash % cursorColors.length];
};

function CodeEditor({ socket, roomId, onCodeChange, onLangChange, defaultCodes, initialCode, initialLanguage }) {
  const [language, setLanguage] = useState(initialLanguage || "javascript");
  const [code, setCode] = useState(initialCode || "// Write your code here");
  const languageCodeMapRef = useRef({
    [initialLanguage || "javascript"]: initialCode || "// Write your code here",
  });
  const currentLanguageRef = useRef(initialLanguage || "javascript");
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef({});

  const activeLanguage = useMemo(
    () => LANGUAGE_BY_ID[language] || LANGUAGE_BY_ID.javascript,
    [language]
  );

  useEffect(() => {
    const handleCodeUpdate = (newCode) => {
      if (typeof newCode !== "string") return;
      setCode(newCode);
      onCodeChange?.(newCode);
      languageCodeMapRef.current[currentLanguageRef.current] = newCode;
    };

    const handleLoadCode = ({ code: loadedCode, language: loadedLang }) => {
      const finalLang = LANGUAGE_BY_ID[loadedLang] ? loadedLang : "javascript";
      const finalCode = loadedCode || defaultCodes?.[finalLang] || "// Write your code here";

      currentLanguageRef.current = finalLang;
      languageCodeMapRef.current[finalLang] = finalCode;
      setLanguage(finalLang);
      setCode(finalCode);
      onCodeChange?.(finalCode);
      onLangChange?.(finalLang);
    };

    socket.on("code-update", handleCodeUpdate);
    socket.on("load-code", handleLoadCode);
    return () => {
      socket.off("code-update", handleCodeUpdate);
      socket.off("load-code", handleLoadCode);
    };
  }, [socket, onCodeChange, onLangChange, defaultCodes]);

  useEffect(() => {
    const handleLangUpdate = (lang) => {
      if (!LANGUAGE_BY_ID[lang]) return;
      languageCodeMapRef.current[currentLanguageRef.current] = code;
      currentLanguageRef.current = lang;
      setLanguage(lang);
      onLangChange?.(lang);
      toast.info(`Language changed to ${LANGUAGE_BY_ID[lang].label}`);
    };

    socket.on("language-update", handleLangUpdate);
    return () => socket.off("language-update", handleLangUpdate);
  }, [socket, onLangChange, code]);

  const handleChange = (value = "") => {
    setCode(value);
    onCodeChange?.(value);
    languageCodeMapRef.current[currentLanguageRef.current] = value;
    socket.emit("code-change", { roomId, code: value });
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    const oldLang = currentLanguageRef.current;
    languageCodeMapRef.current[oldLang] = code;

    currentLanguageRef.current = lang;
    setLanguage(lang);
    onLangChange?.(lang);
    socket.emit("language-change", { roomId, language: lang });

    const restoredCode = languageCodeMapRef.current[lang] || defaultCodes?.[lang] || "// Write your code here";
    setCode(restoredCode);
    onCodeChange?.(restoredCode);
    socket.emit("code-change", { roomId, code: restoredCode });
    toast.success(`Language changed to ${LANGUAGE_BY_ID[lang]?.label || lang}`);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition((e) => {
      socket.emit("cursor-move", {
        roomId,
        position: {
          lineNumber: e.position.lineNumber,
          column: e.position.column,
        },
      });
    });
  };

  useEffect(() => {
    const handleCursorUpdate = ({ socketId, username, position }) => {
      if (!editorRef.current || !monacoRef.current || !position) return;

      const key = safeClassName(socketId || username);
      const color = colorForUser(socketId || username);
      const styleId = `remote-cursor-style-${key}`;

      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          .remote-caret-${key} {
            border-left: 2px solid ${color};
            height: 1.25em;
          }
          .remote-caret-${key}::after {
            content: "${String(username || "Guest").replace(/"/g, '\\"')}";
            position: absolute;
            background: ${color};
            color: #0B0C10;
            font-size: 10px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 4px;
            top: -16px;
            left: 2px;
            white-space: nowrap;
            pointer-events: none;
            z-index: 100;
          }
        `;
        document.head.appendChild(style);
      }

      if (!decorationsRef.current[key]) {
        decorationsRef.current[key] = editorRef.current.createDecorationsCollection();
      }

      decorationsRef.current[key].set([
        {
          range: new monacoRef.current.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
          options: {
            className: `remote-caret-${key}`,
            stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        },
      ]);
    };

    const clearCursor = ({ socketId, username }) => {
      const key = safeClassName(socketId || username);
      decorationsRef.current[key]?.clear();
      delete decorationsRef.current[key];
      document.getElementById(`remote-cursor-style-${key}`)?.remove();
    };

    socket.on("cursor-update", handleCursorUpdate);
    socket.on("user-left", clearCursor);

    return () => {
      socket.off("cursor-update", handleCursorUpdate);
      socket.off("user-left", clearCursor);
      Object.values(decorationsRef.current).forEach((collection) => collection.clear());
      decorationsRef.current = {};
    };
  }, [socket]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-3 py-2 bg-cyber-800 border-b border-cyber-700">
        <select
          value={language}
          onChange={handleLanguageChange}
          className="px-3 py-1.5 bg-cyber-900 border border-cyber-600 text-gray-200 text-sm rounded-lg outline-none hover:border-neon-purple transition-colors"
        >
          {LANGUAGE_CATALOG.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-cyber-500 font-mono">
          Run supported
        </span>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          language={activeLanguage.monacoId}
          value={code}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: '"JetBrains Mono", monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            lineNumbers: "on",
            renderLineHighlight: "all",
            cursorBlinking: "smooth",
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}

export default CodeEditor;
