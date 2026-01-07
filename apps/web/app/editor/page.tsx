"use client"

import useMonacoModel from "@/lib/hooks/useMonacoModels";
import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useState } from "react";

interface PlanStep {
  id: number;
  type: 'file_write';
  description: string;
  path: string;
  content: string;
}

interface Plan {
  summary: string;
  estimatedTimeSeconds: number;
  steps: PlanStep[];
}

export default function EditorPage() {
  const {
    handleEditorDidMount,
    createModel,
    switchToFile,
    clearAllModels,
    getFilenameFromPath,
    getLanguageFromPath,
    isReady,
  } = useMonacoModel();
  
  const [activeFile, setActiveFile] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  function handleMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    handleEditorDidMount(editor, monaco);
  };

  const handleTabClick = (filename:string) => {
    switchToFile(filename);
    setActiveFile(filename);
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      const response = await fetch('/api/generate', { method: 'POST' });
      const plan: Plan = await response.json();

      clearAllModels();
      
      const newFilenames: string[] = [];
      
      plan.steps.forEach((step) => {
        const filename = getFilenameFromPath(step.path);
        const language = getLanguageFromPath(step.path);
        
        createModel(filename, step.content, language);
        newFilenames.push(filename);
      });
      
      setFiles(newFilenames);
      
      if (newFilenames.length > 0) {
        const firstFile = newFilenames[0]!;
        switchToFile(firstFile);
        setActiveFile(firstFile);
      }
      
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="h-screen flex flex-col">
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

      <Editor
        height="100%"
        theme="vs-dark"
        onMount={handleMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
        }}
      />

      <div className="flex gap-2 p-4 bg-gray-800 border-t border-gray-700">
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`px-4 py-2 text-white rounded transition ${
            isGenerating 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isGenerating ? 'Generating...' : 'Generate AI Code'}
        </button>
      </div>
    </div>
  )
}
