import { describe, it, expect } from "vitest";
import { demuxDockerStream } from "../src/dockerClient.js";

// Helper to build a Docker multiplexed stream frame
// Frame format: [stream_type(1), 0, 0, 0, size(4 bytes BE), payload(size bytes)]
function buildFrame(streamType: number, payload: string): Buffer {
  const payloadBuf = Buffer.from(payload, "utf-8");
  const header = Buffer.alloc(8);
  header[0] = streamType; // 1=stdout, 2=stderr
  header.writeUInt32BE(payloadBuf.length, 4);
  return Buffer.concat([header, payloadBuf]);
}

describe("demuxDockerStream", () => {
  it("extracts a single stdout frame", () => {
    const frame = buildFrame(1, "hello world");
    expect(demuxDockerStream(frame)).toBe("hello world");
  });

  it("filters out stderr frames", () => {
    const frame = buildFrame(2, "error output");
    expect(demuxDockerStream(frame)).toBe("");
  });

  it("extracts only stdout from mixed stdout/stderr", () => {
    const buf = Buffer.concat([
      buildFrame(1, "out1"),
      buildFrame(2, "err1"),
      buildFrame(1, "out2"),
    ]);
    expect(demuxDockerStream(buf)).toBe("out1out2");
  });

  it("concatenates multiple stdout frames", () => {
    const buf = Buffer.concat([
      buildFrame(1, "line1\n"),
      buildFrame(1, "line2\n"),
      buildFrame(1, "line3"),
    ]);
    expect(demuxDockerStream(buf)).toBe("line1\nline2\nline3");
  });

  it("returns empty string for empty buffer", () => {
    expect(demuxDockerStream(Buffer.alloc(0))).toBe("");
  });

  it("handles truncated header gracefully (< 8 bytes)", () => {
    const partial = Buffer.alloc(5);
    expect(demuxDockerStream(partial)).toBe("");
  });

  it("stops at truncated payload (size > remaining bytes)", () => {
    // Header says 100 bytes payload, but only 5 are present
    const header = Buffer.alloc(8);
    header[0] = 1;
    header.writeUInt32BE(100, 4);
    const buf = Buffer.concat([header, Buffer.from("short")]);
    expect(demuxDockerStream(buf)).toBe("");
  });

  it("preserves multi-line output with newlines", () => {
    const content = '{\n  "name": "test",\n  "version": "1.0"\n}';
    const frame = buildFrame(1, content);
    expect(demuxDockerStream(frame)).toBe(content);
  });

  it("handles large payload correctly", () => {
    const bigContent = "x".repeat(10000);
    const frame = buildFrame(1, bigContent);
    expect(demuxDockerStream(frame)).toBe(bigContent);
  });

  it("handles frame after truncated frame", () => {
    // First frame: valid, second frame: truncated header at end
    const validFrame = buildFrame(1, "valid");
    const partial = Buffer.alloc(4); // Too small for a header
    const buf = Buffer.concat([validFrame, partial]);
    expect(demuxDockerStream(buf)).toBe("valid");
  });
});
