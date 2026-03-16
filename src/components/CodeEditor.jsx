import Editor from "@monaco-editor/react";
import { useState } from "react";

function CodeEditor() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Write your code here");
  const [output, setOutput] = useState("");

  const runCode = () => {
    setOutput("Program executed successfully!");
  };

  return (
    <div className="flex flex-col h-full">

      {/* Top Controls */}
      <div className="flex items-center gap-4 mb-2">
        <select
          className="p-2 bg-gray-700 text-white rounded"
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">🟨 JavaScript</option>
          <option value="python">🐍 Python</option>
          <option value="java">☕ Java</option>
          <option value="c">💻 C</option>
        </select>

        <button
          onClick={runCode}
          className="bg-green-500 px-4 py-2 rounded text-white"
        >
          Run Code
        </button>
      </div>

      {/* Monaco Editor */}
      <Editor
        height="60vh"
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
      />

      {/* Output Console */}
      <div className="bg-black text-green-400 p-3 mt-2 h-32 rounded overflow-y-auto">
        {output}
      </div>

    </div>
  );
}

export default CodeEditor;