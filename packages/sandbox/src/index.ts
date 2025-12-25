import http, { IncomingMessage } from "http";

export class SandboxManager {
  private static instance: SandboxManager;

  private constructor() {
    // Private: prevents "new SandboxManager()" from outside
  }

  public static getInstance(): SandboxManager {
    if (!this.instance) {
      this.instance = new SandboxManager();
    }
    return this.instance;
  }

  public async createContainer(jobId: string): Promise<string> {
    const containerName = `sandbox-${jobId}`;
    return new Promise((resolve, reject) => {
      const options = {
        socketPath: process.env.DOCKER_SOCKET || "//./pipe/docker_engine",
        path: `/containers/create?name=${containerName}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const body = {
        Image: process.env.SANDBOX_IMAGE || "node:20",
        Cmd: ["/bin/sh"],
        Tty: true,
        WorkingDir: "/workspace",
        HostConfig: {
          Memory: 512 * 1024 * 1024, // 512MB
        },
      };

      const req = http.request(options, (res: IncomingMessage) => {
        let data = "";

        res.on("data", (chunk: Buffer) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const response = JSON.parse(data);
            if (response.Id) {
              resolve(response.Id);
            } else {
              reject(new Error(response.message || "Failed to create container"));
            }
          } catch (err) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on("error", reject);
      req.write(JSON.stringify(body));
      req.end();
    });
  }

  public async startContainer(containerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          socketPath: process.env.DOCKER_SOCKET || "//./pipe/docker_engine",
          path: `/containers/${containerId}/start`,
          method: "POST",
        },
        (res: IncomingMessage) => {
          if (res.statusCode === 204 || res.statusCode === 304) {
            resolve();
          } else {
            reject(new Error(`Failed to start container: ${res.statusCode}`));
          }
        }
      );

      req.on("error", reject);
      req.end();
    });
  }

  public async exec(containerId: string, command: string): Promise<void> {
    // TODO: Docker API call to exec command
    console.log(`Executing in ${containerId}: ${command}`);
  }

  public async destroy(containerId: string): Promise<void> {
    // TODO: Docker API call to remove container
    console.log(`Destroying container: ${containerId}`);
  }
}
