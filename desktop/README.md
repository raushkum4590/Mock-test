# CBT Candidate – Windows desktop client

An Electron shell that opens the exam-centre server's candidate login in a locked-down window. It stores no exam data and no credentials; the server is authoritative for everything.

## Build

```powershell
cd desktop
npm install
npm run build          # compile TypeScript (verified)
npm start              # run locally against the server in cbt-client.json
npm run dist           # build the Windows installer into release\ (NSIS)
```

**Status:** `npm install` and `npm run build` were verified on the development machine. `npm run dist` started packaging but stopped with `ENOSPC` because drive C: was out of space, so the installer itself has **not** yet been produced or tested. Build it on a machine with at least ~1.5 GB free.

## Configure each candidate PC

`C:\ProgramData\CBTClient\cbt-client.json` (also looked up next to the installed app, then in `%AppData%\CBT Candidate\`):

```json
{ "serverUrl": "http://192.168.1.10:3000", "workstationCode": "LAB1-PC01", "kiosk": true, "allowDevTools": false }
```

## Security configuration

- `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`, `webSecurity: true`.
- The preload exposes only `{ workstationCode, kiosk, version }`.
- Navigation and redirects are allowed only to `serverUrl`. Pop-ups, webviews and downloads are blocked. All permission requests (camera, microphone, notifications, …) are denied.
- `X-CBT-Workstation` is added only to requests for the exam server.
- Reload, print and devtools shortcuts are blocked. Kiosk mode opens full-screen without a menu. Combine it with Windows Assigned Access for OS-level lockdown (see docs/network-setup.md).
- If the server is unreachable, an offline screen retries every 5 s. On a renderer crash the client reconnects, and unsent answers are re-sent from the page's session storage.
