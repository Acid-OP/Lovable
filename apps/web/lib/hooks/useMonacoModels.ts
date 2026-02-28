"use client";

import { useEffect, useRef, useState } from "react";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

function getFilenameFromPath(path: string): string {
  return path.split("/").pop() || path;
}

function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();

  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    css: "css",
    scss: "scss",
    sass: "sass",
    html: "html",
    json: "json",
    md: "markdown",
    xml: "xml",
    sql: "sql",
    py: "python",
  };

  return langMap[ext || ""] || "plaintext";
}

export default function useMonacoModel() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const modelsRef = useRef<Map<string, editor.ITextModel>>(new Map());
  const [isReady, setIsReady] = useState(false);

  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Compiler options for TypeScript
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: "React.createElement",
      reactNamespace: "React",
      allowNonTsExtensions: true,
      allowJs: true,
      target: monaco.languages.typescript.ScriptTarget.Latest,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      skipLibCheck: true,
      noLib: false,
      allowSyntheticDefaultImports: true,
    });

    // Compiler options for JavaScript
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: "React.createElement",
      reactNamespace: "React",
      allowNonTsExtensions: true,
      allowJs: true,
      target: monaco.languages.typescript.ScriptTarget.Latest,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
    });

    // COMPLETELY disable all diagnostics and error displays
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true, // No semantic errors
      noSyntaxValidation: true, // No syntax errors either
      noSuggestionDiagnostics: true, // No suggestions
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    });

    // Disable eager model sync to prevent validation
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(false);
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(false);

    setIsReady(true);
  }

  function createModel(filename: string, content: string, language: string) {
    if (!monacoRef.current) {
      return;
    }

    // If model already exists for this file, update its content instead of creating a duplicate
    const existing = modelsRef.current.get(filename);
    if (existing && !existing.isDisposed()) {
      existing.setValue(content);
      return existing;
    }

    const uri = monacoRef.current.Uri.parse(`file:///${filename}`);
    const model = monacoRef.current.editor.createModel(content, language, uri);

    modelsRef.current.set(filename, model);

    return model;
  }

  function switchToFile(filename: string) {
    if (!editorRef.current) {
      return;
    }

    const model = modelsRef.current.get(filename);

    if (model) {
      editorRef.current.setModel(model);
    }
  }

  function updateContent(filename: string, newContent: string) {
    const model = modelsRef.current.get(filename);
    if (model) {
      model.setValue(newContent);
    }
  }

  function getCurrentContent() {
    const currentModel = editorRef.current?.getModel();
    return currentModel?.getValue() || "";
  }

  function clearAllModels() {
    modelsRef.current.forEach((model) => model.dispose());
    modelsRef.current.clear();
  }

  useEffect(() => {
    const models = modelsRef.current;
    const editor = editorRef.current;

    return () => {
      models.forEach((model) => model.dispose());
      models.clear();
      editor?.dispose();
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
