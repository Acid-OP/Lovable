"use client"

import useMonacoModel from "@/lib/hooks/useMonacoModels";
import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useState } from "react";

export default function EditorPage() {
  const {
    handleEditorDidMount,
    createModel,
    switchToFile,
    updateContent,
    getCurrentContent,
    isReady,
  } = useMonacoModel();
  const [activeFile, setActiveFile] = useState('app.js');
  const files = ['app.js', 'style.css', 'index.html'];

  function handleMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    handleEditorDidMount(editor, monaco);

    createModel('app.js', 'console.log("JS");', 'javascript');
    createModel('style.css', 'body { }', 'css');
    createModel('index.html', '<h1>Hi</h1>', 'html');

    switchToFile('app.js');
  };

  const handleTabClick = (filename:string) => {
    switchToFile(filename);
    
    setActiveFile(filename);
  };

  const handleGenerate = async () => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Create a React counter component',
        }),
      });

      const aiCode = await response.text();
      updateContent('app.js', aiCode);
      
      console.log('AI Code generated and updated!');
    } catch (error) {
      console.error('Failed to generate code:', error);
    }
  };
  
  const handleSave = () => {
    const code = getCurrentContent();
    
    console.log('Saving:', code);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* File Tabs */}
      <div className="flex gap-1 p-2 bg-gray-900 border-b border-gray-700">
        {files.map(file => (
          <button
            key={file}
            onClick={() => handleTabClick(file)}
            className={`px-4 py-2 rounded-t transition ${
              activeFile === file 
                ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            {file}
          </button>
        ))}
      </div>

      {/* Monaco Editor */}
      <Editor
        height="100%"
        theme="vs-dark"
        onMount={handleMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
        }}
      />

      {/* Actions */}
      <div className="flex gap-2 p-4 bg-gray-800 border-t border-gray-700">
        <button 
          onClick={handleGenerate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          🤖 Generate AI Code
        </button>
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
        >
          💾 Save
        </button>
      </div>
    </div>
  )
}