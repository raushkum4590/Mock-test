/**
 * Preload (sandboxed, context-isolated). Exposes only read-only client
 * metadata to the page — no Node.js APIs, no IPC, no file system.
 */
import { contextBridge } from "electron";

function arg(name: string): string {
  const prefix = `--${name}=`;
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length) ?? "";
}

contextBridge.exposeInMainWorld("cbtClient", {
  workstationCode: arg("cbt-workstation") || null,
  kiosk: arg("cbt-kiosk") === "1",
  version: "0.1.0",
});
