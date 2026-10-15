/**
 * CBT candidate client (Electron main process).
 *
 * A locked-down window onto the exam-centre server. It holds no exam data
 * and no credentials: the server is authoritative for everything. It adds:
 *  - the workstation identity header (X-CBT-Workstation) on server requests
 *  - navigation lock to the configured server origin
 *  - optional kiosk mode for managed exam PCs
 *  - a pre-flight/offline screen with automatic retry
 *
 * Configuration (first file found wins):
 *   %ProgramData%\CBTClient\cbt-client.json   (set by the centre IT team)
 *   <install dir>\cbt-client.json
 *   %AppData%\CBT Candidate\cbt-client.json
 */
import { app, BrowserWindow, Menu, session, shell } from "electron";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type ClientConfig = { serverUrl: string; workstationCode: string | null; kiosk: boolean; allowDevTools: boolean };

function loadConfig(): ClientConfig {
  const candidates = [
    join(process.env.ProgramData ?? "C:\\ProgramData", "CBTClient", "cbt-client.json"),
    join(app.getAppPath(), "..", "cbt-client.json"),
    join(app.getPath("userData"), "cbt-client.json"),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const raw = JSON.parse(readFileSync(file, "utf8")) as Partial<ClientConfig>;
    if (!raw.serverUrl) throw new Error(`${file}: serverUrl is required`);
    const url = new URL(raw.serverUrl); // throws on invalid URL
    return {
      serverUrl: url.origin,
      workstationCode: raw.workstationCode?.trim() || null,
      kiosk: raw.kiosk === true,
      allowDevTools: raw.allowDevTools === true,
    };
  }
  return { serverUrl: "http://localhost:3000", workstationCode: null, kiosk: false, allowDevTools: false };
}

let config: ClientConfig;
let win: BrowserWindow | null = null;

function offlinePage(message: string): string {
  const html = `<!doctype html><meta charset="utf-8"><title>CBT</title>
  <body style="font-family:Segoe UI,Nirmala UI,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f4f6f9">
  <div style="max-width:520px;text-align:center;background:#fff;border:1px solid #d5dbe3;border-radius:8px;padding:32px">
  <h1 style="font-size:20px">Connecting to the exam server… / परीक्षा सर्वर से जुड़ रहा है…</h1>
  <p style="color:#5b6675">${message.replace(/[<>&]/g, "")}</p>
  <p style="color:#5b6675">Server: ${config.serverUrl} · Workstation: ${config.workstationCode ?? "not configured"}</p>
  <p style="color:#5b6675">Retrying automatically. Please inform the invigilator if this persists.</p></div></body>`;
  return "data:text/html;charset=utf-8," + encodeURIComponent(html);
}

async function serverHealthy(): Promise<boolean> {
  try {
    const res = await fetch(`${config.serverUrl}/api/health`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function connect(): Promise<void> {
  if (!win) return;
  while (!(await serverHealthy())) {
    await win.loadURL(offlinePage("The exam server is not reachable on the network."));
    await new Promise((r) => setTimeout(r, 5000));
    if (!win) return;
  }
  await win.loadURL(`${config.serverUrl}/login`);
}

function hardenSession(): void {
  const ses = session.defaultSession;
  const origin = config.serverUrl;
  // Identify this PC to the server (used for workstation assignment checks
  // and monitoring). Only added to requests for the exam server.
  ses.webRequest.onBeforeSendHeaders({ urls: [`${origin}/*`] }, (details, callback) => {
    if (config.workstationCode) details.requestHeaders["X-CBT-Workstation"] = config.workstationCode;
    callback({ requestHeaders: details.requestHeaders });
  });
  // Camera only, and only for the exam server (identity photos and exam
  // monitoring). No microphone, notifications, geolocation, etc.
  const cameraOnly = (permission: string, details: { mediaTypes?: string[] }, requestingUrl: string) =>
    permission === "media" && requestingUrl.startsWith(`${origin}/`) && (details.mediaTypes ?? []).every((t) => t === "video");
  ses.setPermissionRequestHandler((_wc, permission, callback, details) =>
    callback(cameraOnly(permission, details as { mediaTypes?: string[] }, details.requestingUrl)),
  );
  ses.setPermissionCheckHandler((_wc, permission, requestingOrigin) => permission === "media" && `${requestingOrigin}/` === `${origin}/`);
  // No downloads on candidate PCs.
  ses.on("will-download", (event) => event.preventDefault());
}

function createWindow(): void {
  win = new BrowserWindow({
    width: 1366,
    height: 768,
    show: false,
    kiosk: config.kiosk,
    fullscreen: config.kiosk,
    autoHideMenuBar: true,
    title: "EdQity — CBT Candidate",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      devTools: config.allowDevTools,
      spellcheck: false,
      additionalArguments: [`--cbt-workstation=${config.workstationCode ?? ""}`, `--cbt-kiosk=${config.kiosk ? "1" : "0"}`],
    },
  });
  Menu.setApplicationMenu(null);
  // OS-level capture protection: screenshots, Snipping Tool and screen
  // recorders see a black window (Windows 10 2004+ / macOS).
  win.setContentProtection(true);
  win.once("ready-to-show", () => win?.show());

  const allowed = (url: string) => url.startsWith(`${config.serverUrl}/`) || url.startsWith("data:text/html");
  win.webContents.on("will-navigate", (event, url) => {
    if (!allowed(url)) event.preventDefault();
  });
  win.webContents.on("will-redirect", (event, url) => {
    if (!allowed(url)) event.preventDefault();
  });
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-attach-webview", (event) => event.preventDefault());

  // Block common escape/reload shortcuts inside the exam window. (Kiosk mode
  // plus Windows assigned access is needed to block OS-level shortcuts.)
  win.webContents.on("before-input-event", (event, input) => {
    const key = input.key.toLowerCase();
    const devtools = (input.control && input.shift && key === "i") || key === "f12";
    const reload = key === "f5" || (input.control && key === "r");
    if ((devtools && !config.allowDevTools) || reload || (input.control && key === "p")) event.preventDefault();
  });

  // Renderer crash or network loss: reconnect. Answers not yet acknowledged
  // are kept in the page's session storage and re-sent on reload.
  win.webContents.on("render-process-gone", () => void connect());
  win.webContents.on("did-fail-load", (_e, code, desc, url) => {
    if (url.startsWith(config.serverUrl) && code !== -3) void connect();
    else if (code !== -3) console.error("load failed", code, desc);
  });
  win.on("closed", () => {
    win = null;
  });
  void connect();
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
  app.whenReady().then(() => {
    try {
      config = loadConfig();
    } catch (err) {
      console.error(err);
      config = { serverUrl: "http://localhost:3000", workstationCode: null, kiosk: false, allowDevTools: false };
    }
    hardenSession();
    createWindow();
  });
  app.on("window-all-closed", () => app.quit());
  // External links (none expected) open in the system browser, never in-app.
  app.on("web-contents-created", (_e, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith("https://")) void shell.openExternal(url);
      return { action: "deny" };
    });
  });
}
