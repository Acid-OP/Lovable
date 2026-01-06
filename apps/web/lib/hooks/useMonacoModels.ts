"use client"

import { useEffect, useRef, useState } from "react"
import type { Monaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"

export default function useMonacoModel() {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const modelsRef = useRef<Map<string, editor.ITextModel>>(new Map());
    const [isReady , setIsReady] = useState(false);

    function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
        editorRef.current = editor;
        monacoRef.current = monaco;
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
      
    useEffect(() => {
        return () => {
            // Dispose all models
            modelsRef.current.forEach(model => model.dispose());
            modelsRef.current.clear();
            
            // Dispose editor
            editorRef.current?.dispose();
        };
    }, []);

    return {
        handleEditorDidMount,
        createModel,
        switchToFile,
        updateContent,
        getCurrentContent,
        isReady,
      };
}