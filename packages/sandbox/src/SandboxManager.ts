import { dockerRequest } from "./dockerClient.js";
import { DEFAULT_IMAGE, CONTAINER_CONFIG } from "./constants.js";

export class SandboxManager {
  private static instance: SandboxManager;

  private constructor() {}

  public static getInstance(): SandboxManager {
    if (!this.instance) {
      this.instance = new SandboxManager();
    }
    return this.instance;
  }

  public async createContainer(jobId: string): Promise<string> {
    const containerName = `sandbox-${jobId}`;

    const body = {
      Image: DEFAULT_IMAGE,
      Cmd: ["/bin/sh"],
      Tty: true,
      WorkingDir: CONTAINER_CONFIG.WORKING_DIR,
      HostConfig: {
        Memory: CONTAINER_CONFIG.MEMORY_LIMIT,
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

  public async exec(containerId: string, command: string): Promise<void> {
    // TODO: Docker API call to exec command
    console.log(`Executing in ${containerId}: ${command}`);
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

