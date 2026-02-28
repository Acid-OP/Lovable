import { dockerRequest, demuxDockerStream } from "./dockerClient.js";
import {
  DEFAULT_IMAGE,
  CONTAINER_CONFIG,
  DOCKER_NETWORK,
} from "./constants.js";

export interface ExecResult {
  exitCode: number;
  output: string;
}

interface DockerContainer {
  Id: string;
  Names: string[];
}

/**
 * Escapes a string for safe use inside single quotes in a shell command.
 *
 * Shell single quotes treat everything as literal — no variable expansion,
 * no command substitution, nothing. The ONLY character that can break out
 * of single quotes is... a single quote itself.
 *
 * So we replace every ' with: '\''
 *   ' → close the current single-quoted string
 *   \' → insert a literal single quote (backslash-escaped, outside quotes)
 *   ' → reopen a new single-quoted string
 *
 * The shell concatenates adjacent strings automatically.
 *
 * Example: /workspace/it's here → '/workspace/it'\''s here'
 * Shell sees: '/workspace/it' + \' + 's here' = /workspace/it's here (literal)
 *
 * This makes it impossible for ANY input to execute as a command,
 * because the value never leaves the single-quoted context.
 */
function escapeShellArg(arg: string): string {
  return `'${arg.replace(/'/g, "'\\''")}'`;
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
      const containers: DockerContainer[] = JSON.parse(response.data);
      const sandboxContainers = containers.filter((c) =>
        c.Names.some((name) => name.startsWith("/sandbox-")),
      );

      for (const container of sandboxContainers) {
        // Inspect container to check if it's running
        const inspectResponse = await dockerRequest({
          path: `/containers/${container.Id}/json`,
          method: "GET",
        });
        const containerInfo = JSON.parse(inspectResponse.data);

        // Only cleanup stopped/exited containers, never touch running ones
        if (containerInfo.State?.Running === false) {
          await this.destroy(container.Id);
          console.log(
            `Cleaned up stopped sandbox container: ${container.Id.slice(0, 12)}`,
          );
        } else {
          console.log(
            `Skipping running sandbox container: ${container.Id.slice(0, 12)}`,
          );
        }
      }
    } catch (error) {
      console.warn("Failed to cleanup old containers:", error);
    }
  }

  public async createContainer(
    jobId: string,
    exposePort?: number,
  ): Promise<string> {
    const containerName = `sandbox-${jobId}`;

    // Check if container with this name already exists (from failed previous attempt)
    // If it does, destroy it before creating new one to avoid name conflict
    try {
      // Check if container exists (don't need response data, just checking if request succeeds)
      await dockerRequest({
        path: `/containers/${containerName}/json`,
        method: "GET",
      });
      // Container exists! Destroy it before creating new one
      console.log(
        `Container ${containerName} already exists (from previous attempt), removing it...`,
      );
      await dockerRequest({
        path: `/containers/${containerName}?force=true`,
        method: "DELETE",
      });
      console.log(`Removed existing container ${containerName}`);
    } catch (error: any) {
      if (error.statusCode !== 404) {
        console.warn(
          `Error checking for existing container ${containerName}:`,
          error,
        );
      }
    }

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
        "traefik.enable": "true",
        [`traefik.http.routers.${containerName}.rule`]: `Host(\`${containerName}.localhost\`)`,
        [`traefik.http.routers.${containerName}.entrypoints`]: "web",
        [`traefik.http.services.${containerName}.loadbalancer.server.port`]:
          "3000",
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

  public async exec(
    containerId: string,
    command: string,
    workingDir?: string,
  ): Promise<ExecResult> {
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

    // Start exec and get output (raw buffer to properly demux Docker stream headers)
    const startResponse = await dockerRequest({
      path: `/exec/${execId}/start`,
      method: "POST",
      body: { Detach: false, Tty: false },
      raw: true,
    });

    // Docker exec with Tty:false uses a multiplexed stream format where each
    // chunk has an 8-byte header (stream type + size). We must strip these
    // headers to get the actual stdout content.
    const output = startResponse.rawData
      ? demuxDockerStream(startResponse.rawData)
      : startResponse.data;

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

  public async writeFile(
    containerId: string,
    filePath: string,
    content: string,
  ): Promise<void> {
    const base64Content = Buffer.from(content).toString("base64");
    const safePath = escapeShellArg(filePath);
    const safeB64 = escapeShellArg(base64Content);
    const command = `mkdir -p "$(dirname ${safePath})" && echo ${safeB64} | base64 -d > ${safePath}`;

    await this.exec(containerId, command);
  }

  public async deleteFile(
    containerId: string,
    filePath: string,
  ): Promise<void> {
    await this.exec(containerId, `rm -f ${escapeShellArg(filePath)}`);
  }

  public async readFile(
    containerId: string,
    filePath: string,
  ): Promise<string> {
    try {
      const result = await this.exec(
        containerId,
        `cat ${escapeShellArg(filePath)}`,
      );
      return result.output;
    } catch {
      return "";
    }
  }

  public async runBuild(
    containerId: string,
  ): Promise<{ success: boolean; errors: string }> {
    try {
      await this.exec(containerId, "cd /workspace && pnpm build 2>&1");
      return { success: true, errors: "" };
    } catch (error) {
      return {
        success: false,
        errors: error instanceof Error ? error.message : String(error),
      };
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
