"use client"

import { useEffect, useRef, useState } from "react"
import type { Monaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"

function getFilenameFromPath(path: string): string {
  return path.split('/').pop() || path;
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  
  const langMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'html': 'html',
    'json': 'json',
    'md': 'markdown',
    'xml': 'xml',
    'sql': 'sql',
    'py': 'python',
  };
  
  return langMap[ext || ''] || 'plaintext';
}

export default function useMonacoModel() {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const modelsRef = useRef<Map<string, editor.ITextModel>>(new Map());
    const [isReady , setIsReady] = useState(false);

    function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
        editorRef.current = editor;
        monacoRef.current = monaco;

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.React,
            jsxFactory: 'React.createElement',
            reactNamespace: 'React',
            allowNonTsExtensions: true,
            allowJs: true,
            target: monaco.languages.typescript.ScriptTarget.Latest,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.ESNext,
            noEmit: true,
            esModuleInterop: true,
            skipLibCheck: true,
        });

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.React,
            jsxFactory: 'React.createElement',
            reactNamespace: 'React',
            allowNonTsExtensions: true,
            allowJs: true,
            target: monaco.languages.typescript.ScriptTarget.Latest,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.ESNext,
            noEmit: true,
            esModuleInterop: true,
        });

        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: false,
        });

        setIsReady(true);
    }

    function createModel(filename: string, content: string, language: string) {
        if(!monacoRef.current) return;

        const uri = monacoRef.current.Uri.parse(`file:///${filename}`);
        const model = monacoRef.current.editor.createModel(content, language, uri);

        modelsRef.current.set(filename , model);

        return model;
    }

    function switchToFile(filename: string) {
        if (!editorRef.current) return;
        
        const model = modelsRef.current.get(filename);
        if (model) {
            editorRef.current.setModel(model);
        }
    }

    function updateContent(filename: string, newContent: string) {
        const model = modelsRef.current.get(filename);
        if(model) {
            model.setValue(newContent);
        }
    }

    function getCurrentContent() {
        const currentModel = editorRef.current?.getModel();
        return currentModel?.getValue() || '';
    }

    function clearAllModels() {
        modelsRef.current.forEach(model => model.dispose());
        modelsRef.current.clear();
    }
      
    useEffect(() => {
        return () => {
            modelsRef.current.forEach(model => model.dispose());
            modelsRef.current.clear();
            editorRef.current?.dispose();
        };
    }, []);

    return {
        handleEditorDidMount,
        createModel,
        switchToFile,
        updateContent,
        getCurrentContent,
        clearAllModels,
        getFilenameFromPath,
        getLanguageFromPath,
        isReady,
      };
}
