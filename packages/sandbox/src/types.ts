export interface ExecResult {
  exitCode: number;
  output: string;
}

export interface BuildResult {
  success: boolean;
  errors: string;
}

/**
 * Provider-agnostic interface for sandbox operations.
 *
 * Implementations can target Docker (local dev), Kubernetes Pods (production),
 * E2B sandboxes, Fly Machines, or any other container runtime.
 */
export interface SandboxInfo {
  id: string;
  jobId: string;
  running: boolean;
  createdAt?: string;
}

export interface ISandboxProvider {
  create(jobId: string): Promise<string>;
  start(id: string): Promise<void>;
  exec(
    id: string,
    command: string,
    workingDir?: string,
    timeoutMs?: number,
  ): Promise<ExecResult>;
  writeFile(id: string, filePath: string, content: string): Promise<void>;
  readFile(id: string, filePath: string): Promise<string>;
  deleteFile(id: string, filePath: string): Promise<void>;
  runBuild(id: string): Promise<BuildResult>;
  startDevServer(id: string): Promise<void>;
  destroy(id: string): Promise<void>;
  cleanup(): Promise<void>;
  list(): Promise<SandboxInfo[]>;
}
