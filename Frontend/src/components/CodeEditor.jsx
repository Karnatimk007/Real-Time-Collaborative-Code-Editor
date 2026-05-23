import Editor from "@monaco-editor/react";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../store/authStore";
import { toast } from "sonner";

function CodeEditor({ socket, roomId, onCodeChange, onLangChange, defaultCodes, initialCode, initialLanguage }) {

  const [language, setLanguage] = useState(initialLanguage || "javascript");
  const [code, setCode] = useState(initialCode || "// Write your code here");
  const [editingUser, setEditingUser] = useState(null);
  const editingTimerRef = useRef(null);

  // Keep a map of code written per language using useRef to prevent redundant state updates
  const languageCodeMapRef = useRef({
    [initialLanguage || "javascript"]: initialCode || "// Write your code here"
  });

  // Track the active language synchronously to prevent async React state batching race conditions
  const currentLanguageRef = useRef(initialLanguage || "javascript");

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef({});
  const { currentUser } = useAuth();

  // Receive code + initial load from server
  useEffect(() => {
    const handleCodeUpdate = (data) => {
      // Handle both old format (just code string) and new format (object with code and username)
      const newCode = typeof data === 'string' 
        ? data 
        : (data && typeof data.code === 'string' ? data.code : "");
      const username = typeof data === 'object' ? data?.username : null;

      setCode(newCode);
      onCodeChange?.(newCode);
      languageCodeMapRef.current[currentLanguageRef.current] = newCode;

      // Show editing user
      if (username && username !== currentUser?.username) {
        setEditingUser(username);
        
        // Clear the editing indicator after 2 seconds of inactivity
        clearTimeout(editingTimerRef.current);
        editingTimerRef.current = setTimeout(() => {
          setEditingUser(null);
        }, 2000);
      }
    };
    const handleLoadCode = ({ code: loadedCode, language: loadedLang }) => {
      const finalCode = (loadedCode !== undefined && loadedCode !== null)
        ? loadedCode
        : ((defaultCodes && defaultCodes[loadedLang]) || "// Write your code here");
      setCode(finalCode);
      onCodeChange?.(finalCode);

      if (loadedLang) {
        setLanguage(loadedLang);
        onLangChange?.(loadedLang);
        currentLanguageRef.current = loadedLang;
        languageCodeMapRef.current[loadedLang] = finalCode;
      }
    };
    socket.on("code-update", handleCodeUpdate);
    socket.on("load-code", handleLoadCode);
    return () => {
      socket.off("code-update", handleCodeUpdate);
      socket.off("load-code", handleLoadCode);
      clearTimeout(editingTimerRef.current);
    };
  }, [socket, onCodeChange, onLangChange, defaultCodes]);

  // Receive language updates
  useEffect(() => {
    const handleLangUpdate = (lang) => {
      const oldLang = currentLanguageRef.current;
      languageCodeMapRef.current[oldLang] = code;

      currentLanguageRef.current = lang;
      setLanguage(lang);
      onLangChange?.(lang);

      toast.info(`Language changed to ${lang.toUpperCase()}`, {
        icon: "💻",
      });
    };
    socket.on("language-update", handleLangUpdate);
    return () => socket.off("language-update", handleLangUpdate);
  }, [socket, onLangChange, code]);

  //  Send code changes
  const handleChange = (value) => {
    setCode(value);
    onCodeChange?.(value);
    socket.emit("code-change", { 
      roomId, 
      code: value,
      username: currentUser?.username
    });
    languageCodeMapRef.current[currentLanguageRef.current] = value;
  };

  //  Send language change
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    const oldLang = currentLanguageRef.current;

    // Save current code to the map under the old language FIRST
    languageCodeMapRef.current[oldLang] = code;

    // Update active language synchronously & statefully
    currentLanguageRef.current = lang;
    setLanguage(lang);
    onLangChange?.(lang);
    socket.emit("language-change", { roomId, language: lang });

    // Retrieve saved code for the new language, or fallback to the new language's default code snippet
    const restoredCode = languageCodeMapRef.current[lang] || (defaultCodes && defaultCodes[lang]) || "// Write your code here";
    setCode(restoredCode);
    onCodeChange?.(restoredCode);
    socket.emit("code-change", { 
      roomId, 
      code: restoredCode,
      username: currentUser?.username
    });

    toast.success(`Language changed to ${lang.toUpperCase()}`);
  };

  // Remote Cursor Tracking
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition((e) => {
      socket.emit("cursor-move", {
        roomId,
        username: currentUser?.username || "Guest",
        position: {
          lineNumber: e.position.lineNumber,
          column: e.position.column
        },
      });
    });
  };

  useEffect(() => {
    const handleCursorUpdate = ({ username, position }) => {
      if (!editorRef.current || !monacoRef.current) return;
      
      const monaco = monacoRef.current;

      // Inject dynamic CSS for the user's cursor label if not exists
      const styleId = `cursor-style-${username}`;
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
          .cursor-${username}::after {
            content: '${username}';
            position: absolute;
            background: var(--text-accent);
            color: var(--bg-main);
            font-size: 10px;
            font-weight: bold;
            padding: 1px 4px;
            border-radius: 4px;
            border-bottom-left-radius: 0;
            top: -15px;
            left: 2px;
            white-space: nowrap;
            pointer-events: none;
            z-index: 100;
          }
        `;
        document.head.appendChild(style);
      }

      const decoration = {
        range: new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column + 1
        ),
        options: {
          className: `remote-caret cursor-${username}`,
        }
      };

      if (!decorationsRef.current[username]) {
        decorationsRef.current[username] = editorRef.current.createDecorationsCollection();
      }
      decorationsRef.current[username].set([decoration]);
    };

    const handleUserLeft = ({ username }) => {
      if (decorationsRef.current[username]) {
        decorationsRef.current[username].clear();
        delete decorationsRef.current[username];
      }
      const styleEl = document.getElementById(`cursor-style-${username}`);
      if (styleEl) styleEl.remove();
    };

    socket.on("cursor-update", handleCursorUpdate);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("cursor-update", handleCursorUpdate);
      socket.off("user-left", handleUserLeft);
    };
  }, [socket]);

  return (
    <div className="flex flex-col h-full">
      {/* Top Controls */}
      <div className="flex items-center justify-between gap-4 px-3 py-2 bg-cyber-800 border-b border-cyber-700">
        <select
          value={language}
          onChange={handleLanguageChange}
          className="px-3 py-1.5 bg-cyber-900 border border-cyber-600 text-gray-200 text-sm rounded-lg outline-none hover:border-neon-purple transition-colors"
        >
          <option value="javascript"> JavaScript</option>
          <option value="python">Python</option>
          <option value="java"> Java</option>
          <option value="c"> C</option>
          <option value="cpp">C++</option>
          <option value="go"> Go</option>
        </select>

        {/* Editing User Indicator */}
        {editingUser && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-xs rounded-lg font-medium">
            <span className="w-2 h-2 rounded-full bg-neon-purple animate-pulse"></span>
            {editingUser} is editing...
          </div>
        )}
      </div>

      {/*  Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
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
          }}
        />
      </div>
    </div>
  );
}

export default CodeEditor;