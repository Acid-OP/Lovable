import { dockerRequest } from "./dockerClient.js";
import { DEFAULT_IMAGE, CONTAINER_CONFIG, DOCKER_NETWORK } from "./constants.js";

export interface ExecResult {
  exitCode: number;
  output: string;
}

export class SandboxManager {
  private static instance: SandboxManager;

  private constructor() {}

  public static getInstance(): SandboxManager {
    if (!this.instance) {
      this.instance = new SandboxManager();
    }
    return this.instance;
  }

  public async cleanupOldContainers(): Promise<void> {
    try {
      const response = await dockerRequest({
        path: `/containers/json?all=true`,
        method: "GET",
      });
      const containers = JSON.parse(response.data);
      const sandboxContainers = containers.filter((c: any) =>
        c.Names.some((name: string) => name.startsWith("/sandbox-"))
      );

      for (const container of sandboxContainers) {
        await this.destroy(container.Id);
        console.log(`Cleaned up old sandbox container: ${container.Id.slice(0, 12)}`);
      }
    } catch (error) {
      console.warn("Failed to cleanup old containers:", error);
    }
  }

  public async createContainer(jobId: string, exposePort?: number): Promise<string> {
    const containerName = `sandbox-${jobId}`;

    const body = {
      Image: DEFAULT_IMAGE,
      Cmd: ["/bin/sh"],
      Tty: true,
      WorkingDir: CONTAINER_CONFIG.WORKING_DIR,
      ExposedPorts: {
        "3000/tcp": {},
      },
      HostConfig: {
        Memory: CONTAINER_CONFIG.MEMORY_LIMIT,
        // No PortBindings - using Docker network instead
      },
      NetworkingConfig: {
        EndpointsConfig: {
          [DOCKER_NETWORK]: {
            Aliases: [containerName],
          },
        },
      },
      Labels: {
        jobId: jobId,
        type: "sandbox",
      },
    };

    const response = await dockerRequest({
      path: `/containers/create?name=${containerName}`,
      method: "POST",
      body,
    });

    const parsed = JSON.parse(response.data);

    if (parsed.Id) {
      return parsed.Id;
    }

    throw new Error(parsed.message || "Failed to create container");
  }

  public async startContainer(containerId: string): Promise<void> {
    const response = await dockerRequest({
      path: `/containers/${containerId}/start`,
      method: "POST",
    });

    if (response.statusCode !== 204 && response.statusCode !== 304) {
      throw new Error(`Failed to start container: ${response.statusCode}`);
    }
  }

  public async exec(containerId: string, command: string, workingDir?: string): Promise<ExecResult> {
    // creating exec
    const createResponse = await dockerRequest({
      path: `/containers/${containerId}/exec`,
      method: "POST",
      body: {
        Cmd: ["sh", "-c", command],
        AttachStdout: true,
        AttachStderr: true,
        WorkingDir: workingDir || CONTAINER_CONFIG.WORKING_DIR,
      },
    });

    const execData = JSON.parse(createResponse.data);
    if (!execData.Id) {
      throw new Error(execData.message || "Failed to create exec");
    }

    const execId = execData.Id;

    // Start exec and get output
    const startResponse = await dockerRequest({
      path: `/exec/${execId}/start`,
      method: "POST",
      body: { Detach: false, Tty: false },
    });

    const output = startResponse.data;

    // exit code
    const inspectResponse = await dockerRequest({
      path: `/exec/${execId}/json`,
      method: "GET",
    });

    const inspectData = JSON.parse(inspectResponse.data);
    const exitCode = inspectData.ExitCode ?? 0;

    if (exitCode !== 0) {
      throw new Error(`Command failed with exit code ${exitCode}: ${output}`);
    }

    return { exitCode, output };
  }

  public async writeFile(containerId: string, filePath: string, content: string): Promise<void> {
    const base64Content = Buffer.from(content).toString("base64");
    const command = `mkdir -p "$(dirname '${filePath}')" && echo '${base64Content}' | base64 -d > '${filePath}'`;

    await this.exec(containerId, command);
  }

  public async deleteFile(containerId: string, filePath: string): Promise<void> {
    await this.exec(containerId, `rm -f '${filePath}'`);
  }

  public async readFile(containerId: string, filePath: string): Promise<string> {
    try {
      const result = await this.exec(containerId, `cat '${filePath}'`);
      return result.output;
    } catch {
      return ""; 
    }
  }

  public async runBuild(containerId: string): Promise<{ success: boolean; errors: string }> {
    try {
      await this.exec(containerId, "cd /workspace && pnpm build 2>&1");
      return { success: true, errors: "" };
    } catch (error: any) {
      return { success: false, errors: error.message || String(error) };
    }
  }

  public async startDevServer(containerId: string): Promise<void> {
    const command = `cd /workspace && nohup pnpm exec next dev -H 0.0.0.0 -p 3000 > /tmp/dev.log 2>&1 &`;
    
    await dockerRequest({
      path: `/containers/${containerId}/exec`,
      method: "POST",
      body: {
        Cmd: ["sh", "-c", command],
        AttachStdout: false,
        AttachStderr: false,
        Detach: true,
      },
    }).then(async (res) => {
      const execData = JSON.parse(res.data);
      if (execData.Id) {
        await dockerRequest({
          path: `/exec/${execData.Id}/start`,
          method: "POST",
          body: { Detach: true, Tty: false },
        });
      }
    });
  }

  public async destroy(containerId: string): Promise<void> {
    const response = await dockerRequest({
      path: `/containers/${containerId}?force=true`,
      method: "DELETE",
    });

    if (response.statusCode !== 204 && response.statusCode !== 404) {
      throw new Error(`Failed to destroy container: ${response.statusCode}`);
    }
  }
}
