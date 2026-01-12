import { SandboxManager } from "@repo/sandbox";

export interface FileError {
  path: string;
  error: string;
  content: string;
}

export function parseErrorFiles(buildOutput: string): Map<string, string> {
  const errorMap = new Map<string, string>();
  const lines = buildOutput.split("\n");

  let currentFile: string | null = null;
  let currentError = "";

  for (const line of lines) {
    // Match standard format: ./path/file.tsx:line:col or path/file.tsx:line:col
    const standardMatch = line.match(
      /^\.?\/?(?:workspace\/)?([a-zA-Z0-9_\-\/\.]+\.(?:tsx?|jsx?|css|json)):(\d+):?(\d+)?/
    );
    
    // Match SWC error format: ./path/file.tsx (without line number on same line)
    const swcFileMatch = line.match(
      /^\.\/([a-zA-Z0-9_\-\/\.]+\.(?:tsx?|jsx?|css|json))$/
    );

    if (standardMatch) { 
      if (currentFile && currentError) {
        const existingError = errorMap.get(currentFile);
        if (existingError) {
          errorMap.set(currentFile, existingError + "\n\n" + currentError.trim());
        } else {
          errorMap.set(currentFile, currentError.trim());
        }
      }
      currentFile = `/workspace/${standardMatch[1]}`;
      currentError = line;
    } else if (swcFileMatch) {
      // SWC format: file path on one line, error details follow
      if (currentFile && currentError) {
        const existingError = errorMap.get(currentFile);
        if (existingError) {
          errorMap.set(currentFile, existingError + "\n\n" + currentError.trim());
        } else {
          errorMap.set(currentFile, currentError.trim());
        }
      }
      currentFile = `/workspace/${swcFileMatch[1]}`;
      currentError = line;
    } else if (currentFile && line.trim()) {
      currentError += "\n" + line;
    }
  }

  // Don't forget last file
  if (currentFile && currentError) {
    const existingError = errorMap.get(currentFile);
    if (existingError) {
      errorMap.set(currentFile, existingError + "\n\n" + currentError.trim());
    } else {
      errorMap.set(currentFile, currentError.trim());
    }
  }

  return errorMap;
}

export async function getFileErrors(
  containerId: string,
  buildOutput: string
): Promise<FileError[]> {
  const sandbox = SandboxManager.getInstance();
  const errorMap = parseErrorFiles(buildOutput);
  const fileErrors: FileError[] = [];

  for (const [path, error] of errorMap) {
    const content = await sandbox.readFile(containerId, path);
    fileErrors.push({
      path,
      error,
      content,
    });
  }

  return fileErrors;
}

