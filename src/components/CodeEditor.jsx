import Editor from "@monaco-editor/react";

function CodeEditor() {
  return (
    <div className="h-full">
      <h2 className="text-lg font-bold mb-3 text-white">Code Editor</h2>

      <Editor
        height="80vh"
        defaultLanguage="javascript"
        defaultValue="// Write your code here"
        theme="vs-dark"
      />
    </div>
  );
}

export default CodeEditor;