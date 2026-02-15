import http, { IncomingMessage } from "http";
import { DOCKER_SOCKET } from "./constants.js";

interface DockerRequestOptions {
  path: string;
  method: "GET" | "POST" | "DELETE";
  body?: object;
  /** If true, collect response as raw Buffer instead of string (needed for Docker exec streams). */
  raw?: boolean;
}

interface DockerResponse {
  statusCode: number;
  data: string;
  rawData?: Buffer;
}

export async function dockerRequest(
  options: DockerRequestOptions,
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
      const chunks: Buffer[] = [];

      res.on("data", (chunk: Buffer) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      res.on("end", () => {
        const rawData = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode || 0,
          data: rawData.toString("utf-8"),
          rawData,
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

/**
 * Parse Docker multiplexed stream output (used when Tty: false).
 *
 * Each frame: [stream_type(1 byte), 0, 0, 0, size(4 bytes big-endian), payload(size bytes)]
 * stream_type: 1 = stdout, 2 = stderr
 *
 * Returns only stdout content as a UTF-8 string.
 */
export function demuxDockerStream(raw: Buffer): string {
  const parts: Buffer[] = [];
  let offset = 0;

  while (offset + 8 <= raw.length) {
    const streamType = raw[offset]; // 1=stdout, 2=stderr
    const size = raw.readUInt32BE(offset + 4);
    offset += 8;

    if (offset + size > raw.length) break;

    // Only include stdout (type 1); skip stderr (type 2)
    if (streamType === 1) {
      parts.push(raw.subarray(offset, offset + size));
    }

    offset += size;
  }

  return Buffer.concat(parts).toString("utf-8");
}
