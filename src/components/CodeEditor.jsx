import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";

function CodeEditor({ socket, roomId }) {

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Write your code here");

  // 🔥 Receive code updates
  useEffect(() => {
    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });

    return () => socket.off("code-update");
  }, [socket]);

  // 🔥 Receive language updates
  useEffect(() => {
    socket.on("language-update", (lang) => {
      setLanguage(lang);
    });

    return () => socket.off("language-update");
  }, [socket]);

  // 🔥 Send code changes
  const handleChange = (value) => {
    setCode(value);

    socket.emit("code-change", {
      roomId,
      code: value,
    });
  };

  // 🔥 Send language change
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);

    socket.emit("language-change", {
      roomId,
      language: lang,
    });
  };

  return (
    <div className="flex flex-col h-full">

      {/* Top Controls */}
      <div className="flex items-center gap-4 mb-2">
        <select
          value={language}
          onChange={handleLanguageChange}
          className="p-2 bg-gray-700 text-white rounded"
        >
          <option value="javascript">🟨 JS</option>
          <option value="python">🐍 Python</option>
          <option value="java">☕ Java</option>
          <option value="c">💻 C</option>
        </select>
      </div>

      {/* 🔥 Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleChange}
          theme="vs-dark"
        />
      </div>

    </div>
  );
}

export default CodeEditor;