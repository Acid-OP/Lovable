'use client';

import { useRef } from 'react';
import Editor from '@monaco-editor/react';

export default function MyEditor() {
  const editorRef = useRef(null);
  const modelsRef = useRef(new Map());

  function handleEditorDidMount(editor: any, monaco: any) {
    // Store editor instance
    editorRef.current = editor;

    // Create models (monaco is available here!)
    const jsModel = monaco.editor.createModel(
      'console.log("JS");',
      'javascript',
      monaco.Uri.parse('file:///app.js')
    );

    // Store model
    modelsRef.current.set('app.js', jsModel);

    // Set model to editor
    editor.setModel(jsModel);
  }``

  return (
    <div className="h-screen">
      <Editor
        height="100vh"
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
    </div>
  );
}