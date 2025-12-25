import http, { IncomingMessage } from "http";
import { DOCKER_SOCKET } from "./constants.js";

interface DockerRequestOptions {
  path: string;
  method: "GET" | "POST" | "DELETE";
  body?: object;
}

interface DockerResponse {
  statusCode: number;
  data: string;
}

export async function dockerRequest(
  options: DockerRequestOptions
): Promise<DockerResponse> {
  return new Promise((resolve, reject) => {
    const reqOptions: http.RequestOptions = {
      socketPath: DOCKER_SOCKET,
      path: options.path,
      method: options.method,
      headers: options.body
        ? { "Content-Type": "application/json" }
        : undefined,
    };

    const req = http.request(reqOptions, (res: IncomingMessage) => {
      let data = "";

      res.on("data", (chunk: Buffer) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode || 0,
          data,
        });
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

