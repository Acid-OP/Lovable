"use client"
import Editor from '@monaco-editor/react';

export default function CodeEditor() {
  const handleEditorChange = (value: string | undefined) => {
    console.log('Code changed:', value);
  };

  return (
    <div className="h-screen w-full">
      <Editor
        height="100vh"
        defaultLanguage="javascript"
        defaultValue={`// Welcome to Monaco Editor!
            const greeting = "Hello, World!";
            console.log(greeting);

            function add(a, b) {
            return a + b;
            }

            const result = add(5, 3);
            console.log("Result:", result);
        `}
        theme="light"
        onChange={handleEditorChange}
        options={{
          fontSize: 14,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}